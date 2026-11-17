from pydantic import BaseModel, Field
from typing import Optional, List

class DepartmentCreate(BaseModel):
    name: str = Field(..., example="Computer Science & Engineering")
    code: str = Field(..., example="CSE")

class DepartmentResponse(BaseModel):
    id: str
    name: str
    code: str
    createdAt: Optional[str] = None

class SubjectCreate(BaseModel):
    name: str = Field(..., example="Database Management System")
    code: str = Field(..., example="DBMS")
    departmentCode: str = Field(..., example="CSE")
    semester: str = Field(..., example="5")
    modules: List[str] = Field(default_factory=lambda: ["Module 1", "Module 2", "Module 3", "Module 4", "Module 5"])

class SubjectResponse(BaseModel):
    id: str
    name: str
    code: str
    departmentCode: str
    semester: str
    modules: List[str]
    createdAt: Optional[str] = None
