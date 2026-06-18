from sqlalchemy import Column, Integer, String, Text, DateTime, func
from app.database import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    report_type = Column(String(100), nullable=False)
    title = Column(String(300), nullable=False)
    related_case_id = Column(String(50), nullable=True)
    report_status = Column(String(20), nullable=False, default="generating")
    report_content_json = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)

    generated_at = Column(DateTime, server_default=func.now())
