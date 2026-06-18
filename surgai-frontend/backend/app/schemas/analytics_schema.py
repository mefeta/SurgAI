from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ModelAnalyticsResponse(BaseModel):
    model_version: str
    accuracy_score: float
    mean_absolute_error: float
    average_error_minutes: float
    confidence_average: float
    training_data_size: int
    last_training_date: Optional[datetime] = None
    model_health_status: str


class ErrorByOperationType(BaseModel):
    operation_type: str
    error_minutes: float


class AccuracyOverTime(BaseModel):
    date: str
    accuracy: float


class PredictedVsActual(BaseModel):
    predicted: float
    actual: float


class RetrainResponse(BaseModel):
    status: str
    message: str
    new_model_version: str


class DashboardStatsResponse(BaseModel):
    today_scheduled_operations: int
    average_predicted_duration: float
    schedule_risk_level: str
    delayed_cases: int
    model_confidence_average: float
    total_analyzed_operations: int
    average_delay_reduction: float
    saved_clinic_hours: float


class RecentActivity(BaseModel):
    action: str
    detail: str
    time: str
