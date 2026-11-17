import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from app.schemas.chat import ChatCreate, ChatResponse, ChatMessage
from app.database.db import get_chats_col
from app.auth.deps import get_current_user

router = APIRouter(prefix="/chats", tags=["Chat History"])

@router.post("", response_model=ChatResponse)
def create_chat(chat_in: ChatCreate, current_user: dict = Depends(get_current_user)):
    chats_col = get_chats_col()
    chat_id = str(uuid.uuid4())
    
    new_chat = {
        "_id": chat_id,
        "userId": str(current_user["_id"]),
        "title": chat_in.title or f"{chat_in.subject} Discussion",
        "department": chat_in.department,
        "semester": str(chat_in.semester),
        "subject": chat_in.subject,
        "module": chat_in.module or "All Modules",
        "messages": [],
        "createdAt": datetime.utcnow().isoformat(),
        "updatedAt": datetime.utcnow().isoformat()
    }
    
    chats_col.insert_one(new_chat)
    
    return ChatResponse(
        id=chat_id,
        userId=new_chat["userId"],
        title=new_chat["title"],
        department=new_chat["department"],
        semester=new_chat["semester"],
        subject=new_chat["subject"],
        module=new_chat["module"],
        messages=[],
        createdAt=new_chat["createdAt"],
        updatedAt=new_chat["updatedAt"]
    )

@router.get("", response_model=List[ChatResponse])
def list_chats(current_user: dict = Depends(get_current_user)):
    chats_col = get_chats_col()
    user_id = str(current_user["_id"])
    chats = chats_col.find({"userId": user_id}, sort_by="updatedAt", reverse=True)
    
    return [
        ChatResponse(
            id=str(c["_id"]),
            userId=str(c["userId"]),
            title=c.get("title", "Academic Conversation"),
            department=c.get("department", "CSE"),
            semester=str(c.get("semester", "5")),
            subject=c.get("subject", "DBMS"),
            module=c.get("module", "Module 1"),
            messages=[ChatMessage(**m) for m in c.get("messages", [])],
            createdAt=c.get("createdAt"),
            updatedAt=c.get("updatedAt")
        ) for c in chats
    ]

@router.get("/{chat_id}", response_model=ChatResponse)
def get_chat(chat_id: str, current_user: dict = Depends(get_current_user)):
    chats_col = get_chats_col()
    chat = chats_col.find_one({"_id": chat_id, "userId": str(current_user["_id"])})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat conversation not found")
        
    return ChatResponse(
        id=str(chat["_id"]),
        userId=str(chat["userId"]),
        title=chat.get("title", "Academic Conversation"),
        department=chat.get("department", "CSE"),
        semester=str(chat.get("semester", "5")),
        subject=chat.get("subject", "DBMS"),
        module=chat.get("module", "Module 1"),
        messages=[ChatMessage(**m) for m in chat.get("messages", [])],
        createdAt=chat.get("createdAt"),
        updatedAt=chat.get("updatedAt")
    )

@router.delete("/{chat_id}")
def delete_chat(chat_id: str, current_user: dict = Depends(get_current_user)):
    chats_col = get_chats_col()
    success = chats_col.delete_one({"_id": chat_id, "userId": str(current_user["_id"])})
    if not success:
        raise HTTPException(status_code=404, detail="Chat conversation not found")
    return {"message": "Chat conversation deleted"}

@router.delete("")
def clear_all_chats(current_user: dict = Depends(get_current_user)):
    chats_col = get_chats_col()
    user_chats = chats_col.find({"userId": str(current_user["_id"])})
    for c in user_chats:
        chats_col.delete_one({"_id": c["_id"]})
    return {"message": "All chat history cleared"}
