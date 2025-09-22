from fastapi import APIRouter
from app.models.schemas import QuestionResponse

router = APIRouter(prefix="/design", tags=["design"])

@router.get("/notify", response_model=QuestionResponse)
def design_notification_system():
    return {
        "topic": "Notification System",
        "questions": [
            "How many active users do you expect?",
            "Do you need real-time delivery?",
            "Should notifications be persistent?",
            "What’s your expected scale (e.g., 1k vs 1M users)?"
        ]
    }
