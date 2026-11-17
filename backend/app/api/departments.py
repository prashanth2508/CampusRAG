from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.schemas.academic import DepartmentCreate, DepartmentResponse
from app.database.db import get_departments_col
from app.auth.deps import get_current_user, require_admin

router = APIRouter(prefix="/departments", tags=["Departments"])

@router.get("", response_model=List[DepartmentResponse])
def list_departments():
    dept_col = get_departments_col()
    depts = dept_col.find(sort_by="code")
    return [
        DepartmentResponse(
            id=str(d["_id"]),
            name=d["name"],
            code=d["code"],
            createdAt=d.get("createdAt")
        ) for d in depts
    ]

@router.post("", response_model=DepartmentResponse)
def create_department(dept_in: DepartmentCreate, current_user: dict = Depends(require_admin)):
    dept_col = get_departments_col()
    existing = dept_col.find_one({"code": dept_in.code.upper()})
    if existing:
        raise HTTPException(status_code=400, detail="Department code already exists")

    doc = {
        "name": dept_in.name,
        "code": dept_in.code.upper()
    }
    dept_id = dept_col.insert_one(doc)
    return DepartmentResponse(id=dept_id, name=doc["name"], code=doc["code"])

@router.delete("/{dept_id}")
def delete_department(dept_id: str, current_user: dict = Depends(require_admin)):
    dept_col = get_departments_col()
    success = dept_col.delete_one({"_id": dept_id})
    if not success:
        raise HTTPException(status_code=404, detail="Department not found")
    return {"message": "Department deleted successfully"}
