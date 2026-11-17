from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime
from app.schemas.auth import UserResponse, UserProfileUpdate
from app.database.db import get_users_col
from app.auth.deps import get_current_user, require_admin
from app.core.security import hash_password, verify_password

router = APIRouter(prefix="/users", tags=["User Management"])

def format_user_dict(u: dict) -> UserResponse:
    return UserResponse(
        id=str(u.get("_id") or u.get("id")),
        name=u.get("name", "Student"),
        email=u.get("email", ""),
        phone=u.get("phone", ""),
        role=u.get("role", "student"),
        department=u.get("department", "CSE"),
        semester=str(u.get("semester", "5")),
        bio=u.get("bio", ""),
        avatarUrl=u.get("avatarUrl", ""),
        authProvider=u.get("authProvider", "local"),
        createdAt=u.get("createdAt"),
        updatedAt=u.get("updatedAt")
    )

@router.get("/profile", response_model=UserResponse)
def get_my_profile(current_user: dict = Depends(get_current_user)):
    """Retrieve full profile of the currently logged-in user or admin."""
    return format_user_dict(current_user)

@router.put("/profile", response_model=UserResponse)
def update_my_profile(payload: UserProfileUpdate, current_user: dict = Depends(get_current_user)):
    """Allow user / admin to edit their profile: Name, Username/Email, Phone Number, Department, Semester, Bio, Avatar, and Password."""
    users_col = get_users_col()
    user_id = str(current_user.get("_id") or current_user.get("id"))
    
    # Reload fresh user record from database
    user = users_col.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User account not found")

    update_fields = {}

    if payload.name is not None and payload.name.strip():
        update_fields["name"] = payload.name.strip()

    if payload.email is not None and payload.email.strip():
        new_email = payload.email.strip().lower()
        if new_email != user.get("email", "").lower():
            existing = users_col.find_one({"email": new_email})
            if existing and str(existing.get("_id") or existing.get("id")) != user_id:
                raise HTTPException(status_code=400, detail="This email is already in use by another account.")
            update_fields["email"] = new_email

    if payload.phone is not None:
        update_fields["phone"] = payload.phone.strip()

    if payload.department is not None:
        update_fields["department"] = payload.department.strip()

    if payload.semester is not None:
        update_fields["semester"] = str(payload.semester).strip()

    if payload.bio is not None:
        update_fields["bio"] = payload.bio.strip()

    if payload.avatarUrl is not None:
        update_fields["avatarUrl"] = payload.avatarUrl.strip()

    # Password update logic
    if payload.newPassword:
        if user.get("authProvider") == "local" and user.get("passwordHash"):
            # If current password provided, verify it
            if payload.currentPassword and not verify_password(payload.currentPassword, user.get("passwordHash")):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Incorrect current password."
                )
        update_fields["passwordHash"] = hash_password(payload.newPassword)

    if update_fields:
        update_fields["updatedAt"] = datetime.utcnow().isoformat()
        users_col.update_one({"_id": user_id}, update_fields)
        user.update(update_fields)

    return format_user_dict(user)

@router.get("", response_model=List[UserResponse])
def list_users(current_user: dict = Depends(require_admin)):
    users_col = get_users_col()
    users = users_col.find(sort_by="createdAt", reverse=True)
    return [format_user_dict(u) for u in users]

@router.delete("/{user_id}")
def delete_user(user_id: str, current_user: dict = Depends(require_admin)):
    if user_id == str(current_user.get("_id") or current_user.get("id")):
        raise HTTPException(status_code=400, detail="Cannot delete your own admin account")
    
    users_col = get_users_col()
    success = users_col.delete_one({"_id": user_id})
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}
