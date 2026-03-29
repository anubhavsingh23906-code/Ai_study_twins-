from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AI Study Twin API"
    api_prefix: str = "/api"
    debug: bool = True
    environment: str = "development"

    database_url: str = Field(
        default="sqlite:///./ai_study_twin.db"
    )
    database_echo: bool = False
    secret_key: str = Field(default="change-me-in-production")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24

    openai_api_key: str | None = None
    openai_model: str = "gpt-5"
    frontend_url: str = "http://localhost:5173"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    openai_timeout_seconds: float = 20.0

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    def allowed_origins(self) -> list[str]:
        raw_values = [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]
        if self.frontend_url not in raw_values:
            raw_values.append(self.frontend_url)
        return raw_values


@lru_cache
def get_settings() -> Settings:
    return Settings()
