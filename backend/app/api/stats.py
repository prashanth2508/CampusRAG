from fastapi import APIRouter, Depends
from typing import Dict, Any
from app.database.db import get_documents_col, get_departments_col, get_subjects_col, get_users_col
from app.auth.deps import require_admin

router = APIRouter(prefix="/stats", tags=["Admin Dashboard Stats"])

@router.get("/dashboard")
def get_dashboard_stats(current_user: dict = Depends(require_admin)) -> Dict[str, Any]:
    docs_col = get_documents_col()
    dept_col = get_departments_col()
    subj_col = get_subjects_col()
    user_col = get_users_col()

    docs = docs_col.find()
    total_docs = len(docs)
    total_depts = dept_col.count_documents()
    total_subjects = subj_col.count_documents()
    total_students = user_col.count_documents({"role": "student"})

    processed_docs = sum(1 for d in docs if d.get("status") == "Processed")
    failed_docs = sum(1 for d in docs if d.get("status") == "Failed")
    processing_docs = sum(1 for d in docs if d.get("status") == "Processing" or d.get("status") == "Uploaded")

    # Documents distribution by department
    dept_counts: Dict[str, int] = {}
    for d in docs:
        dept = d.get("department", "Other")
        dept_counts[dept] = dept_counts.get(dept, 0) + 1

    dept_chart_data = [{"department": k, "count": v} for k, v in dept_counts.items()]

    # Documents distribution by semester
    sem_counts: Dict[str, int] = {}
    for d in docs:
        sem = f"Sem {d.get('semester', '1')}"
        sem_counts[sem] = sem_counts.get(sem, 0) + 1

    sem_chart_data = [{"semester": k, "count": v} for k, v in sorted(sem_counts.items())]

    return {
        "metrics": {
            "totalDocuments": total_docs,
            "totalDepartments": total_depts,
            "totalSubjects": total_subjects,
            "totalStudents": total_students,
            "processedDocuments": processed_docs,
            "processingErrors": failed_docs,
            "inProcessingQueue": processing_docs
        },
        "charts": {
            "byDepartment": dept_chart_data,
            "bySemester": sem_chart_data
        }
    }
