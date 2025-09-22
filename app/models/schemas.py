from pydantic import BaseModel
from typing import Any, List, Dict, Optional
from datetime import datetime

class QuestionResponse(BaseModel):
    topic: str
    questions: List[str]

# -----------------------------
# Session creation
# -----------------------------
class SessionCreateRequest(BaseModel):
    prompt: str

# -----------------------------
# Session creation
# -----------------------------
class SessionCreateResponse(BaseModel):
    session_id: str
    questions: List[str]
    conversation: List[Dict[str, str]] = []  # meta must be string
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

# -----------------------------
# Reply
# -----------------------------
class SessionReplyRequest(BaseModel):
    # Instead of single answer, allow multiple answers
    answers: List[Dict]  # [{"question": str, "answer": str}]

# -----------------------------
# Reply
# -----------------------------
class SessionReplyResponse(BaseModel):
    next_questions: List[str]
    status: str  # "in_progress" or "ready_to_finalize"
    conversation: List[Dict[str, str]] = []  # meta must be string
    updated_at: Optional[datetime] = None

# -----------------------------
# Finalize
# -----------------------------
class ComponentDetails(BaseModel):
    technology_stack: List[str] = []
    responsibilities: List[str] = []


class Component(BaseModel):
    name: str
    description: str
    details: ComponentDetails = ComponentDetails()


class FinalizeResponse(BaseModel):
    summary: str
    components: List[Component] = []
    db_schema: Optional[str] = None
    mermaid: Optional[str] = None
    tech_stack: List[str] = []
    integration_steps: List[str] = []
    rationale: Optional[str] = None
    diagram_url: Optional[str] = None
    diagrams: Optional[List[Any]] = None  # e.g. {"system_architecture": "..."}


# -----------------------------
# Session detail
# -----------------------------
class SessionDetailResponse(BaseModel):
    session_id: str
    prompt: str
    questions: List[str]
    answers: List[Dict[str, str]]
    status: str
    final_design: Optional[dict] = None
    conversation: List[Dict[str, str]] = []  # meta must be string
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
