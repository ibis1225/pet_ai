from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # LINE Bot
    LINE_CHANNEL_ACCESS_TOKEN: str = ""
    LINE_CHANNEL_SECRET: str = ""

    # Backend API
    BACKEND_API_URL: str = "http://localhost:8000/api/v1"

    # AI
    ANTHROPIC_API_KEY: str = ""

    # Redis (for session management)
    REDIS_URL: str = "redis://localhost:6379/1"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
        "extra": "ignore",  # Allow extra fields from shared .env
    }


settings = Settings()
