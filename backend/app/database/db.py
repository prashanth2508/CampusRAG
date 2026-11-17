import os
from typing import Optional
from app.core.config import settings
from app.database.sql_db import (
    SQLCollection,
    UserModel,
    DepartmentModel,
    SubjectModel,
    DocumentModel,
    ChatModel,
    PasswordResetModel,
    init_sql_db,
    migrate_json_to_sql,
    SessionLocal,
    engine
)

# Initialize SQL database tables and migrate data from JSON if needed
try:
    init_sql_db()
    migrate_json_to_sql()
    print("CampusRAG SQL database initialized successfully.")
except Exception as e:
    print(f"Notice during SQL initialization: {e}")

# Singletons for SQL collections
_users_col = SQLCollection(UserModel)
_departments_col = SQLCollection(DepartmentModel)
_subjects_col = SQLCollection(SubjectModel)
_documents_col = SQLCollection(DocumentModel)
_chats_col = SQLCollection(ChatModel)
_password_resets_col = SQLCollection(PasswordResetModel)

def get_users_col() -> SQLCollection:
    return _users_col

def get_departments_col() -> SQLCollection:
    return _departments_col

def get_subjects_col() -> SQLCollection:
    return _subjects_col

def get_documents_col() -> SQLCollection:
    return _documents_col

def get_chats_col() -> SQLCollection:
    return _chats_col

def get_password_resets_col() -> SQLCollection:
    return _password_resets_col

def get_db_session():
    """Returns a direct SQLAlchemy session for raw SQL queries or transactions."""
    return SessionLocal()
