from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AI Study Twin API"
    api_prefix: str = "/api"
    debug: bool = True

    database_url: str = Field(
        default="sqlite:///./ai_study_twin.db"
    )
    secret_key: str = Field(default="change-me-in-production")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24

    openai_api_key: str | None = None
    openai_model: str = "gpt-5"
    frontend_url: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    return Settings()
