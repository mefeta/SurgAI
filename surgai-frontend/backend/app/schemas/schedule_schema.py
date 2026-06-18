from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class ScheduleCreate(BaseModel):
    surgical_case_id: Optional[int] = None
    case_id: Optional[str] = None
    scheduled_date: date
    start_time: str
    end_time: Optional[str] = None
    room_number: str
    assigned_surgeon: Optional[str] = None
    operation_type: Optional[str] = None
    predicted_duration: Optional[int] = None
    risk_level: Optional[str] = None
    schedule_status: Optional[str] = "scheduled"


class ScheduleUpdate(BaseModel):
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    room_number: Optional[str] = None
    assigned_surgeon: Optional[str] = None
    schedule_status: Optional[str] = None


class ScheduleResponse(BaseModel):
    id: int
    surgical_case_id: Optional[int] = None
    case_id: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    room_number: Optional[str] = None
    assigned_surgeon: Optional[str] = None
    operation_type: Optional[str] = None
    predicted_duration: Optional[int] = None
    risk_level: Optional[str] = None
    schedule_status: str
    conflict_warning: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ScheduleListResponse(BaseModel):
    total: int
    schedules: list[ScheduleResponse]
