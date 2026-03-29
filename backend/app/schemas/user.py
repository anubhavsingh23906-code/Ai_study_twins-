from pydantic import BaseModel, EmailStr


class ProfileResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    student_class: str
    exam_goal: str
    preferred_learning_style: str
    selected_subjects: list[str]

    model_config = {"from_attributes": True, "populate_by_name": True}
