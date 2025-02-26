from typing import Optional
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None

class UserResponse(BaseModel):
    uid: int
    name: str
    email: EmailStr

class ForgotPasswordRequest(BaseModel):
    email: str

from pydantic import BaseModel
class ResetPasswordRequest(BaseModel):
    token: str
    password: str