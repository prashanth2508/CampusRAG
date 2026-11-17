import time
import uuid
from typing import Dict, Any, Optional, List
from app.services.retrieval_service import retrieval_service
from app.services.llm_service import LLMFactory, format_rag_prompt, SYSTEM_INSTRUCTION
from app.database.db import get_chats_col
from app.schemas.rag import RAGQueryResponse, RAGSource

class RAGService:
    @staticmethod
    def answer_question(
        question: str,
        department: Optional[str] = None,
        semester: Optional[str] = None,
        subject: Optional[str] = None,
        module: Optional[str] = None,
        mode: str = "detailed",
        chat_id: Optional[str] = None,
        user_id: Optional[str] = None,
        gemini_api_key: Optional[str] = None
    ) -> RAGQueryResponse:
        """
        Execute full RAG workflow:
        Query -> Academic Filter -> Vector Search -> Context Build -> LLM Generate -> Source Citations -> Chat Persistence
        """
        start_time = time.time()
        
        # Step 1 & 2: Retrieve context chunks
        context_text, citations, confidence = retrieval_service.retrieve_context(
            query=question,
            department=department,
            semester=semester,
            subject=subject,
            module=module
        )

        final_chat_id = chat_id
        if not final_chat_id and user_id:
            try:
                chats_col = get_chats_col()
                new_chat_id = str(uuid.uuid4())
                chats_col.insert_one({
                    "_id": new_chat_id,
                    "userId": user_id,
                    "title": f"{subject or 'Academic'}: {question[:28]}...",
                    "department": department or "CSE",
                    "semester": semester or "5",
                    "subject": subject or "General",
                    "module": module or "General",
                    "messages": [],
                    "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                    "updatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ")
                })
                final_chat_id = new_chat_id
            except Exception as e:
                print(f"Auto-create chat failed: {e}")

        # Handle empty context
        if not context_text or not citations:
            fallback_answer = "I couldn't find sufficient information about this topic in the college knowledge base."
            
            # Save to chat history if chat_id provided
            if final_chat_id:
                RAGService._save_chat_message(final_chat_id, user_id, question, fallback_answer, [], mode)

            return RAGQueryResponse(
                answer=fallback_answer,
                sources=[],
                confidence=0.0,
                mode=mode,
                chatId=final_chat_id
            )

        # Step 3: Prompt construction
        prompt = format_rag_prompt(question, context_text, mode)

        # Step 4: LLM Generation
        try:
            llm_provider = LLMFactory.get_provider(custom_gemini_key=gemini_api_key)
            answer_text = llm_provider.generate(prompt, system_prompt=SYSTEM_INSTRUCTION)
        except Exception as e:
            print(f"RAG LLM Exception: {e}")
            answer_text = f"I encountered an error generating an answer ({e}). Please check your Gemini API key or try again."

        # Ensure grounded warning check
        if "couldn't find sufficient information" in answer_text.lower():
            citations = []
            confidence = 0.0

        # Step 5: Save message to chat history
        if final_chat_id:
            RAGService._save_chat_message(final_chat_id, user_id, question, answer_text, citations, mode)

        return RAGQueryResponse(
            answer=answer_text,
            sources=citations,
            confidence=confidence,
            mode=mode,
            chatId=final_chat_id
        )

    @staticmethod
    def _save_chat_message(
        chat_id: str,
        user_id: Optional[str],
        question: str,
        answer: str,
        sources: List[Dict[str, Any]],
        mode: str
    ):
        chats_col = get_chats_col()
        chat = chats_col.find_one({"_id": chat_id})
        
        user_msg = {
            "id": str(uuid.uuid4()),
            "role": "user",
            "content": question,
            "mode": mode,
            "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ")
        }
        
        bot_msg = {
            "id": str(uuid.uuid4()),
            "role": "assistant",
            "content": answer,
            "sources": sources,
            "mode": mode,
            "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ")
        }

        if chat:
            existing_messages = chat.get("messages", [])
            existing_messages.extend([user_msg, bot_msg])
            chats_col.update_one(
                {"_id": chat_id},
                {"$set": {"messages": existing_messages, "updatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ")}}
            )

rag_service = RAGService()
