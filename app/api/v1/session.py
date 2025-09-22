from fastapi import APIRouter, HTTPException, Path
import uuid
from typing import List, Dict
from datetime import datetime

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

# -----------------------------
# Mock data
# -----------------------------
MOCK_QUESTIONS = [
    "How many active users do you expect?",
    "Do you need real-time delivery?",
    "Should notifications be persistent?",
    "What’s your expected peak traffic?",
]

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
    "diagram_url": "https://via.placeholder.com/800x400.png?text=High+Level+Diagram"
}

# -----------------------------
# Create session
# -----------------------------
@router.post("/", response_model=SessionCreateResponse)
async def create_session(request: SessionCreateRequest):
    session_id = str(uuid.uuid4())
    now = datetime.utcnow()
    query = sessions.insert().values(
        id=session_id,
        prompt=request.prompt,
        questions=MOCK_QUESTIONS.copy(),
        answers=[],
        conversation=[],
        status=SessionStatus.in_progress,
        created_at=now,
        updated_at=now
    )
    await database.execute(query)
    return SessionCreateResponse(
        session_id=session_id,
        questions=MOCK_QUESTIONS,
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

    # Safe access
    questions: List[str] = session_record["questions"]
    answers: List[Dict] = session_record["answers"]
    conversation: List[Dict] = session_record["conversation"] or []
    now = datetime.utcnow()

    answered_count = len(answers)
    next_question = questions[answered_count] if answered_count < len(questions) else None

    if next_question:
        answers.append({"question": next_question, "answer": request.answer})
        conversation.append({"role": "architai", "text": next_question})
        conversation.append({"role": "user", "text": request.answer})

    status = "in_progress" if answered_count + 1 < len(questions) else "ready_to_finalize"

    update_query = sessions.update().where(sessions.c.id == session_id).values(
        answers=answers,
        conversation=conversation,
        status=status,
        updated_at=now
    )
    await database.execute(update_query)

    next_qs = [questions[answered_count + 1]] if answered_count + 1 < len(questions) else []

    return SessionReplyResponse(
        next_questions=next_qs,
        status=status,
        conversation=conversation,
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

    if len(session_record["answers"]) < len(session_record["questions"]):
        raise HTTPException(status_code=400, detail="Not all questions answered yet")

    now = datetime.utcnow()

    update_query = sessions.update().where(sessions.c.id == session_id).values(
        final_design=MOCK_FINAL_DESIGN,
        status=SessionStatus.completed,
        updated_at=now
    )
    await database.execute(update_query)

    return MOCK_FINAL_DESIGN

# -----------------------------
# List all sessions
# -----------------------------
@router.get("/", response_model=List[SessionCreateResponse])
async def list_sessions():
    all_sessions = await database.fetch_all(sessions.select())
    return [
        SessionCreateResponse(
            session_id=s["id"],
            questions=s["questions"] if s["status"] == SessionStatus.in_progress else [],
            conversation=s["conversation"] or [],
            created_at=s["created_at"],
            updated_at=s["updated_at"]
        )
        for s in all_sessions
    ]

# -----------------------------
# Get session detail
# -----------------------------
@router.get("/{session_id}", response_model=SessionDetailResponse)
async def get_session(session_id: str = Path(..., description="ID of the session")):
    query = sessions.select().where(sessions.c.id == session_id)
    session_record = await database.fetch_one(query)
    if not session_record:
        raise HTTPException(status_code=404, detail="Session not found")

    conversation: List[Dict] = session_record["conversation"] or []

    return SessionDetailResponse(
        session_id=session_record["id"],
        prompt=session_record["prompt"],
        questions=session_record["questions"],
        answers=session_record["answers"],
        status=session_record["status"],
        final_design=session_record["final_design"],
        conversation=conversation,
        created_at=session_record["created_at"],
        updated_at=session_record["updated_at"],
    )
