from sqlalchemy import Column, Integer, Float, String, DateTime, func
from app.database import Base


class ModelMetrics(Base):
    __tablename__ = "model_metrics"

    id = Column(Integer, primary_key=True, index=True)
    model_version = Column(String(50), nullable=False)
    accuracy_score = Column(Float, nullable=False)
    mean_absolute_error = Column(Float, nullable=False)
    average_error_minutes = Column(Float, nullable=False)
    confidence_average = Column(Float, nullable=False)
    training_data_size = Column(Integer, nullable=False)
    model_health_status = Column(String(20), nullable=False, default="Healthy")

    last_training_date = Column(DateTime, server_default=func.now())
    created_at = Column(DateTime, server_default=func.now())
