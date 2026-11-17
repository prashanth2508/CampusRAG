import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, DateTime
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class UserModel(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    phone = Column(String(30), nullable=True)
    password_hash = Column(String(255), nullable=True)
    role = Column(String(20), default="student", nullable=False)
    department = Column(String(50), default="CSE")
    semester = Column(String(10), default="5")
    bio = Column(Text, nullable=True)
    avatar_url = Column(String(500), nullable=True)
    google_id = Column(String(100), unique=True, nullable=True, index=True)
    auth_provider = Column(String(20), default="local")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "_id": self.id,
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone or "",
            "passwordHash": self.password_hash,
            "role": self.role,
            "department": self.department or "CSE",
            "semester": str(self.semester or "5"),
            "bio": self.bio or "",
            "avatarUrl": self.avatar_url or "",
            "googleId": self.google_id or "",
            "authProvider": self.auth_provider or "local",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }


class DepartmentModel(Base):
    __tablename__ = "departments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "_id": self.id,
            "id": self.id,
            "code": self.code,
            "name": self.name,
            "description": self.description or "",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }


class SubjectModel(Base):
    __tablename__ = "subjects"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    department_code = Column(String(50), index=True, nullable=False)
    semester = Column(String(10), nullable=False)
    modules = Column(Text, default="[]")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        import json
        mods = []
        try:
            mods = json.loads(self.modules) if self.modules else []
        except Exception:
            mods = []
        return {
            "_id": self.id,
            "id": self.id,
            "code": self.code,
            "name": self.name,
            "departmentCode": self.department_code,
            "semester": str(self.semester),
            "modules": mods,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }


class DocumentModel(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    original_file_name = Column(String(255), nullable=False)
    department = Column(String(50), nullable=False)
    semester = Column(String(10), nullable=False)
    subject = Column(String(150), nullable=False)
    module = Column(String(100), default="All Modules")
    document_type = Column(String(50), default="Syllabus")
    academic_year = Column(String(20), default="2025-2026")
    description = Column(Text, nullable=True)
    file_path = Column(String(500), nullable=False)
    status = Column(String(50), default="processed")
    chunk_count = Column(Integer, default=0)
    uploaded_by = Column(String(100), default="Admin")
    checksum = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "_id": self.id,
            "id": self.id,
            "name": self.name,
            "originalFileName": self.original_file_name,
            "department": self.department,
            "semester": str(self.semester),
            "subject": self.subject,
            "module": self.module or "All Modules",
            "documentType": self.document_type or "Syllabus",
            "academicYear": self.academic_year or "2025-2026",
            "description": self.description or "",
            "filePath": self.file_path,
            "status": self.status or "processed",
            "chunkCount": self.chunk_count or 0,
            "uploadedBy": self.uploaded_by or "Admin",
            "checksum": self.checksum or "",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }


class ChatModel(Base):
    __tablename__ = "chats"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    department = Column(String(50), nullable=False)
    semester = Column(String(10), nullable=False)
    subject = Column(String(150), nullable=False)
    module = Column(String(100), default="All Modules")
    messages = Column(Text, default="[]")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        import json
        msgs = []
        try:
            msgs = json.loads(self.messages) if self.messages else []
        except Exception:
            msgs = []
        return {
            "_id": self.id,
            "id": self.id,
            "userId": self.user_id,
            "title": self.title,
            "department": self.department,
            "semester": str(self.semester),
            "subject": self.subject,
            "module": self.module or "All Modules",
            "messages": msgs,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }


class PasswordResetModel(Base):
    __tablename__ = "password_resets"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(150), nullable=False, index=True)
    otp = Column(String(10), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "_id": self.id,
            "id": self.id,
            "email": self.email,
            "otp": self.otp,
            "expiresAt": self.expires_at.isoformat() if self.expires_at else None,
            "used": bool(self.used),
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
