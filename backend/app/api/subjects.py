from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from app.schemas.academic import SubjectCreate, SubjectResponse
from app.database.db import get_subjects_col
from app.auth.deps import get_current_user, require_admin

router = APIRouter(prefix="/subjects", tags=["Subjects"])

@router.get("", response_model=List[SubjectResponse])
def list_subjects(
    departmentCode: Optional[str] = Query(None),
    semester: Optional[str] = Query(None)
):
    query = {}
    if departmentCode and departmentCode != "All Departments":
        query["departmentCode"] = departmentCode.upper()
    if semester and semester != "All Semesters":
        query["semester"] = str(semester)

    subj_col = get_subjects_col()
    subjects = subj_col.find(query, sort_by="code")
    
    # If no subjects found for specific sem/dept combination, fallback to all available subjects
    if not subjects:
        subjects = subj_col.find({}, sort_by="code")

    return [
        SubjectResponse(
            id=str(s["_id"]),
            name=s["name"],
            code=s["code"],
            departmentCode=s["departmentCode"],
            semester=str(s["semester"]),
            modules=s.get("modules", ["Module 1", "Module 2", "Module 3", "Module 4", "Module 5"]),
            createdAt=s.get("createdAt")
        ) for s in subjects
    ]

@router.post("", response_model=SubjectResponse)
def create_subject(subject_in: SubjectCreate, current_user: dict = Depends(require_admin)):
    subj_col = get_subjects_col()
    existing = subj_col.find_one({
        "code": subject_in.code.upper(),
        "departmentCode": subject_in.departmentCode.upper(),
        "semester": str(subject_in.semester)
    })
    if existing:
        raise HTTPException(status_code=400, detail="Subject code already exists for this department and semester")

    doc = {
        "name": subject_in.name,
        "code": subject_in.code.upper(),
        "departmentCode": subject_in.departmentCode.upper(),
        "semester": str(subject_in.semester),
        "modules": subject_in.modules or ["Module 1", "Module 2", "Module 3", "Module 4", "Module 5"]
    }
    subj_id = subj_col.insert_one(doc)
    return SubjectResponse(
        id=subj_id,
        name=doc["name"],
        code=doc["code"],
        departmentCode=doc["departmentCode"],
        semester=doc["semester"],
        modules=doc["modules"]
    )

@router.delete("/{subject_id}")
def delete_subject(subject_id: str, current_user: dict = Depends(require_admin)):
    subj_col = get_subjects_col()
    success = subj_col.delete_one({"_id": subject_id})
    if not success:
        raise HTTPException(status_code=404, detail="Subject not found")
    return {"message": "Subject deleted successfully"}
