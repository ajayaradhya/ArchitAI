from fastapi import APIRouter, HTTPException, Path
from pydantic import BaseModel
import uuid

from app.models.schemas import FinalizeResponse, SessionCreateRequest, SessionCreateResponse, SessionReplyRequest, SessionReplyResponse

router = APIRouter(prefix="/session", tags=["session"])

# In-memory store for MVP
sessions = {}

# Mock clarifying questions
MOCK_QUESTIONS = [
    "How many active users do you expect?",
    "Do you need real-time delivery?",
    "Should notifications be persistent?",
    "What’s your expected peak traffic?"
]

@router.post("/", response_model=SessionCreateResponse)
def create_session(request: SessionCreateRequest):
    session_id = str(uuid.uuid4())
    # Store session with initial state
    sessions[session_id] = {
        "prompt": request.prompt,
        "questions": MOCK_QUESTIONS.copy(),
        "answers": []
    }
    return SessionCreateResponse(session_id=session_id, questions=MOCK_QUESTIONS)


@router.post("/{session_id}/reply", response_model=SessionReplyResponse)
def reply_to_session(
    session_id: str = Path(..., description="ID of the session"),
    request: SessionReplyRequest = ...
):
    # Check session exists
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    session = sessions[session_id]

    # Pop the next question from questions list
    if not session["questions"]:
        return SessionReplyResponse(next_questions=[], status="ready_to_finalize")

    current_question = session["questions"].pop(0)

    # Store user's answer
    session["answers"].append({
        "question": current_question,
        "answer": request.answer
    })

    # Prepare response
    next_qs = session["questions"][:1]  # send one question at a time
    status = "in_progress" if next_qs else "ready_to_finalize"

    return SessionReplyResponse(next_questions=next_qs, status=status)

# Mock final design JSON (for testing)
MOCK_FINAL_DESIGN = {
    "summary": "A scalable notification system for 10M users with real-time push.",
    "components": [
        {"name": "API Gateway", "desc": "Accepts notification requests"},
        {"name": "Notification Service", "desc": "Validates and enqueues messages"},
        {"name": "Message Queue (Kafka)", "desc": "Durable queue for fanout"},
        {"name": "Workers", "desc": "Consume from queue and deliver via push/email"},
        {"name": "Redis", "desc": "User subscription cache and rate limiting"},
        {"name": "Postgres", "desc": "Persist user preferences and history"}
    ],
    "db_schema": "CREATE TABLE users (...); CREATE TABLE subscriptions (...);",
    "mermaid": "graph TD; Client-->Gateway; Gateway-->Service; Service-->Kafka; Kafka-->Workers; Workers-->Push;",
    "tech_stack": ["FastAPI", "Postgres", "Redis", "Kafka", "FCM/APNs"],
    "integration_steps": [
        "1. Create Postgres schema",
        "2. Deploy Kafka cluster",
        "3. Implement worker pool"
    ],
    "rationale": "Chose Kafka for durable fanout; Redis for fast lookups; eventual consistency chosen to favor availability."
}

@router.post("/{session_id}/finalize", response_model=FinalizeResponse)
def finalize_session(session_id: str = Path(..., description="ID of the session")):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    session = sessions[session_id]

    # Optional: validate all questions answered
    if session["questions"]:
        raise HTTPException(status_code=400, detail="Not all questions answered yet")

    # Here: Normally call LLM with session['prompt'] + session['answers']
    # For now, return MOCK_FINAL_DESIGN
    session["final_design"] = MOCK_FINAL_DESIGN

    return MOCK_FINAL_DESIGN