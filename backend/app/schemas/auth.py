from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str
    password: str = Field(..., min_length=6)
    phone: Optional[str] = ""
    department: Optional[str] = "CSE"
    semester: Optional[str] = "5"
    role: Optional[str] = "student"
    admin_secret: Optional[str] = None

class UserLogin(BaseModel):
    email: Optional[str] = None
    username: Optional[str] = None
    password: str

class GoogleLoginRequest(BaseModel):
    credential: Optional[str] = None
    accessToken: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    googleId: Optional[str] = None
    avatarUrl: Optional[str] = None
    role: Optional[str] = "student"
    adminSecret: Optional[str] = None
    department: Optional[str] = "CSE"
    semester: Optional[str] = "5"

class UserProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[str] = None
    bio: Optional[str] = Field(None, max_length=500)
    avatarUrl: Optional[str] = None
    currentPassword: Optional[str] = None
    newPassword: Optional[str] = Field(None, min_length=6)

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = ""
    role: str
    department: Optional[str] = "CSE"
    semester: Optional[str] = "5"
    bio: Optional[str] = ""
    avatarUrl: Optional[str] = ""
    authProvider: Optional[str] = "local"
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    newPassword: str = Field(..., min_length=6)

class ForgotPasswordResponse(BaseModel):
    message: str
    email: str
    emailSent: Optional[bool] = False
    otpCode: Optional[str] = None
