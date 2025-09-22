from pydantic import BaseModel
from typing import List, Dict, Any

class QuestionResponse(BaseModel):
    topic: str
    questions: List[str]

# Request model
class SessionCreateRequest(BaseModel):
    prompt: str

# Response model
class SessionCreateResponse(BaseModel):
    session_id: str
    questions: list[str]

# Session creation
class SessionCreateRequest(BaseModel):
    prompt: str

class SessionCreateResponse(BaseModel):
    session_id: str
    questions: List[str]

# Reply
class SessionReplyRequest(BaseModel):
    answer: str

class SessionReplyResponse(BaseModel):
    next_questions: List[str]
    status: str  # "in_progress" or "ready_to_finalize"


class Component(BaseModel):
    name: str
    desc: str

class FinalizeResponse(BaseModel):
    summary: str
    components: List[Component]
    db_schema: str
    mermaid: str
    tech_stack: List[str]
    integration_steps: List[str]
    rationale: str