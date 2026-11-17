import json
import base64
import secrets
from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime, timedelta
from app.schemas.auth import (
    UserRegister, 
    UserLogin, 
    GoogleLoginRequest, 
    Token, 
    UserResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ForgotPasswordResponse
)
from app.core.security import hash_password, verify_password, create_access_token
from app.core.config import settings
from app.database.db import get_users_col, get_password_resets_col
from app.auth.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

def format_user_response(user: dict) -> UserResponse:
    return UserResponse(
        id=str(user.get("_id") or user.get("id")),
        name=user.get("name", "Student"),
        email=user.get("email", ""),
        phone=user.get("phone", ""),
        role=user.get("role", "student"),
        department=user.get("department", "CSE"),
        semester=str(user.get("semester", "5")),
        bio=user.get("bio", ""),
        avatarUrl=user.get("avatarUrl", ""),
        authProvider=user.get("authProvider", "local"),
        createdAt=user.get("createdAt"),
        updatedAt=user.get("updatedAt")
    )

@router.post("/register", response_model=Token)
def register(user_data: UserRegister):
    users_col = get_users_col()
    existing_user = users_col.find_one({"email": user_data.email.lower().strip()})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email is already registered")

    role = "student"
    if user_data.role == "admin":
        if not user_data.admin_secret or user_data.admin_secret != settings.ADMIN_REGISTRATION_SECRET:
            raise HTTPException(
                status_code=403,
                detail="Invalid admin registration secret key. You cannot register as admin without authorization."
            )
        role = "admin"

    new_user = {
        "name": user_data.name.strip(),
        "email": user_data.email.lower().strip(),
        "phone": user_data.phone.strip() if user_data.phone else "",
        "passwordHash": hash_password(user_data.password),
        "role": role,
        "department": user_data.department or "CSE",
        "semester": str(user_data.semester or "5"),
        "bio": "",
        "avatarUrl": "",
        "authProvider": "local",
        "createdAt": datetime.utcnow().isoformat(),
        "updatedAt": datetime.utcnow().isoformat()
    }

    user_id = users_col.insert_one(new_user)
    new_user["_id"] = user_id
    new_user["id"] = user_id

    token = create_access_token(subject=user_id, role=role)
    return Token(access_token=token, user=format_user_response(new_user))

@router.post("/login", response_model=Token)
def login(login_data: UserLogin):
    users_col = get_users_col()
    login_id = (login_data.email or login_data.username or "").strip().lower()

    if not login_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email, phone number, or username is required"
        )

    # 1. Search by email
    user = users_col.find_one({"email": login_id})

    # 2. Search by phone number
    if not user:
        clean_input = "".join(filter(str.isdigit, login_id))
        if clean_input:
            all_users = users_col.find()
            for u in all_users:
                u_phone = "".join(filter(str.isdigit, u.get("phone", "")))
                if u_phone and (u_phone == clean_input or u_phone.endswith(clean_input) or clean_input.endswith(u_phone)):
                    user = u
                    break

    # 3. Search by name/username
    if not user:
        all_users = users_col.find()
        for u in all_users:
            if u.get("name", "").strip().lower() == login_id:
                user = u
                break

    if not user or not user.get("passwordHash") or not verify_password(login_data.password, user.get("passwordHash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email, phone number, username, or password"
        )

    token = create_access_token(subject=str(user["_id"]), role=user["role"])
    return Token(access_token=token, user=format_user_response(user))

@router.post("/quick-portal-login", response_model=Token)
def quick_portal_login(role: str = "student"):
    """Instant 1-click portal login for Student using active credentials."""
    users_col = get_users_col()
    target_role = "student"
    user = users_col.find_one({"role": target_role})
    if not user:
        raise HTTPException(status_code=404, detail="No active student account found in database.")

    token = create_access_token(subject=str(user["_id"]), role=user["role"])
    return Token(access_token=token, user=format_user_response(user))

@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(payload: ForgotPasswordRequest):
    """Generates a secure 6-digit OTP and sends it for password reset."""
    users_col = get_users_col()
    target_input = payload.email.strip().lower()

    user = users_col.find_one({"email": target_input})
    if not user:
        clean_input = "".join(filter(str.isdigit, target_input))
        if clean_input:
            all_users = users_col.find()
            for u in all_users:
                u_phone = "".join(filter(str.isdigit, u.get("phone", "")))
                if u_phone and (u_phone == clean_input or u_phone.endswith(clean_input)):
                    user = u
                    target_input = user["email"]
                    break

    if not user:
        raise HTTPException(
            status_code=404,
            detail="No registered account found with this email or phone number."
        )

    # Generate 6-digit cryptographic OTP
    otp = f"{secrets.randbelow(900000) + 100000}"
    expires_at = datetime.utcnow() + timedelta(minutes=10)

    resets_col = get_password_resets_col()
    reset_doc = {
        "email": target_input,
        "otp": otp,
        "expires_at": expires_at,
        "used": 0,
        "createdAt": datetime.utcnow().isoformat()
    }
    resets_col.insert_one(reset_doc)

    # Send real email via SMTP
    from app.services.email_service import send_otp_email
    user_name = user.get("name", "Student") if user else "Student"
    email_delivered = send_otp_email(
        to_email=target_input,
        otp_code=otp,
        user_name=user_name
    )

    if email_delivered:
        resp_msg = f"A 6-digit verification OTP has been sent to your email ({target_input}). Please check your inbox."
    else:
        resp_msg = f"A 6-digit verification OTP has been generated for {target_input}."

    return ForgotPasswordResponse(
        message=resp_msg,
        email=target_input,
        emailSent=email_delivered,
        otpCode=otp if not email_delivered else None
    )

@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest):
    """Verifies the 6-digit OTP and updates user's password."""
    target_email = payload.email.strip().lower()
    resets_col = get_password_resets_col()
    users_col = get_users_col()

    records = resets_col.find({"email": target_email}, sort_by="createdAt", reverse=True)
    if not records:
        raise HTTPException(
            status_code=400,
            detail="No password reset request found. Please request a new OTP."
        )

    latest = records[0]
    if latest.get("used"):
        raise HTTPException(
            status_code=400,
            detail="This OTP has already been used. Please request a new OTP."
        )

    if str(latest.get("otp")).strip() != str(payload.otp).strip():
        raise HTTPException(
            status_code=400,
            detail="Invalid verification OTP code. Please check and try again."
        )

    expires_at = latest.get("expires_at")
    if isinstance(expires_at, str):
        try:
            expires_at = datetime.fromisoformat(expires_at)
        except Exception:
            expires_at = datetime.utcnow()
    if expires_at and expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=400,
            detail="The verification OTP has expired. Please request a new OTP."
        )

    user = users_col.find_one({"email": target_email})
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    new_hash = hash_password(payload.newPassword)
    users_col.update_one({"_id": user["_id"]}, {"passwordHash": new_hash})
    resets_col.update_one({"_id": latest["_id"]}, {"used": 1})

    return {"message": "Password reset successfully! You can now log in with your new password."}

@router.post("/google", response_model=Token)
def google_login(payload: GoogleLoginRequest):
    """
    Securely authenticate or register users via Google OAuth.
    Verifies Google ID token cryptographically using Google's public certs.
    Supports both Student and Admin roles with session token generation.
    """
    users_col = get_users_col()
    email = None
    name = None
    google_id = None
    avatar_url = None

    # 1. Verify Google ID token (credential) securely if provided
    if payload.credential:
        try:
            from google.oauth2 import id_token
            from google.auth.transport import requests as google_requests

            id_info = id_token.verify_oauth2_token(
                payload.credential,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID
            )

            # Verify issuer
            if id_info.get("iss") not in ["accounts.google.com", "https://accounts.google.com"]:
                raise HTTPException(status_code=401, detail="Invalid token issuer")

            email = id_info.get("email")
            name = id_info.get("name")
            google_id = id_info.get("sub")
            avatar_url = id_info.get("picture")
        except ValueError as ve:
            print(f"Google ID token verification failed: {ve}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Google ID token verification failed: {str(ve)}"
            )
        except Exception as e:
            print(f"Error during Google ID token verification: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Failed to securely verify Google ID token"
            )

    # 2. Verify Google OAuth2 access token if provided
    elif payload.accessToken:
        try:
            import requests
            res = requests.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {payload.accessToken}"},
                timeout=10
            )
            if res.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired Google OAuth access token"
                )
            info = res.json()
            email = info.get("email")
            name = info.get("name")
            google_id = info.get("sub")
            avatar_url = info.get("picture")
        except Exception as e:
            print(f"Error validating Google access token: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Failed to authenticate with Google UserInfo API"
            )

    if not email:
        raise HTTPException(
            status_code=400,
            detail="Could not retrieve valid verified Google profile information."
        )

    email = email.lower().strip()
    name = (name or email.split("@")[0]).strip()

    # Determine user role
    role = "student"
    admin_emails = ["admin@campusrag.edu", "chauhanprashanth588@gmail.com", "prashanthchavan78@gmail.com"]
    if email in admin_emails or (payload.role == "admin" and payload.adminSecret == settings.ADMIN_REGISTRATION_SECRET):
        role = "admin"

    # Search for existing user in database by email or googleId
    user = users_col.find_one({"email": email})
    if not user and google_id:
        user = users_col.find_one({"googleId": google_id})

    if user:
        # Existing user: preserve or upgrade their role
        updates = {}
        if not user.get("googleId") and google_id:
            updates["googleId"] = google_id
        if avatar_url and user.get("avatarUrl") != avatar_url:
            updates["avatarUrl"] = avatar_url
        if user.get("authProvider") != "google":
            updates["authProvider"] = "google"
        # If user is in admin list or provided valid admin secret, ensure role is admin
        if email in admin_emails or (payload.role == "admin" and payload.adminSecret == settings.ADMIN_REGISTRATION_SECRET):
            updates["role"] = "admin"
            user["role"] = "admin"
        if updates:
            users_col.update_one({"_id": user["_id"]}, updates)
            user.update(updates)
    else:
        # New user: create in SQL database
        new_user = {
            "name": name,
            "email": email,
            "phone": "",
            "passwordHash": "",
            "role": role,
            "department": payload.department or "CSE",
            "semester": str(payload.semester or "5"),
            "bio": f"Registered via Google OAuth ({role.capitalize()})",
            "avatarUrl": avatar_url or "",
            "googleId": google_id or "",
            "authProvider": "google",
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat()
        }
        user_id = users_col.insert_one(new_user)
        new_user["_id"] = user_id
        new_user["id"] = user_id
        user = new_user

    token = create_access_token(subject=str(user["_id"]), role=user["role"])
    return Token(access_token=token, user=format_user_response(user))

@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    return format_user_response(current_user)
