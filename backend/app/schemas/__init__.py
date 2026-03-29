from app.schemas.ai import (
    AskDoubtRequest,
    AskDoubtResponse,
    DashboardResponse,
    QuizGenerateRequest,
    QuizQuestion,
    QuizSubmissionItem,
    QuizSubmissionRequest,
    QuizSubmissionResponse,
    StudyPlanResponse,
)
from app.schemas.auth import LoginRequest, SignupRequest, TokenResponse
from app.schemas.user import ProfileResponse

__all__ = [
    "AskDoubtRequest",
    "AskDoubtResponse",
    "DashboardResponse",
    "LoginRequest",
    "ProfileResponse",
    "QuizGenerateRequest",
    "QuizQuestion",
    "QuizSubmissionItem",
    "QuizSubmissionRequest",
    "QuizSubmissionResponse",
    "SignupRequest",
    "StudyPlanResponse",
    "TokenResponse",
]
