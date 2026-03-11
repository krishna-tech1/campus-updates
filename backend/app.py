import os
import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import FastAPI, Request, Form, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from authlib.integrations.starlette_client import OAuth
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

from database import engine, SessionLocal
from models import Base, Post

load_dotenv()

# Initialize Database
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Campus Updates API")

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173") # Vite default port

# Middleware
app.add_middleware(
    SessionMiddleware,
    secret_key=SECRET_KEY
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# OAuth Setup
oauth = OAuth()
oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Logic to clean expired posts
def cleanup_expired_posts(db):
    now = datetime.now(timezone.utc)
    expired_posts = db.query(Post).filter(Post.expires_at <= now).all()
    for post in expired_posts:
        if post.image:
            image_path = os.path.join(UPLOAD_DIR, post.image)
            if os.path.exists(image_path):
                os.remove(image_path)
        db.delete(post)
    db.commit()

@app.get("/")
async def root():
    return {"status": "online", "message": "Campus Updates API is running. Use /api prefix for routes."}

# --- Auth Routes ---
@app.get("/api/auth/login")
async def login(request: Request):
    redirect_uri = request.url_for("auth_callback")
    # Force HTTPS in production if needed
    if request.url.scheme == "https":
        redirect_uri = str(redirect_uri).replace("http://", "https://")
    return await oauth.google.authorize_redirect(request, redirect_uri)

@app.get("/api/auth/callback")
async def auth_callback(request: Request):
    try:
        token = await oauth.google.authorize_access_token(request)
        user = token.get("userinfo")
        if not user:
            user = await oauth.google.parse_id_token(request, token)
            
        request.session["user"] = {
            "name": user.get("name"),
            "email": user.get("email"),
            "picture": user.get("picture")
        }
        return RedirectResponse(url=f"{FRONTEND_URL}/auth-success")
    except Exception as e:
        return RedirectResponse(url=f"{FRONTEND_URL}/login?error={str(e)}")

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
        
    if post.author_email != user["email"]:
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
