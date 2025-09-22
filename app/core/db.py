from databases import Database
from app.core.config import settings

DATABASE_URL = settings.DATABASE_URL
database = Database(DATABASE_URL)
