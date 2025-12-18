from database import SessionLocal
from models import Post
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from datetime import datetime, timedelta
from fastapi import Form
from authlib.integrations.starlette_client import OAuth
from fastapi.responses import RedirectResponse
from starlette.middleware.sessions import SessionMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi import UploadFile, File        
import uuid
from dotenv import load_dotenv
load_dotenv()

import os


app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")



def cleanup_expired_posts(db):
    now = datetime.utcnow()

    expired_posts = db.query(Post).filter(Post.expires_at <= now).all()

    for post in expired_posts:
        if post.image:
            image_path = f"static/uploads/{post.image}"
            if os.path.exists(image_path):
                os.remove(image_path)

        db.delete(post)

    db.commit()


app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SECRET_KEY")
)


oauth = OAuth()
oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

print("CLIENT ID:", os.getenv("GOOGLE_CLIENT_ID"))
print("SECRET KEY SET:", bool(os.getenv("SECRET_KEY")))


templates = Jinja2Templates(directory="./templates")


@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    db = SessionLocal()
    
    #cleaning up expired posts
    cleanup_expired_posts(db)

    posts = (
        db.query(Post)
        .filter(Post.expires_at > datetime.utcnow())
        .order_by(Post.id.desc())
        .all()
    )

    db.close()

    return templates.TemplateResponse(
        "ht.html",
        {"request": request, "posts": posts}
    )


@app.get("/add-test-post")
def add_test_post():
    db = SessionLocal()

    new_post = Post(
        description="TEST POST – SHOULD SHOW",
        created_at=datetime.utcnow(),
        expires_at=datetime.utcnow() + timedelta(days=7)
    )

    db.add(new_post)
    db.commit()
    db.close()

    return {"status": "Post added"}


@app.get("/new-post", response_class=HTMLResponse)
def new_post(request: Request):
    user = request.session.get("user")
    if not user:
        return RedirectResponse("/login")

    return templates.TemplateResponse(
        "create_post.html",
        {"request": request}
    )


@app.post("/create-post")
def create_post(
    request: Request,
    description: str = Form(...),
    image: UploadFile = File(None)
):
    if not request.session.get("user"):
        return RedirectResponse("/login", status_code=303)

    image_filename = None

    if image:
        ext = image.filename.split(".")[-1]
        image_filename = f"{uuid.uuid4()}.{ext}"
        image_path = f"static/uploads/{image_filename}"

        with open(image_path, "wb") as f:
            f.write(image.file.read())

    db = SessionLocal()

    now = datetime.utcnow() + timedelta(hours=5, minutes=30)
    if len(description.strip()) < 5:
        return RedirectResponse("/new-post", status_code=303)
    if len(description) > 500:
        return RedirectResponse("/new-post", status_code=303)

    new_post = Post(
        description=description,
        image=image_filename,
        created_at=now,
        expires_at=now + timedelta(days=7)
    )

    db.add(new_post)
    db.commit()
    db.close()

    return RedirectResponse("/", status_code=303)

#@app.get("/clear-posts")
#def clear_posts():
    #db = SessionLocal()
    #db.query(Post).delete()
    #db.commit()
    #db.close()
#return {"status": "All posts deleted"}

@app.get("/login")
async def login(request: Request):
    redirect_uri = request.url_for("auth_callback")
    return await oauth.google.authorize_redirect(request, redirect_uri)

@app.get("/auth/google/callback")
async def auth_callback(request: Request):
    token = await oauth.google.authorize_access_token(request)

    user = token.get("userinfo")
    if not user:
        # fallback (important)
        user = await oauth.google.parse_id_token(request, token)

    request.session["user"] = {
        "name": user.get("name"),
        "email": user.get("email")
    }

    return RedirectResponse(url="/")

@app.get("/logout")
def logout(request: Request):
    request.session.clear()
    return RedirectResponse("/")
