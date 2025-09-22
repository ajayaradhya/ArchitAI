from fastapi import APIRouter, HTTPException, Path
from pydantic import BaseModel
import uuid
from typing import List

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

router = APIRouter(prefix="/session", tags=["session"])

# Mock clarifying questions
MOCK_QUESTIONS = [
    "How many active users do you expect?",
    "Do you need real-time delivery?",
    "Should notifications be persistent?",
    "What’s your expected peak traffic?",
]

# Mock final design
MOCK_FINAL_DESIGN = {
    "summary": "A scalable notification system for 10M users with real-time push.",
    "components": [
        {"name": "API Gateway", "desc": "Accepts notification requests"},
        {"name": "Notification Service", "desc": "Validates and enqueues messages"},
        {"name": "Message Queue (Kafka)", "desc": "Durable queue for fanout"},
        {"name": "Workers", "desc": "Consume from queue and deliver via push/email"},
        {"name": "Redis", "desc": "User subscription cache and rate limiting"},
        {"name": "Postgres", "desc": "Persist user preferences and history"},
    ],
    "db_schema": "CREATE TABLE users (...); CREATE TABLE subscriptions (...);",
    "mermaid": "graph TD; Client-->Gateway; Gateway-->Service; Service-->Kafka; Kafka-->Workers; Workers-->Push;",
    "tech_stack": ["FastAPI", "Postgres", "Redis", "Kafka", "FCM/APNs"],
    "integration_steps": [
        "1. Create Postgres schema",
        "2. Deploy Kafka cluster",
        "3. Implement worker pool",
    ],
    "rationale": "Chose Kafka for durable fanout; Redis for fast lookups; eventual consistency chosen to favor availability.",
}


# -----------------------------
# Create session
# -----------------------------
@router.post("/", response_model=SessionCreateResponse)
async def create_session(request: SessionCreateRequest):
    session_id = str(uuid.uuid4())
    query = sessions.insert().values(
        id=session_id,
        prompt=request.prompt,
        questions=MOCK_QUESTIONS.copy(),
        answers=[],
        status=SessionStatus.in_progress,
    )
    await database.execute(query)
    return SessionCreateResponse(session_id=session_id, questions=MOCK_QUESTIONS)


# -----------------------------
# Reply to session
# -----------------------------
@router.post("/{session_id}/reply", response_model=SessionReplyResponse)
async def reply_to_session(
    session_id: str = Path(..., description="ID of the session"),
    request: SessionReplyRequest = ...,
):
    query = sessions.select().where(sessions.c.id == session_id)
    session = await database.fetch_one(query)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    questions: List[str] = session["questions"]
    answers: List[dict] = session["answers"]

    if not questions:
        return SessionReplyResponse(next_questions=[], status="ready_to_finalize")

    current_question = questions.pop(0)
    answers.append({"question": current_question, "answer": request.answer})

    # Update DB
    update_query = sessions.update().where(sessions.c.id == session_id).values(
        questions=questions, answers=answers
    )
    await database.execute(update_query)

    next_qs = questions[:1]  # send one question at a time
    status = "in_progress" if next_qs else "ready_to_finalize"

    return SessionReplyResponse(next_questions=next_qs, status=status)


# -----------------------------
# Finalize session
# -----------------------------
@router.post("/{session_id}/finalize", response_model=FinalizeResponse)
async def finalize_session(session_id: str = Path(..., description="ID of the session")):
    query = sessions.select().where(sessions.c.id == session_id)
    session = await database.fetch_one(query)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    questions: List[str] = session["questions"]

    if questions:
        raise HTTPException(status_code=400, detail="Not all questions answered yet")

    # Update DB with final design
    update_query = sessions.update().where(sessions.c.id == session_id).values(
        final_design=MOCK_FINAL_DESIGN, status=SessionStatus.completed
    )
    await database.execute(update_query)

    return MOCK_FINAL_DESIGN


@router.get("/", response_model=List[SessionCreateResponse])
async def list_sessions():
    query = sessions.select()
    all_sessions = await database.fetch_all(query)
    result = [
        SessionCreateResponse(
            session_id=s["id"],
            questions=s["questions"] if s["status"] == SessionStatus.in_progress else []
        )
        for s in all_sessions
    ]
    return result

@router.get("/{session_id}", response_model=SessionDetailResponse)
async def get_session(session_id: str = Path(..., description="ID of the session")):
    query = sessions.select().where(sessions.c.id == session_id)
    session = await database.fetch_one(query)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return SessionDetailResponse(
        session_id=session["id"],
        prompt=session["prompt"],
        questions=session["questions"],
        answers=session["answers"],
        status=session["status"],
        final_design=session.get("final_design"),
    )