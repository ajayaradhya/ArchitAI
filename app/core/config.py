from pydantic import BaseModel

class Settings(BaseModel):
    APP_NAME: str = "ArchitAI"
    VERSION: str = "0.1"
    DATABASE_URL: str = "sqlite+aiosqlite:///./architai.db"  # persistent file

settings = Settings()
