from sqlalchemy import MetaData, Table, Column, String, JSON, Enum
import enum

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
    Column("final_design", JSON, nullable=True),
    Column("status", Enum(SessionStatus), default=SessionStatus.in_progress),
)
