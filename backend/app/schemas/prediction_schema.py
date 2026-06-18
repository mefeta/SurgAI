from pydantic import BaseModel, Field
from typing import Optional


class PredictionRequest(BaseModel):
    case_id: Optional[str] = None
    patient_age_range: Optional[str] = None
    patient_gender: Optional[str] = None
    medical_risk_category: Optional[str] = None
    asa_score: Optional[int] = Field(None, ge=1, le=5)
    operation_type: str
    surgical_specialty: Optional[str] = None
    procedure_complexity: str
    estimated_surgical_steps: Optional[int] = Field(None, ge=0)
    anatomy_region: Optional[str] = None
    emergency_status: Optional[str] = None
    anesthesia_type: Optional[str] = None
    surgeon_experience_level: Optional[str] = None
    assistant_count: Optional[int] = Field(0, ge=0)
    operating_room_type: Optional[str] = None
    previous_similar_duration: Optional[int] = Field(None, ge=0)
    equipment_preparation_time: Optional[int] = Field(None, ge=0)
    cleaning_turnover_time: Optional[int] = Field(None, ge=0)
    preop_preparation_duration: Optional[int] = Field(None, ge=0)
    notes: Optional[str] = None
    scheduled_date: Optional[str] = None
    scheduled_time: Optional[str] = None


class PredictionResponse(BaseModel):
    id: int
    case_id: Optional[str] = None
    predicted_duration: float
    min_duration: float
    max_duration: float
    confidence_score: float
    risk_level: str
    recommended_buffer: int
    suggested_room_slot: Optional[str] = None
    main_factors: list[str] = []
    explanation: Optional[str] = None
    model_version: Optional[str] = None
    created_at: str
    scheduled: bool = False
    scheduled_date: Optional[str] = None
    scheduled_time: Optional[str] = None

    class Config:
        from_attributes = True


class PredictionListResponse(BaseModel):
    total: int
    predictions: list[PredictionResponse]
