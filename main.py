from fastapi import FastAPI
from app.api.v1 import design

app = FastAPI(title="ArchitAI", version="0.1")

# Register routers
app.include_router(design.router)

@app.get("/")
def root():
    return {"message": "Welcome to ArchitAI"}
