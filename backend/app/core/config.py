import os

class Settings:
    PROJECT_NAME: str = "NEXORA AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "nexora-super-secret-enterprise-key-2026-tcs-hackathon")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./nexora.db")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    SIMULATION_MODE: bool = os.getenv("SIMULATION_MODE", "true").lower() == "true"
    CHAOS_LAB_ENABLED: bool = True

settings = Settings()
