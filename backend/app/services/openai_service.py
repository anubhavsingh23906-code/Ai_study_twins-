import json
from datetime import datetime
from typing import Any

from openai import OpenAI

from app.core.config import get_settings
from app.models.performance import Performance
from app.models.user import User
from app.schemas.ai import QuizQuestion, StudyPlanItem


class AIService:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.client = (
            OpenAI(api_key=self.settings.openai_api_key, timeout=self.settings.openai_timeout_seconds)
            if self.settings.openai_api_key
            else None
        )

    def _extract_text(self, response) -> str:
        if hasattr(response, "output_text") and response.output_text:
            return response.output_text
        return ""

    def _safe_json(self, raw_text: str, fallback: dict[str, Any]) -> dict[str, Any]:
        try:
            return json.loads(raw_text)
        except json.JSONDecodeError:
            return fallback

    def _fallback_explanation(self, user: User, topic: str, question: str, learning_style: str) -> str:
        return (
            f"You are studying {topic}. Here is a {learning_style} explanation for your question:\n\n"
            f"{question}\n\n"
            f"1. Start from the core concept and connect it to {user.exam_goal}.\n"
            f"2. Break the problem into smaller steps.\n"
            f"3. Check the final idea with one quick example.\n"
            f"4. Review the pattern again because this is marked as a weak area in your profile."
        )

    def _fallback_quiz(self, subject: str, topic: str, difficulty: str, num_questions: int) -> list[QuizQuestion]:
        return [
            QuizQuestion(
                id=f"{topic}-{index}",
                question=f"{subject}: Practice question {index + 1} on {topic} ({difficulty}).",
                options=["Option A", "Option B", "Option C", "Option D"],
                correct_answer="Option A",
                explanation=f"Option A is correct because it applies the key idea in {topic}.",
                topic=topic,
                difficulty=difficulty,
            )
            for index in range(num_questions)
        ]

    def generate_doubt_answer(
        self,
        user: User,
        weak_topics: list[str],
        subject: str,
        topic: str,
        question: str,
        learning_style: str,
    ) -> dict[str, str]:
        prompt = (
            f"Student profile: class={user.student_class}, exam goal={user.exam_goal}, "
            f"preferred style={learning_style}, subjects={', '.join(user.selected_subjects) or subject}. "
            f"Weak topics: {', '.join(weak_topics) or 'None recorded yet'}.\n"
            f"Task: Answer the doubt in a warm tutor voice. Keep it easy but accurate. "
            f"End with one follow-up practice prompt.\n"
            f"Subject: {subject}\nTopic: {topic}\nQuestion: {question}"
        )

        if not self.client:
            answer = self._fallback_explanation(user, topic, question, learning_style)
            return {"answer": answer, "suggested_follow_up": f"Try solving one more {topic} question on your own."}

        try:
            response = self.client.responses.create(
                model=self.settings.openai_model,
                input=prompt,
            )
            answer = self._extract_text(response).strip() or self._fallback_explanation(user, topic, question, learning_style)
        except Exception:
            answer = self._fallback_explanation(user, topic, question, learning_style)
        follow_up = f"Attempt another {topic} problem and explain your first step aloud."
        return {"answer": answer, "suggested_follow_up": follow_up}

    def generate_file_explanation(
        self,
        user: User,
        weak_topics: list[str],
        subject: str,
        topic: str,
        learning_style: str,
        file_name: str,
        extracted_text: str,
        question: str | None = None,
    ) -> dict[str, str]:
        prompt = (
            f"Student profile: class={user.student_class}, exam goal={user.exam_goal}, "
            f"preferred style={learning_style}, subjects={', '.join(user.selected_subjects) or subject}. "
            f"Weak topics: {', '.join(weak_topics) or 'None recorded yet'}.\n"
            f"Task: Explain the uploaded study material in a warm tutor voice. "
            f"Keep it practical, break down difficult ideas, and end with one follow-up practice prompt.\n"
            f"Subject: {subject}\nTopic: {topic}\nFile name: {file_name}\n"
            f"Student request: {question or 'Explain this file simply and clearly.'}\n"
            f"File content:\n{extracted_text}"
        )

        fallback_answer = (
            f"I reviewed `{file_name}` for {topic}. Here is a {learning_style} explanation:\n\n"
            f"{extracted_text[:1500]}\n\n"
            "Focus on the main definition, the key formula or rule, and one worked example from the material."
        )

        if not self.client:
            return {
                "answer": fallback_answer,
                "suggested_follow_up": f"Pick one idea from {file_name} and solve a short practice question on it.",
            }

        try:
            response = self.client.responses.create(model=self.settings.openai_model, input=prompt)
            answer = self._extract_text(response).strip() or fallback_answer
        except Exception:
            answer = fallback_answer

        return {
            "answer": answer,
            "suggested_follow_up": f"Pick one idea from {file_name} and solve a short practice question on it.",
        }

    def generate_quiz(self, user: User, topic_metrics: list[Performance], subject: str, topic: str, num_questions: int) -> list[QuizQuestion]:
        difficulty = "easy"
        for metric in topic_metrics:
            if metric.topic.lower() == topic.lower():
                difficulty = "easy" if metric.accuracy < 60 else "hard" if metric.accuracy > 80 else "medium"
                break

        if not self.client:
            return self._fallback_quiz(subject, topic, difficulty, num_questions)

        prompt = (
            "Return JSON only with a top-level key `questions`.\n"
            f"Generate {num_questions} multiple-choice quiz questions for subject {subject} on topic {topic}. "
            f"Student is preparing for {user.exam_goal}. Difficulty should be {difficulty}. "
            "Each question must include: id, question, options (4 items), correct_answer, explanation, topic, difficulty."
        )
        try:
            response = self.client.responses.create(model=self.settings.openai_model, input=prompt)
            content = self._extract_text(response)
            parsed = self._safe_json(content, {"questions": []})
            questions = parsed.get("questions", [])
        except Exception:
            questions = []

        if not questions:
            return self._fallback_quiz(subject, topic, difficulty, num_questions)
        return [QuizQuestion(**item) for item in questions]

    def generate_study_plan(self, user: User, weak_topics: list[str]) -> dict[str, Any]:
        if not weak_topics:
            weak_topics = ["Revision", "Timed practice", "Concept refresh"]

        if not self.client:
            plan = [
                StudyPlanItem(
                    title=f"Focus Block {index + 1}",
                    duration_minutes=45,
                    focus=topic,
                    action=f"Review the concept, solve 3 questions, and write one takeaway for {topic}.",
                )
                for index, topic in enumerate(weak_topics[:3])
            ]
            return {
                "generated_at": datetime.utcnow(),
                "summary": "A balanced daily plan focused on your weakest areas and one revision slot.",
                "plan": plan,
            }

        prompt = (
            "Return JSON only with keys `summary` and `plan`.\n"
            f"Create a one-day study plan for a student in class {user.student_class} targeting {user.exam_goal}. "
            f"Weak topics: {', '.join(weak_topics)}. Preferred learning style: {user.preferred_learning_style}. "
            "Plan should have 3 to 5 sessions. Each session needs title, duration_minutes, focus, and action."
        )
        try:
            response = self.client.responses.create(model=self.settings.openai_model, input=prompt)
            parsed = self._safe_json(
                self._extract_text(response),
                {
                    "summary": "Focus first on weak topics, then reinforce confidence with one revision block.",
                    "plan": [
                        {
                            "title": f"Focus Block {index + 1}",
                            "duration_minutes": 45,
                            "focus": topic,
                            "action": f"Review the concept, solve 3 questions, and write one takeaway for {topic}.",
                        }
                        for index, topic in enumerate(weak_topics[:3])
                    ],
                },
            )
        except Exception:
            parsed = {
                "summary": "Focus first on weak topics, then reinforce confidence with one revision block.",
                "plan": [
                    {
                        "title": f"Focus Block {index + 1}",
                        "duration_minutes": 45,
                        "focus": topic,
                        "action": f"Review the concept, solve 3 questions, and write one takeaway for {topic}.",
                    }
                    for index, topic in enumerate(weak_topics[:3])
                ],
            }
        return {
            "generated_at": datetime.utcnow(),
            "summary": parsed.get("summary", "Focus first on weak topics, then reinforce confidence with one revision block."),
            "plan": [StudyPlanItem(**item) for item in parsed.get("plan", [])],
        }


ai_service = AIService()
