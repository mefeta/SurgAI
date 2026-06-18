import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db, SessionLocal
from app.utils.seed_data import seed_demo_data

from app.routes import (
    prediction_routes,
    case_routes,
    schedule_routes,
    dataset_routes,
    analytics_routes,
    report_routes,
    auth_routes,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database and seed demo data on startup."""
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    init_db()
    db = SessionLocal()
    try:
        seed_demo_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-Powered Surgical Operation Duration Prediction System",
    lifespan=lifespan,
)

# CORS — allow frontend dev servers (any port)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }

# Register routes
app.include_router(auth_routes.router, prefix="/api")
app.include_router(prediction_routes.router, prefix="/api")
app.include_router(case_routes.router, prefix="/api")
app.include_router(schedule_routes.router, prefix="/api")
app.include_router(dataset_routes.router, prefix="/api")
app.include_router(analytics_routes.router, prefix="/api")
app.include_router(report_routes.router, prefix="/api")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
