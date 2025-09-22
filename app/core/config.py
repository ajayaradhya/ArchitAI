from pydantic import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "ArchitAI"
    VERSION: str = "0.1"
    DATABASE_URL: str = "sqlite+aiosqlite:///./architai.db"

    # Gemini API settings
    GOOGLE_GEMINI_API_KEY: str
    GOOGLE_GEMINI_MODEL: str = "gemini-1.5"  # default model

    class Config:
        env_file = ".env"   # automatically load keys from .env
        env_file_encoding = "utf-8"

settings = Settings()
