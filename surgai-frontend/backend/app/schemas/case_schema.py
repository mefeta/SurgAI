from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CaseCreate(BaseModel):
    case_id: Optional[str] = None
    patient_age_range: Optional[str] = None
    patient_gender: Optional[str] = None
    medical_risk_category: Optional[str] = None
    asa_score: Optional[int] = Field(None, ge=1, le=5)
    operation_type: str
    surgical_specialty: Optional[str] = None
    procedure_complexity: Optional[str] = None
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
    status: Optional[str] = "draft"


class CaseUpdate(BaseModel):
    patient_age_range: Optional[str] = None
    patient_gender: Optional[str] = None
    medical_risk_category: Optional[str] = None
    asa_score: Optional[int] = Field(None, ge=1, le=5)
    operation_type: Optional[str] = None
    procedure_complexity: Optional[str] = None
    estimated_surgical_steps: Optional[int] = Field(None, ge=0)
    surgeon_experience_level: Optional[str] = None
    assistant_count: Optional[int] = Field(None, ge=0)
    notes: Optional[str] = None
    status: Optional[str] = None


class CaseResponse(BaseModel):
    id: int
    case_id: str
    patient_age_range: Optional[str] = None
    patient_gender: Optional[str] = None
    medical_risk_category: Optional[str] = None
    asa_score: Optional[int] = None
    operation_type: str
    surgical_specialty: Optional[str] = None
    procedure_complexity: Optional[str] = None
    estimated_surgical_steps: Optional[int] = None
    anatomy_region: Optional[str] = None
    emergency_status: Optional[str] = None
    anesthesia_type: Optional[str] = None
    surgeon_experience_level: Optional[str] = None
    assistant_count: Optional[int] = None
    operating_room_type: Optional[str] = None
    previous_similar_duration: Optional[int] = None
    equipment_preparation_time: Optional[int] = None
    cleaning_turnover_time: Optional[int] = None
    preop_preparation_duration: Optional[int] = None
    notes: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CaseListResponse(BaseModel):
    total: int
    cases: list[CaseResponse]
