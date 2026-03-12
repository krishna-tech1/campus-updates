import os
import uuid
import random
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import FastAPI, Request, Form, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from starlette.middleware.proxy_headers import ProxyHeadersMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

from database import engine, SessionLocal
from models import Base, Post, User
from email_service import send_otp_email
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
load_dotenv()

# Initialize Database
Base.metadata.create_all(bind=engine)

# Create Admin User if doesn't exist
def create_admin_user():
    db = SessionLocal()
    try:
        admin_email = os.getenv("ADMIN_EMAIL", "admin@campus.com")
        admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
        
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            admin = User(
                name="System Admin",
                email=admin_email,
                hashed_password=pwd_context.hash(admin_password),
                is_verified=True,
                role="admin"
            )
            db.add(admin)
            db.commit()
            print(f"Admin user created: {admin_email}")
    finally:
        db.close()

create_admin_user()

app = FastAPI(title="Campus Updates API")

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173") # Vite default port

# Sanitize and setup origins
allowed_origins = [
    os.getenv("FRONTEND_URL", "https://campus-updates.vercel.app"),
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173"
]

# Ensure no trailing slashes in origins
allowed_origins = [origin.rstrip("/") for origin in allowed_origins if origin]

app.add_middleware(ProxyHeadersMiddleware, trusted_hosts="*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    SessionMiddleware,
    secret_key=SECRET_KEY,
    same_site="none",
    https_only=True,
    max_age=3600
)

# Static files for uploads
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Password Utilities
def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Logic to clean expired posts
def cleanup_expired_posts(db):
    try:
        now = datetime.now(timezone.utc)
        expired_posts = db.query(Post).filter(Post.expires_at <= now).all()
        for post in expired_posts:
            if post.image:
                image_path = os.path.join(UPLOAD_DIR, post.image)
                if os.path.exists(image_path):
                    try:
                        os.remove(image_path)
                    except:
                        pass
            db.delete(post)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Cleanup error: {e}")

@app.get("/")
async def root():
    return {"status": "online", "message": "Campus Updates API is running. Use /api prefix for routes."}

# --- Auth Routes ---
@app.post("/api/auth/register")
async def register(
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    db=Depends(get_db)
):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        if existing_user.is_verified:
            raise HTTPException(status_code=400, detail="Email already registered")
        db.delete(existing_user) # Cleanup unverified
        db.commit()

    otp = str(random.randint(100000, 999999))
    expiry = datetime.now(timezone.utc) + timedelta(minutes=10)
    
    new_user = User(
        name=name,
        email=email,
        hashed_password=get_password_hash(password),
        otp=otp,
        otp_expiry=expiry,
        is_verified=False
    )
    
    db.add(new_user)
    db.commit()
    
    if send_otp_email(email, otp, name):
        return {"message": "OTP sent to your email"}
    else:
        raise HTTPException(status_code=500, detail="Failed to send OTP email")

@app.post("/api/auth/verify")
async def verify_otp(
    email: str = Form(...),
    otp: str = Form(...),
    db=Depends(get_db)
):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.otp != otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    if datetime.now(timezone.utc) > user.otp_expiry.replace(tzinfo=timezone.utc):
        raise HTTPException(status_code=400, detail="OTP expired")
    
    user.is_verified = True
    user.otp = None
    user.otp_expiry = None
    db.commit()
    
    return {"message": "Email verified successfully. You can now login."}

@app.post("/api/auth/login")
async def login(
    request: Request,
    email: str = Form(...),
    password: str = Form(...),
    db=Depends(get_db)
):
    user = db.query(User).filter(User.email == email).first()
    if not user or not user.is_verified:
         raise HTTPException(status_code=401, detail="Invalid credentials or email not verified")
    
    if not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    request.session["user"] = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "picture": None # No picture for regular login yet
    }
    return {"message": "Login successful", "user": request.session["user"]}

@app.get("/api/auth/me")
async def get_me(request: Request):
    user = request.session.get("user")
    if not user:
        return JSONResponse(content={"authenticated": False}, status_code=401)
    return {"authenticated": True, "user": user}

@app.get("/api/auth/logout")
async def logout(request: Request):
    request.session.clear()
    return {"message": "Logged out"}

# --- Post Routes ---
@app.get("/api/posts")
async def get_posts(db=Depends(get_db)):
    cleanup_expired_posts(db)
    posts = db.query(Post).filter(Post.expires_at > datetime.now(timezone.utc)).order_by(Post.id.desc()).all()
    return posts

@app.post("/api/posts")
async def create_post(
    request: Request,
    description: str = Form(...),
    image: UploadFile = File(None),
    db=Depends(get_db)
):
    user = request.session.get("user")
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")

    image_filename = None
    if image and image.filename:
        ext = image.filename.split(".")[-1]
        image_filename = f"{uuid.uuid4()}.{ext}"
        image_path = os.path.join(UPLOAD_DIR, image_filename)
        with open(image_path, "wb") as f:
            f.write(await image.read())

    new_post = Post(
        description=description,
        image=image_filename,
        author_name=user["name"],
        author_email=user["email"],
        created_at=datetime.now(timezone.utc),
        expires_at=datetime.now(timezone.utc) + timedelta(days=7)
    )

    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return new_post

@app.get("/api/my-posts")
async def get_my_posts(request: Request, db=Depends(get_db)):
    user = request.session.get("user")
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    posts = db.query(Post).filter(Post.author_email == user["email"]).order_by(Post.id.desc()).all()
    return posts

@app.delete("/api/posts/{post_id}")
async def delete_post(post_id: int, request: Request, db=Depends(get_db)):
    user = request.session.get("user")
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")

    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    if post.author_email != user["email"] and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")

    if post.image:
        image_path = os.path.join(UPLOAD_DIR, post.image)
        if os.path.exists(image_path):
            os.remove(image_path)

    db.delete(post)
    db.commit()
    return {"message": "Post deleted"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
