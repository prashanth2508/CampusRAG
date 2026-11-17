import os
import sys
import fitz  # PyMuPDF
from datetime import datetime

# Add app directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.security import hash_password
from app.core.config import settings
from app.database.db import get_users_col, get_departments_col, get_subjects_col, get_documents_col
from app.services.pdf_service import PDFService
from app.services.vector_store import vector_store_service

def seed_database():
    print("Starting CampusRAG Seed Script...")

    # 1. Seed Users
    users_col = get_users_col()
    admin_email = "admin@campusrag.edu"
    student_email = "student@campusrag.edu"

    if not users_col.find_one({"email": admin_email}):
        admin_doc = {
            "name": "Dr. Sarah Jenkins (Admin)",
            "email": admin_email,
            "phone": "+91 9113686274",
            "passwordHash": hash_password("admin123"),
            "role": "admin",
            "department": "CSE",
            "semester": "5",
            "createdAt": datetime.utcnow().isoformat()
        }
        users_col.insert_one(admin_doc)
        print(f"Created Admin user: {admin_email} / admin123")

    if not users_col.find_one({"email": student_email}):
        student_doc = {
            "name": "Alex Rivera (Student)",
            "email": student_email,
            "passwordHash": hash_password("student123"),
            "role": "student",
            "department": "CSE",
            "semester": "5",
            "createdAt": datetime.utcnow().isoformat()
        }
        users_col.insert_one(student_doc)
        print(f"Created Student user: {student_email} / student123")

    # 2. Seed Departments
    dept_col = get_departments_col()
    departments_list = [
        {"name": "Computer Science & Engineering", "code": "CSE"},
        {"name": "Artificial Intelligence & Data Science", "code": "AI & DS"},
        {"name": "Computer Science & Business Systems", "code": "CSBS"},
        {"name": "Electronics & Communication Engineering", "code": "ECE"},
        {"name": "Electrical & Electronics Engineering", "code": "EEE"},
        {"name": "Mechanical Engineering", "code": "Mechanical"},
        {"name": "Civil Engineering", "code": "Civil"}
    ]

    for d in departments_list:
        if not dept_col.find_one({"code": d["code"]}):
            dept_col.insert_one({
                "name": d["name"],
                "code": d["code"],
                "createdAt": datetime.utcnow().isoformat()
            })
            print(f"Seeded Department: {d['code']}")

    # 3. Seed Subjects & Modules for CSE Sem 5
    subj_col = get_subjects_col()
    subjects_list = [
        {
            "name": "Database Management System",
            "code": "DBMS",
            "departmentCode": "CSE",
            "semester": "5",
            "modules": ["Module 1", "Module 2", "Module 3", "Module 4", "Module 5"]
        },
        {
            "name": "Operating Systems",
            "code": "OS",
            "departmentCode": "CSE",
            "semester": "5",
            "modules": ["Module 1", "Module 2", "Module 3", "Module 4", "Module 5"]
        },
        {
            "name": "Computer Networks",
            "code": "CN",
            "departmentCode": "CSE",
            "semester": "5",
            "modules": ["Module 1", "Module 2", "Module 3", "Module 4", "Module 5"]
        },
        {
            "name": "Software Engineering",
            "code": "SE",
            "departmentCode": "CSE",
            "semester": "5",
            "modules": ["Module 1", "Module 2", "Module 3", "Module 4", "Module 5"]
        },
        {
            "name": "Theory of Computation",
            "code": "TOC",
            "departmentCode": "CSE",
            "semester": "5",
            "modules": ["Module 1: Finite Automata", "Module 2: Regular Expressions", "Module 3: Context-Free Grammars", "Module 4: Pushdown Automata", "Module 5: Turing Machines"]
        },
        {
            "name": "Distributed Systems",
            "code": "DS",
            "departmentCode": "CSE",
            "semester": "5",
            "modules": ["Module 1: Characterization", "Module 2: Interprocess Communication", "Module 3: Synchronization", "Module 4: Replication", "Module 5: Fault Tolerance"]
        },
        {
            "name": "Research Methodology & IPR",
            "code": "RM_IPR",
            "departmentCode": "CSE",
            "semester": "5",
            "modules": ["Module 1: Research Formulation", "Module 2: Literature Review", "Module 3: Data Analysis", "Module 4: IPR Framework", "Module 5: Patents & Ethics"]
        }
    ]

    for s in subjects_list:
        if not subj_col.find_one({"code": s["code"], "departmentCode": s["departmentCode"], "semester": s["semester"]}):
            subj_col.insert_one({
                **s,
                "createdAt": datetime.utcnow().isoformat()
            })
            print(f"Seeded Subject: {s['code']} ({s['name']})")

    # 4. Generate Demo PDF Material & Process into ChromaDB
    docs_col = get_documents_col()
    demo_doc_name = "DBMS_Module_3_Normalization_Notes.pdf"
    
    # Check if ChromaDB has 0 vectors or doc doesn't exist
    if vector_store_service.collection.count() == 0 or not docs_col.find_one({"name": "DBMS Module 3 - Normalization & BCNF"}):
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        pdf_path = os.path.join(settings.UPLOAD_DIR, f"seed_{demo_doc_name}")

        # Create PDF using PyMuPDF
        doc = fitz.open()

        # Page 1: Normalization and 1NF/2NF
        p1 = doc.new_page()
        p1_text = """DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING
SUBJECT: DATABASE MANAGEMENT SYSTEM (DBMS) - MODULE 3: NORMALIZATION

1. INTRODUCTION TO DATABASE NORMALIZATION
Normalization is a systematic approach of decomposing tables to eliminate data redundancy and undesirable anomalies such as Insertion, Update, and Deletion anomalies. It divides larger tables into smaller tables and links them using relationships.

2. FUNCTIONAL DEPENDENCIES (FD)
A functional dependency X -> Y means X uniquely determines Y. 
- Armstrong's Axioms: Reflexivity, Augmentation, Transitivity.
- Trivial vs Non-trivial FDs.

3. FIRST NORMAL FORM (1NF)
A relation is in 1NF if every attribute domain contains only atomic (indivisible) values and there are no repeating groups or arrays.

4. SECOND NORMAL FORM (2NF)
A relation is in 2NF if it is in 1NF and no non-prime attribute is partially dependent on any candidate key. All non-key attributes must be fully functionally dependent on the primary key.
"""
        p1.insert_text((40, 50), p1_text, fontsize=11)

        # Page 2: 3NF, BCNF & Examples
        p2 = doc.new_page()
        p2_text = """SUBJECT: DATABASE MANAGEMENT SYSTEM (DBMS) - MODULE 3: BCNF & 3NF

5. THIRD NORMAL FORM (3NF)
A relation is in 3NF if it is in 2NF and there is no transitive dependency for non-prime attributes.
Formally: For every non-trivial functional dependency X -> Y:
- Either X is a Super Key, OR
- Y is a Prime Attribute (member of a candidate key).

6. BOYCE-CODD NORMAL FORM (BCNF)
BCNF is a stricter version of 3NF. A relation is in BCNF if for every non-trivial functional dependency X -> Y:
- X MUST BE A SUPER KEY.

Difference between 3NF and BCNF:
- 3NF allows Y to be a prime attribute even if X is not a super key.
- BCNF strictly enforces that X MUST be a super key for all non-trivial FDs.
- Every BCNF relation is in 3NF, but not every 3NF relation is in BCNF.

7. BCNF DECOMPOSITION EXAMPLE
Suppose relation R(Student, Course, Instructor) with FDs:
- (Student, Course) -> Instructor
- Instructor -> Course
Candidate Keys: (Student, Course) and (Student, Instructor).
Here Instructor -> Course violates BCNF because Instructor is NOT a super key!
To decompose into BCNF:
Table 1: R1(Instructor, Course)
Table 2: R2(Student, Instructor)
"""
        p2.insert_text((40, 50), p2_text, fontsize=11)

        doc.save(pdf_path)
        doc.close()

        with open(pdf_path, "rb") as f:
            pdf_bytes = f.read()

        checksum = PDFService.calculate_checksum(pdf_bytes)
        doc_id = "seed-dbms-mod3-doc-1"

        doc_record = {
            "_id": doc_id,
            "name": "DBMS Module 3 - Normalization & BCNF",
            "originalFileName": demo_doc_name,
            "department": "CSE",
            "semester": "5",
            "subject": "Database Management System",
            "module": "Module 3",
            "documentType": "Notes",
            "academicYear": "2025-2026",
            "description": "Comprehensive notes covering Functional Dependencies, 1NF, 2NF, 3NF, BCNF definitions and decomposition examples.",
            "filePath": pdf_path,
            "status": "Processing",
            "chunkCount": 0,
            "uploadedBy": "Dr. Sarah Jenkins (Admin)",
            "checksum": checksum,
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat()
        }

        if not docs_col.find_one({"_id": doc_id}):
            docs_col.insert_one(doc_record)

        # Chunk & Embed into ChromaDB
        pages_extracted = PDFService.extract_pages(pdf_path)
        chunks = PDFService.chunk_extracted_pages(
            pages_data=pages_extracted,
            chunk_size=500,
            chunk_overlap=80,
            metadata={
                "document_id": doc_id,
                "document_name": demo_doc_name,
                "department": "CSE",
                "semester": "5",
                "subject": "Database Management System",
                "module": "Module 3"
            }
        )

        chunk_cnt = vector_store_service.add_chunks(chunks)

        docs_col.update_one(
            {"_id": doc_id},
            {"$set": {"status": "Processed", "chunkCount": chunk_cnt}}
        )
        print(f"Seeded Demo PDF Document: {demo_doc_name} with {chunk_cnt} chunks in ChromaDB!")

    print("Seed process completed successfully!")

if __name__ == "__main__":
    seed_database()
