from datetime import datetime

from pydantic import BaseModel, Field


class AskDoubtRequest(BaseModel):
    subject: str
    topic: str
    question: str
    learning_style: str = "step-by-step"


class AskDoubtResponse(BaseModel):
    answer: str
    suggested_follow_up: str


class QuizGenerateRequest(BaseModel):
    subject: str
    topic: str
    num_questions: int = Field(default=5, ge=1, le=10)


class QuizQuestion(BaseModel):
    id: str
    question: str
    options: list[str]
    correct_answer: str
    explanation: str
    topic: str
    difficulty: str


class QuizSubmissionItem(BaseModel):
    question: str
    selected_answer: str
    correct_answer: str
    explanation: str
    topic: str
    subject: str
    time_taken: float = 0


class QuizSubmissionRequest(BaseModel):
    answers: list[QuizSubmissionItem]


class QuizSubmissionResponse(BaseModel):
    score: int
    total: int
    accuracy: float
    updated_topics: list[str]


class TopicMetric(BaseModel):
    topic: str
    subject: str
    accuracy: float
    avg_time: float
    attempts: int

    model_config = {"from_attributes": True}


class DashboardResponse(BaseModel):
    accuracy_trend: list[dict]
    topic_strength: list[TopicMetric]
    strong_topics: list[str]
    weak_topics: list[str]
    recent_activity: list[dict]


class StudyPlanItem(BaseModel):
    title: str
    duration_minutes: int
    focus: str
    action: str


class StudyPlanResponse(BaseModel):
    generated_at: datetime
    summary: str
    plan: list[StudyPlanItem]
