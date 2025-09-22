from pydantic import BaseModel
from typing import List

class QuestionResponse(BaseModel):
    topic: str
    questions: List[str]
