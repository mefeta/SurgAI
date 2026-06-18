from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ReportGenerateRequest(BaseModel):
    report_type: str
    related_case_id: Optional[str] = None


class ReportSection(BaseModel):
    title: str
    content: str


class ReportGenerateResponse(BaseModel):
    report_id: int
    report_type: str
    title: str
    generated_at: str
    status: str
    summary: Optional[str] = None
    sections: list[ReportSection] = []


class ReportResponse(BaseModel):
    id: int
    report_type: str
    title: str
    related_case_id: Optional[str] = None
    report_status: str
    summary: Optional[str] = None
    generated_at: Optional[datetime] = None
    sections: list[ReportSection] = []

    class Config:
        from_attributes = True


class ReportListResponse(BaseModel):
    total: int
    reports: list[ReportResponse]
