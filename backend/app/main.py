from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.api.routes_auth import router as auth_router
from app.api.routes_student import router as student_router
from app.core.config import get_settings
from app.db.base import Base
from app.db.session import engine

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title=settings.app_name, debug=settings.debug, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(SQLAlchemyError)
async def database_exception_handler(_, exc: SQLAlchemyError) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={"detail": "A database error occurred. Please try again."},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(status_code=422, content={"detail": exc.errors()})


@app.get("/health")
def health() -> dict[str, str | bool]:
    db_ok = True
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except SQLAlchemyError:
        db_ok = False

    return {
        "status": "ok" if db_ok else "degraded",
        "database": db_ok,
        "environment": settings.environment,
    }


app.include_router(auth_router, prefix=settings.api_prefix)
app.include_router(student_router, prefix=settings.api_prefix)
