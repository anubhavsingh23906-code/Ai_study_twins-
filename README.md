# AI Study Twin

AI Study Twin is a full-stack personalized AI tutor MVP with:

- JWT authentication
- AI doubt solving
- Adaptive quiz generation
- Performance tracking dashboards
- Topic strength modeling
- AI-generated daily study plans

## Folder Structure

```text
ai-study-twin/
|-- backend/
|   |-- app/
|   |   |-- api/
|   |   |-- core/
|   |   |-- db/
|   |   |-- models/
|   |   |-- schemas/
|   |   |-- services/
|   |   `-- main.py
|   |-- sql/
|   |   `-- schema.sql
|   |-- .env.example
|   `-- requirements.txt
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- api/
|   |   |-- components/
|   |   |-- context/
|   |   |-- hooks/
|   |   |-- layouts/
|   |   |-- pages/
|   |   |-- utils/
|   |   |-- App.jsx
|   |   |-- index.css
|   |   `-- main.jsx
|   |-- .env.example
|   |-- index.html
|   |-- package.json
|   |-- postcss.config.js
|   |-- tailwind.config.js
|   `-- vite.config.js
`-- README.md
```

## Backend Setup

1. Create a PostgreSQL database named `ai_study_twin`.
2. Copy `backend/.env.example` to `backend/.env` and update the values.
3. Create and activate a Python virtual environment.
4. Install dependencies:

```bash
cd backend
pip install -r requirements.txt
```

5. Start the API server:

```bash
uvicorn app.main:app --reload
```

The backend runs on `http://localhost:8000`.

For quick local development without PostgreSQL, the backend now falls back to a local SQLite file if `DATABASE_URL` is not set. Production should still use PostgreSQL via `backend/.env`.

## Frontend Setup

1. Copy `frontend/.env.example` to `frontend/.env`.
2. Install dependencies:

```bash
cd frontend
npm install
```

3. Start the frontend:

```bash
npm run dev
```

The frontend runs on `http://localhost:5173`.

## Database Schema

The SQL schema is available in [backend/sql/schema.sql](/C:/Users/anubh/Desktop/ai-study-twin/backend/sql/schema.sql).

## API Endpoints

- `POST /api/signup`
- `POST /api/login`
- `GET /api/profile`
- `POST /api/ask-doubt`
- `POST /api/generate-quiz`
- `POST /api/submit-quiz`
- `GET /api/dashboard`
- `GET /api/study-plan`

## API Integration Examples

### Signup

```bash
curl -X POST http://localhost:8000/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ananya",
    "email": "ananya@example.com",
    "password": "study123",
    "class": "12",
    "exam_goal": "JEE Advanced",
    "preferred_learning_style": "step-by-step",
    "selected_subjects": ["Mathematics", "Physics"]
  }'
```

### Login

```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ananya@example.com",
    "password": "study123"
  }'
```

### Ask Doubt

```bash
curl -X POST http://localhost:8000/api/ask-doubt \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Mathematics",
    "topic": "Integration",
    "question": "Explain how to solve integral of x squared.",
    "learning_style": "step-by-step"
  }'
```

### Generate Quiz

```bash
curl -X POST http://localhost:8000/api/generate-quiz \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Physics",
    "topic": "Kinematics",
    "num_questions": 5
  }'
```

## OpenAI Integration Notes

- Add your API key in `backend/.env`.
- The backend uses the official OpenAI Python SDK `responses.create(...)` flow.
- If no API key is present, the app still works in fallback mode with deterministic placeholder tutor responses and quiz content.

## Scalability Notes

- FastAPI routes are split by domain.
- SQLAlchemy models and Pydantic schemas are separated for easier extension.
- The AI service is isolated so prompt logic can evolve independently.
- The dashboard is ready for richer analytics or chart sources later.

## Verification

- Backend Python files were syntax-checked locally with `python -` compilation.
- Dependency installation and live app startup were not run here because this workspace does not yet have Python/npm packages installed.
