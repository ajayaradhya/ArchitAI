from sqlalchemy import create_engine
from app.models.db_models import metadata
from app.core.config import settings

# Remove "+aiosqlite" if present, SQLAlchemy sync engine
engine = create_engine(settings.DATABASE_URL.replace("+aiosqlite", ""), echo=True)

# Drop all tables
print("Dropping all tables...")
metadata.drop_all(engine)
print("Tables dropped successfully!")

# Create tables again
print("Creating tables...")
metadata.create_all(engine)
print("Tables created successfully!")
