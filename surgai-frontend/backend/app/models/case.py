from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, func
from app.database import Base


class SurgicalCase(Base):
    __tablename__ = "surgical_cases"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(String(50), unique=True, nullable=False, index=True)

    # Patient info
    patient_age_range = Column(String(20), nullable=True)
    patient_gender = Column(String(20), nullable=True)
    medical_risk_category = Column(String(20), nullable=True)
    asa_score = Column(Integer, nullable=True)

    # Operation info
    operation_type = Column(String(200), nullable=False)
    surgical_specialty = Column(String(200), nullable=True)
    procedure_complexity = Column(String(20), nullable=True)
    estimated_surgical_steps = Column(Integer, nullable=True)
    anatomy_region = Column(String(200), nullable=True)
    emergency_status = Column(String(20), nullable=True)
    anesthesia_type = Column(String(50), nullable=True)
    surgeon_experience_level = Column(String(50), nullable=True)
    assistant_count = Column(Integer, nullable=True)
    operating_room_type = Column(String(100), nullable=True)

    # Clinical factors
    previous_similar_duration = Column(Integer, nullable=True)
    equipment_preparation_time = Column(Integer, nullable=True)
    cleaning_turnover_time = Column(Integer, nullable=True)
    preop_preparation_duration = Column(Integer, nullable=True)

    notes = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default="draft")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
