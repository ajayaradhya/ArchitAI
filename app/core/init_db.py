from sqlalchemy import create_engine
from app.models.db_models import metadata
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL.replace("+aiosqlite", ""), echo=True)
metadata.create_all(engine)

print("Tables created successfully!")
