from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.models.entities import *
from app.api.endpoints import api_router
from app.sim.seeder import seed_database

# Initialize database schema
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="NEXORA AI – Autonomous Enterprise IT Resolution & Intelligence Platform",
    description="Backend AIIL Graph, Real Stateful Tool Engine, Multi-Agent Orchestration, Chaos Lab",
    version=settings.VERSION,
    lifespan=lifespan
)

# Enable CORS for local Vite development & production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {
        "platform": "NEXORA AI",
        "status": "ONLINE",
        "version": settings.VERSION,
        "docs_url": "/docs",
        "api_prefix": "/api/v1"
    }

@app.get("/health")
def health():
    return {"status": "HEALTHY", "aiil_orchestrator": "ACTIVE", "chaos_lab": "READY"}
