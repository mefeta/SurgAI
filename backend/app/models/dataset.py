from sqlalchemy import Column, Integer, String, Float, DateTime, func
from app.database import Base


class DatasetUpload(Base):
    __tablename__ = "dataset_uploads"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(500), nullable=False)
    row_count = Column(Integer, nullable=True)
    column_count = Column(Integer, nullable=True)
    data_quality_score = Column(Float, nullable=True)
    missing_value_count = Column(Integer, nullable=True)
    duplicate_count = Column(Integer, nullable=True)
    status = Column(String(20), nullable=False, default="uploaded")

    uploaded_at = Column(DateTime, server_default=func.now())
