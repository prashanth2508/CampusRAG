from fastapi import APIRouter, Depends, HTTPException
from app.schemas.rag import RAGQueryRequest, RAGQueryResponse
from app.services.rag_service import rag_service
from app.auth.deps import get_current_user

router = APIRouter(prefix="/rag", tags=["RAG Generation"])

@router.post("/query", response_model=RAGQueryResponse)
def query_rag(payload: RAGQueryRequest, current_user: dict = Depends(get_current_user)):
    """
    Execute RAG retrieval and LLM response generation for academic questions.
    """
    if not payload.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    response = rag_service.answer_question(
        question=payload.question,
        department=payload.department,
        semester=payload.semester,
        subject=payload.subject,
        module=payload.module,
        mode=payload.mode or "detailed",
        chat_id=payload.chatId,
        user_id=str(current_user["_id"]),
        gemini_api_key=payload.geminiApiKey
    )

    return response
