# app/api/v1/session.py
import json
import uuid
from datetime import datetime
from typing import List, Dict

from fastapi import APIRouter, HTTPException, Path

from app.models.schemas import (
    FinalizeResponse,
    SessionCreateRequest,
    SessionCreateResponse,
    SessionDetailResponse,
    SessionReplyRequest,
    SessionReplyResponse,
)
from app.core.db import database
from app.models.db_models import sessions, SessionStatus
from app.services import llm_service

router = APIRouter(prefix="/session", tags=["session"])


# -----------------------------
# Helpers
# -----------------------------
def get_next_question(questions: List[str], answers: List[Dict]) -> str:
    """Get the next unanswered question."""
    idx = len(answers)
    return questions[idx] if idx < len(questions) else None


def get_next_questions_list(questions: List[str], answers: List[Dict]) -> List[str]:
    """Return next question as list if available (for API response)."""
    next_q = get_next_question(questions, answers)
    return [next_q] if next_q else []


def record_to_dict(record) -> dict:
    """Convert databases.Record to dict safely for .get() usage."""
    return dict(record) if record else {}


def stringify_meta(conversation: List[Dict]) -> List[Dict]:
    """Ensure all meta fields are strings to satisfy Pydantic validation."""
    conv_fixed = []
    for msg in conversation:
        msg_copy = msg.copy()
        if "meta" in msg_copy and not isinstance(msg_copy["meta"], str):
            msg_copy["meta"] = json.dumps(msg_copy["meta"])
        conv_fixed.append(msg_copy)
    return conv_fixed


# -----------------------------
# Create session
# -----------------------------
@router.post("/", response_model=SessionCreateResponse)
async def create_session(request: SessionCreateRequest):
    session_id = str(uuid.uuid4())
    now = datetime.utcnow()

    # Generate initial questions
    questions = await llm_service.generate_initial_questions(request.prompt, num_questions=4)

    query = sessions.insert().values(
        id=session_id,
        prompt=request.prompt,
        questions=questions,
        answers=[],
        conversation=[],
        status=SessionStatus.in_progress,
        created_at=now,
        updated_at=now
    )
    await database.execute(query)

    return SessionCreateResponse(
        session_id=session_id,
        questions=questions,
        conversation=[],
        created_at=now,
        updated_at=now
    )


# -----------------------------
# Reply to session
# -----------------------------
@router.post("/{session_id}/reply", response_model=SessionReplyResponse)
async def reply_to_session(
    session_id: str = Path(..., description="ID of the session"),
    request: SessionReplyRequest = ...,
):
    query = sessions.select().where(sessions.c.id == session_id)
    session_record = await database.fetch_one(query)
    if not session_record:
        raise HTTPException(status_code=404, detail="Session not found")

    data = record_to_dict(session_record)
    conversation: List[Dict] = data.get("conversation") or []
    answers: List[Dict] = data.get("answers") or []
    questions: List[str] = data.get("questions") or []
    now = datetime.utcnow()

    next_question = get_next_question(questions, answers)
    next_qs = []

    if next_question:
        # Record user answer
        conversation.append({"role": "user", "text": request.answer})

        # Build prompt for LLM
        llm_prompt = f"Question: {next_question}\nUser answer: {request.answer}"

        # Get LLM reply
        llm_reply = await llm_service.get_next_reply(llm_prompt, conversation)
        conversation.append({
            "role": "architai",
            "text": llm_reply,
            "meta": json.dumps({"prompt": llm_prompt})
        })

        # Record answer
        answers.append({"question": next_question, "answer": request.answer})

        # Determine next question
        next_qs = get_next_questions_list(questions, answers)

    # Update DB
    status = "in_progress" if len(answers) < len(questions) else "ready_to_finalize"
    update_query = sessions.update().where(sessions.c.id == session_id).values(
        answers=answers,
        conversation=conversation,
        status=status,
        updated_at=now
    )
    await database.execute(update_query)

    return SessionReplyResponse(
        next_questions=next_qs,
        status=status,
        conversation=stringify_meta(conversation),
        updated_at=now
    )


# -----------------------------
# Finalize session
# -----------------------------
@router.post("/{session_id}/finalize", response_model=FinalizeResponse)
async def finalize_session(session_id: str = Path(..., description="ID of the session")):
    query = sessions.select().where(sessions.c.id == session_id)
    session_record = await database.fetch_one(query)
    if not session_record:
        raise HTTPException(status_code=404, detail="Session not found")

    data = record_to_dict(session_record)
    answers: List[Dict] = data.get("answers") or []
    questions: List[str] = data.get("questions") or []

    if len(answers) < len(questions):
        raise HTTPException(status_code=400, detail="Not all questions answered yet")

    conversation: List[Dict] = data.get("conversation") or []
    prompt: str = data["prompt"]
    now = datetime.utcnow()

    # Generate final design
    final_design = await llm_service.generate_final_design(prompt, conversation)

    # Log in conversation
    conversation.append({
        "role": "architai",
        "text": str(final_design),
        "meta": json.dumps({"prompt": prompt})
    })

    # Update DB
    update_query = sessions.update().where(sessions.c.id == session_id).values(
        final_design=final_design,
        conversation=conversation,
        status=SessionStatus.completed,
        updated_at=now
    )
    await database.execute(update_query)

    return final_design


# -----------------------------
# List all sessions
# -----------------------------
@router.get("/", response_model=List[SessionCreateResponse])
async def list_sessions():
    all_sessions = await database.fetch_all(sessions.select())
    response_list = []

    for record in all_sessions:
        s = record_to_dict(record)
        conv_fixed = stringify_meta(s.get("conversation") or [])

        response_list.append(
            SessionCreateResponse(
                session_id=s["id"],
                questions=s["questions"] if s["status"] == SessionStatus.in_progress else [],
                conversation=conv_fixed,
                created_at=s["created_at"],
                updated_at=s["updated_at"]
            )
        )

    return response_list


# -----------------------------
# Get session detail
# -----------------------------
@router.get("/{session_id}", response_model=SessionDetailResponse)
async def get_session(session_id: str = Path(..., description="ID of the session")):
    query = sessions.select().where(sessions.c.id == session_id)
    session_record = await database.fetch_one(query)
    if not session_record:
        raise HTTPException(status_code=404, detail="Session not found")

    data = record_to_dict(session_record)
    conversation: List[Dict] = stringify_meta(data.get("conversation") or [])

    return SessionDetailResponse(
        session_id=data["id"],
        prompt=data["prompt"],
        questions=data.get("questions") or [],
        answers=data.get("answers") or [],
        status=data["status"],
        final_design=data.get("final_design"),
        conversation=conversation,
        created_at=data["created_at"],
        updated_at=data["updated_at"],
    )
