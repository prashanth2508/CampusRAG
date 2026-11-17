import os
import json
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any
from sqlalchemy import create_engine, select, text, func
from sqlalchemy.orm import sessionmaker, scoped_session

from app.core.config import settings
from app.database.models import Base, UserModel, DepartmentModel, SubjectModel, DocumentModel, ChatModel, PasswordResetModel

# SQLite or PostgreSQL URI
SQL_DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "campusrag.db")
SQL_DATABASE_URL = getattr(settings, "SQL_DATABASE_URL", None) or os.getenv("SQL_DATABASE_URL") or f"sqlite:///{SQL_DB_PATH}"

# Fix for cloud providers providing postgres:// instead of postgresql://
if SQL_DATABASE_URL and SQL_DATABASE_URL.startswith("postgres://"):
    SQL_DATABASE_URL = SQL_DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {"check_same_thread": False} if "sqlite" in SQL_DATABASE_URL else {}
engine = create_engine(SQL_DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

def init_sql_db():
    Base.metadata.create_all(bind=engine)

class SQLCollection:
    def __init__(self, model_class):
        self.model_class = model_class

    def _get_session(self):
        return SessionLocal()

    def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        session = self._get_session()
        try:
            q = session.query(self.model_class)
            for k, v in query.items():
                col_name = self._map_field(k)
                if hasattr(self.model_class, col_name):
                    q = q.filter(getattr(self.model_class, col_name) == v)
            item = q.first()
            return item.to_dict() if item else None
        finally:
            session.close()

    def find(self, query: Optional[Dict[str, Any]] = None, sort_by: Optional[str] = None, reverse: bool = False) -> List[Dict[str, Any]]:
        session = self._get_session()
        try:
            q = session.query(self.model_class)
            if query:
                for k, v in query.items():
                    col_name = self._map_field(k)
                    if hasattr(self.model_class, col_name):
                        q = q.filter(getattr(self.model_class, col_name) == v)
            if sort_by:
                mapped_sort = self._map_field(sort_by)
                if hasattr(self.model_class, mapped_sort):
                    col = getattr(self.model_class, mapped_sort)
                    q = q.order_by(col.desc() if reverse else col.asc())
            items = q.all()
            return [item.to_dict() for item in items]
        finally:
            session.close()

    def insert_one(self, document: Dict[str, Any]) -> str:
        session = self._get_session()
        try:
            doc = document.copy()
            doc_id = doc.get("_id") or doc.get("id") or str(uuid.uuid4())
            model_kwargs = {"id": doc_id}

            # Map fields to model attributes
            for k, v in doc.items():
                if k in ("_id", "id"):
                    continue
                col_name = self._map_field(k)
                if hasattr(self.model_class, col_name):
                    # Handle json string serialization for list/dict
                    if isinstance(v, (list, dict)):
                        model_kwargs[col_name] = json.dumps(v)
                    elif isinstance(v, str) and col_name in ("created_at", "updated_at"):
                        try:
                            model_kwargs[col_name] = datetime.fromisoformat(v)
                        except Exception:
                            model_kwargs[col_name] = datetime.utcnow()
                    else:
                        model_kwargs[col_name] = v

            obj = self.model_class(**model_kwargs)
            session.add(obj)
            session.commit()
            return doc_id
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()

    def update_one(self, query: Dict[str, Any], update: Dict[str, Any]) -> bool:
        session = self._get_session()
        try:
            q = session.query(self.model_class)
            for k, v in query.items():
                col_name = self._map_field(k)
                if hasattr(self.model_class, col_name):
                    q = q.filter(getattr(self.model_class, col_name) == v)
            item = q.first()
            if not item:
                return False

            set_values = update.get("$set", update)
            for k, v in set_values.items():
                col_name = self._map_field(k)
                if hasattr(self.model_class, col_name):
                    if isinstance(v, (list, dict)):
                        setattr(item, col_name, json.dumps(v))
                    elif isinstance(v, str) and col_name in ("created_at", "updated_at"):
                        try:
                            setattr(item, col_name, datetime.fromisoformat(v))
                        except Exception:
                            setattr(item, col_name, datetime.utcnow())
                    else:
                        setattr(item, col_name, v)

            if hasattr(self.model_class, "updated_at"):
                item.updated_at = datetime.utcnow()

            session.commit()
            return True
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()

    def delete_one(self, query: Dict[str, Any]) -> bool:
        session = self._get_session()
        try:
            q = session.query(self.model_class)
            for k, v in query.items():
                col_name = self._map_field(k)
                if hasattr(self.model_class, col_name):
                    q = q.filter(getattr(self.model_class, col_name) == v)
            item = q.first()
            if not item:
                return False

            session.delete(item)
            session.commit()
            return True
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()

    def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        session = self._get_session()
        try:
            q = session.query(func.count(self.model_class.id))
            if query:
                for k, v in query.items():
                    col_name = self._map_field(k)
                    if hasattr(self.model_class, col_name):
                        q = q.filter(getattr(self.model_class, col_name) == v)
            return q.scalar() or 0
        finally:
            session.close()

    @staticmethod
    def _map_field(k: str) -> str:
        # Standard camelCase to snake_case field mapping
        mapping = {
            "_id": "id",
            "passwordHash": "password_hash",
            "avatarUrl": "avatar_url",
            "googleId": "google_id",
            "authProvider": "auth_provider",
            "createdAt": "created_at",
            "updatedAt": "updated_at",
            "departmentCode": "department_code",
            "originalFileName": "original_file_name",
            "documentType": "document_type",
            "academicYear": "academic_year",
            "filePath": "file_path",
            "chunkCount": "chunk_count",
            "uploadedBy": "uploaded_by",
            "userId": "user_id",
        }
        return mapping.get(k, k)


def migrate_json_to_sql():
    """Migrate existing JSON data to SQL tables if SQL tables are empty."""
    init_sql_db()
    data_dir = settings.DATA_DIR
    if not os.path.exists(data_dir):
        return

    mapping = [
        ("users.json", SQLCollection(UserModel)),
        ("departments.json", SQLCollection(DepartmentModel)),
        ("subjects.json", SQLCollection(SubjectModel)),
        ("documents.json", SQLCollection(DocumentModel)),
        ("chats.json", SQLCollection(ChatModel)),
    ]

    for filename, sql_col in mapping:
        filepath = os.path.join(data_dir, filename)
        if os.path.exists(filepath):
            try:
                if sql_col.count_documents() == 0:
                    with open(filepath, "r", encoding="utf-8") as f:
                        items = json.load(f)
                    if isinstance(items, list):
                        for item in items:
                            try:
                                sql_col.insert_one(item)
                            except Exception:
                                pass
                        print(f"Migrated {len(items)} items from {filename} to SQL table {sql_col.model_class.__tablename__}")
            except Exception as e:
                print(f"Migration error for {filename}: {e}")

