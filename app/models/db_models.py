from sqlalchemy import (
    MetaData, Table, Column, String, JSON, Enum, DateTime
)
import enum
from datetime import datetime

metadata = MetaData()

class SessionStatus(str, enum.Enum):
    in_progress = "in_progress"
    ready_to_finalize = "ready_to_finalize"
    completed = "completed"

sessions = Table(
    "sessions",
    metadata,
    Column("id", String, primary_key=True),
    Column("prompt", String, nullable=False),
    Column("questions", JSON, nullable=False),
    Column("answers", JSON, nullable=False),
    Column("conversation", JSON, nullable=True),  # Optional, for direct chat history
    Column("final_design", JSON, nullable=True),
    Column("status", Enum(SessionStatus), default=SessionStatus.in_progress),
    Column("user_id", String, nullable=True),  # For future multi-user support
    Column("created_at", DateTime, default=datetime.utcnow),
    Column("updated_at", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow),
)
