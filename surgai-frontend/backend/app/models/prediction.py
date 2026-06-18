from sqlalchemy import Column, Integer, Float, String, Text, DateTime, func
from app.database import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    surgical_case_id = Column(Integer, nullable=True, index=True)
    case_id = Column(String(50), nullable=True)

    predicted_duration = Column(Float, nullable=False)
    min_duration = Column(Float, nullable=False)
    max_duration = Column(Float, nullable=False)
    confidence_score = Column(Float, nullable=False)
    risk_level = Column(String(20), nullable=False)
    recommended_buffer = Column(Integer, nullable=False)
    suggested_room_slot = Column(String(50), nullable=True)
    main_factors = Column(Text, nullable=True)
    explanation = Column(Text, nullable=True)
    model_version = Column(String(50), nullable=True)

    created_at = Column(DateTime, server_default=func.now())
