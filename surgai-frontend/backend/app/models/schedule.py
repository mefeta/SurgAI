from sqlalchemy import Column, Integer, String, DateTime, func
from app.database import Base


class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, index=True)
    surgical_case_id = Column(Integer, nullable=True, index=True)
    case_id = Column(String(50), nullable=True)

    scheduled_date = Column(DateTime, nullable=False)
    start_time = Column(String(20), nullable=True)
    end_time = Column(String(20), nullable=True)
    room_number = Column(String(50), nullable=True)
    assigned_surgeon = Column(String(200), nullable=True)
    operation_type = Column(String(200), nullable=True)
    predicted_duration = Column(Integer, nullable=True)
    risk_level = Column(String(20), nullable=True)
    schedule_status = Column(String(20), nullable=False, default="scheduled")
    conflict_warning = Column(String(500), nullable=True)

    created_at = Column(DateTime, server_default=func.now())
