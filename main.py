from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.api.v1 import design
from app.core.db import database
from app.core.config import settings
from app.api.v1 import session  # new

@asynccontextmanager
async def lifespan(app: FastAPI):
    await database.connect()
    yield
    await database.disconnect()

app = FastAPI(title="ArchitAI", version="0.1", lifespan=lifespan)

app.include_router(design.router)
app.include_router(session.router)  # register session routes

@app.get("/")
def root():
    return {"message": "Welcome to ArchitAI"}

