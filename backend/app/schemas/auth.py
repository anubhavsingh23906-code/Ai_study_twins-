from typing import Annotated

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator


class SignupRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    student_class: Annotated[str, Field(min_length=1)]
    exam_goal: str = Field(min_length=2, max_length=120)
    preferred_learning_style: str = "step-by-step"
    selected_subjects: list[str] = Field(default_factory=list)

    model_config = {"populate_by_name": True}

    @model_validator(mode="before")
    @classmethod
    def remap_legacy_class_key(cls, data):
        if isinstance(data, dict) and "class" in data and "student_class" not in data:
            data = {**data, "student_class": data["class"]}
        return data

    @field_validator("name", "student_class", "exam_goal", "preferred_learning_style", mode="before")
    @classmethod
    def strip_text(cls, value: str) -> str:
        return value.strip() if isinstance(value, str) else value

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower() if isinstance(value, str) else value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower() if isinstance(value, str) else value


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
