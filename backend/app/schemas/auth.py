from typing import Annotated

from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    student_class: Annotated[str, Field(min_length=1, validation_alias="class", serialization_alias="class")]
    exam_goal: str = Field(min_length=2, max_length=120)
    preferred_learning_style: str = "step-by-step"
    selected_subjects: list[str] = []

    model_config = {"populate_by_name": True}


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
