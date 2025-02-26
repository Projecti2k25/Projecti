from fastapi import APIRouter, HTTPException
from schemas import ForgotPasswordRequest
import smtplib

router = APIRouter()

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    email = request.email

    # Check if the email exists in your database (pseudo-code)
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Email not found")

    # Generate a password reset token (pseudo-code)
    reset_token = generate_reset_token(user.id)

    # Send the reset link via email (pseudo-code)
    reset_link = f"http://yourfrontend.com/reset-password?token={reset_token}"
    send_email(email, "Password Reset", f"Click here to reset your password: {reset_link}")

    return {"message": "Password reset link sent to your email"}

# Helper functions (same as above)
def send_email(to_email, subject, body):
    ...

def generate_reset_token(user_id):
    ...