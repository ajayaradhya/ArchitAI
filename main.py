from fastapi import FastAPI
from app.api.v1 import design
from app.api.v1 import session  # new

app = FastAPI(title="ArchitAI", version="0.1")

app.include_router(design.router)
app.include_router(session.router)  # register session routes

@app.get("/")
def root():
    return {"message": "Welcome to ArchitAI"}
