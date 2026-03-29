from collections import defaultdict
from datetime import datetime

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.interaction import Interaction
from app.models.performance import Performance
from app.models.user import User
from app.schemas.ai import (
    AskDoubtRequest,
    AskDoubtResponse,
    DashboardResponse,
    QuizGenerateRequest,
    QuizQuestion,
    QuizSubmissionRequest,
    QuizSubmissionResponse,
    StudyPlanResponse,
)
from app.services.file_extractor import extract_text_from_upload
from app.services.openai_service import ai_service

router = APIRouter(tags=["student"])


def _get_topic_lists(metrics: list[Performance]) -> tuple[list[str], list[str]]:
    strong_topics = sorted({metric.topic for metric in metrics if metric.accuracy >= 75})
    weak_topics = sorted({metric.topic for metric in metrics if metric.accuracy < 60})
    return strong_topics, weak_topics


def _store_doubt_interaction(
    db: Session,
    current_user: User,
    subject: str,
    topic: str,
    question: str,
    answer: str,
) -> None:
    interaction = Interaction(
        user_id=current_user.id,
        subject=subject,
        topic=topic,
        interaction_type="doubt",
        question=question,
        answer=answer,
        correct=True,
        time_taken=0,
    )
    db.add(interaction)


@router.post("/ask-doubt", response_model=AskDoubtResponse)
def ask_doubt(
    payload: AskDoubtRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AskDoubtResponse:
    if not payload.question.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Question cannot be empty")

    metrics = db.scalars(select(Performance).where(Performance.user_id == current_user.id)).all()
    _, weak_topics = _get_topic_lists(metrics)
    result = ai_service.generate_doubt_answer(
        current_user,
        weak_topics,
        payload.subject,
        payload.topic,
        payload.question,
        payload.learning_style,
    )
    _store_doubt_interaction(db, current_user, payload.subject, payload.topic, payload.question, result["answer"])
    return AskDoubtResponse(**result)


@router.post("/ask-doubt-file", response_model=AskDoubtResponse)
async def ask_doubt_file(
    subject: str = Form(...),
    topic: str = Form(...),
    learning_style: str = Form("step-by-step"),
    question: str = Form("Explain this file simply and clearly."),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AskDoubtResponse:
    subject = subject.strip()
    topic = topic.strip()
    learning_style = learning_style.strip()
    question = question.strip()

    if not subject or not topic:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Subject and topic are required.")

    extracted_text = await extract_text_from_upload(file)
    metrics = db.scalars(select(Performance).where(Performance.user_id == current_user.id)).all()
    _, weak_topics = _get_topic_lists(metrics)
    result = ai_service.generate_file_explanation(
        current_user,
        weak_topics,
        subject,
        topic,
        learning_style,
        file.filename or "uploaded file",
        extracted_text,
        question,
    )
    interaction_question = f"{question}\n\nUploaded file: {file.filename or 'uploaded file'}"
    _store_doubt_interaction(db, current_user, subject, topic, interaction_question, result["answer"])
    return AskDoubtResponse(**result)


@router.post("/generate-quiz", response_model=list[QuizQuestion])
def generate_quiz(
    payload: QuizGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[QuizQuestion]:
    if payload.num_questions < 1:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="At least one question is required")

    metrics = db.scalars(select(Performance).where(Performance.user_id == current_user.id)).all()
    return ai_service.generate_quiz(current_user, metrics, payload.subject, payload.topic, payload.num_questions)


@router.post("/submit-quiz", response_model=QuizSubmissionResponse)
def submit_quiz(
    payload: QuizSubmissionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> QuizSubmissionResponse:
    if not payload.answers:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quiz answers cannot be empty")

    updated_topics: set[str] = set()
    correct_count = 0

    for item in payload.answers:
        is_correct = item.selected_answer == item.correct_answer
        if is_correct:
            correct_count += 1

        interaction = Interaction(
            user_id=current_user.id,
            subject=item.subject,
            topic=item.topic,
            interaction_type="quiz",
            question=item.question,
            answer=item.selected_answer,
            correct=is_correct,
            time_taken=item.time_taken,
        )
        db.add(interaction)

        metric = db.scalar(
            select(Performance).where(
                Performance.user_id == current_user.id,
                Performance.topic == item.topic,
                Performance.subject == item.subject,
            )
        )

        if not metric:
            metric = Performance(
                user_id=current_user.id,
                subject=item.subject,
                topic=item.topic,
                accuracy=100 if is_correct else 0,
                avg_time=item.time_taken,
                attempts=1,
            )
            db.add(metric)
        else:
            # Convert the stored running accuracy back into a correct-answer count,
            # then fold in the latest answer and update the rolling average time.
            total_correct = (metric.accuracy / 100 * metric.attempts) + (1 if is_correct else 0)
            metric.attempts += 1
            metric.accuracy = round((total_correct / metric.attempts) * 100, 2)
            metric.avg_time = round(((metric.avg_time * (metric.attempts - 1)) + item.time_taken) / metric.attempts, 2)
            metric.updated_at = datetime.utcnow()

        updated_topics.add(item.topic)

    total = len(payload.answers)
    accuracy = round((correct_count / total) * 100, 2) if total else 0
    return QuizSubmissionResponse(score=correct_count, total=total, accuracy=accuracy, updated_topics=sorted(updated_topics))


@router.get("/dashboard", response_model=DashboardResponse)
def dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DashboardResponse:
    metrics = db.scalars(select(Performance).where(Performance.user_id == current_user.id)).all()
    interactions = db.scalars(
        select(Interaction).where(Interaction.user_id == current_user.id).order_by(Interaction.created_at.desc()).limit(10)
    ).all()

    strong_topics, weak_topics = _get_topic_lists(metrics)

    grouped_trend: dict[str, list[bool]] = defaultdict(list)
    for item in reversed(interactions):
        key = item.created_at.strftime("%Y-%m-%d")
        grouped_trend[key].append(item.correct)

    accuracy_trend = [
        {"date": day, "accuracy": round((sum(values) / len(values)) * 100, 2)}
        for day, values in grouped_trend.items()
    ]

    recent_activity = [
        {
            "topic": item.topic,
            "subject": item.subject,
            "correct": item.correct,
            "time_taken": item.time_taken,
            "created_at": item.created_at.isoformat(),
        }
        for item in interactions
    ]

    return DashboardResponse(
        accuracy_trend=accuracy_trend,
        topic_strength=metrics,
        strong_topics=strong_topics,
        weak_topics=weak_topics,
        recent_activity=recent_activity,
    )


@router.get("/study-plan", response_model=StudyPlanResponse)
def study_plan(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> StudyPlanResponse:
    metrics = db.scalars(select(Performance).where(Performance.user_id == current_user.id)).all()
    _, weak_topics = _get_topic_lists(metrics)
    result = ai_service.generate_study_plan(current_user, weak_topics)
    return StudyPlanResponse(**result)
