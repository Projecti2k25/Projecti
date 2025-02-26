from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
from uuid import uuid4
from datetime import datetime, timedelta
import models
from database import get_db
from models import User
from schemas import UserCreate, UserUpdate, UserResponse, ForgotPasswordRequest, ResetPasswordRequest
from utils import hash_password, verify_password
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(root_path="/api")  # This adds "/api" before all routes

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow your React app's domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Helper function to send email
async def send_email(to_email, subject, body):
    try:
        sender_email = os.getenv("EMAIL_ADDRESS")  # Use environment variable
        sender_password = os.getenv("EMAIL_PASSWORD")  # Use environment variable
        smtp_server = "smtp.gmail.com"
        smtp_port = 587

        # Create the email
        message = MIMEMultipart()
        message["From"] = sender_email
        message["To"] = to_email
        message["Subject"] = subject
        message.attach(MIMEText(body, "plain"))

        # Connect to the SMTP server
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()  # Secure the connection
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, to_email, message.as_string())

        print("Email sent successfully!")
    except Exception as e:
        print(f"Failed to send email: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

# ✅ Helper function to generate a reset token
def generate_reset_token():
    return str(uuid4())  # Unique token

# 🚀 Forgot Password Endpoint
@app.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    email = request.email

    # Check if the email exists in the database
    result = await db.execute(select(User).filter(User.email == email))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Email not found")

    # Generate a password reset token
    reset_token = generate_reset_token()
    user.reset_token = reset_token
    user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)  # Valid for 1 hour

    await db.commit()

    # Send the reset link via email
    reset_link = f"http://localhost:3000/reset-password?token={reset_token}"
    await send_email(email, "Password Reset", f"Click here to reset your password: {reset_link}")

    return {"message": "Password reset link sent to your email"}

# 🚀 Reset Password Endpoint
@app.post("/reset-password")
async def reset_password(request: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    print("Incoming request payload:", request.dict())  # Log the payload

    token = request.token
    new_password = hash_password(request.password)  # Hash the new password

    # Find user by token
    result = await db.execute(select(User).filter(User.reset_token == token))
    user = result.scalars().first()

    if not user or user.reset_token_expiry < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    # Update password and clear token
    user.password = new_password
    user.reset_token = None
    user.reset_token_expiry = None

    await db.commit()

    return {"message": "Password reset successful! You can now log in."}

# 🚀 Define UserLogin schema
class UserLogin(BaseModel):
    email: str
    password: str

# 🚀 POST - Login user
@app.post("/login", response_model=UserResponse)
async def login_user(user: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter(User.email == user.email))
    existing_user = result.scalars().first()
    
    if not existing_user or not verify_password(user.password, existing_user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "uid": existing_user.uid,
        "uid_formatted": f"I-{existing_user.uid}",  # Ensure this field is returned
        "name": existing_user.name,
        "email": existing_user.email,
    }

# 🚀 POST - Create a new user
@app.post("/users", response_model=UserResponse)
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    hashed_password = hash_password(user.password)  # Hash password
    new_user = User(name=user.name, email=user.email, password=hashed_password)

    db.add(new_user)
    try:
        await db.commit()
        await db.refresh(new_user)  # Fetch auto-generated UID
        return new_user
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Email already exists")

# 🚀 GET - Retrieve a user by UID
@app.get("/users/{uid}", response_model=UserResponse)
async def get_user(uid: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter(User.uid == uid))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# 🚀 PUT - Update a user's details
@app.put("/users/{uid}", response_model=UserResponse)
async def update_user(uid: int, user_update: UserUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter(User.uid == uid))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.name = user_update.name if user_update.name else user.name
    user.email = user_update.email if user_update.email else user.email
    user.password = hash_password(user_update.password) if user_update.password else user.password

    await db.commit()
    await db.refresh(user)
    return user

# 🚀 DELETE - Remove a user by UID
@app.delete("/users/{uid}", response_model=dict)
async def delete_user(uid: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter(User.uid == uid))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await db.delete(user)
    await db.commit()
    return {"message": "User deleted successfully"}