from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.report_schema import (
    ReportGenerateRequest, ReportGenerateResponse, ReportResponse, ReportListResponse, ReportSection,
)
from app.services.report_service import generate_report, get_reports, get_report

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.post("/generate", response_model=ReportGenerateResponse)
def generate_new_report(data: ReportGenerateRequest, db: Session = Depends(get_db)):
    result = generate_report(db, data.report_type, data.related_case_id)
    sections = [ReportSection(**s) for s in result["sections"]]
    return ReportGenerateResponse(
        report_id=result["report_id"],
        report_type=result["report_type"],
        title=result["title"],
        generated_at=result["generated_at"],
        status=result["status"],
        summary=result["summary"],
        sections=sections,
    )


@router.get("", response_model=ReportListResponse)
def list_reports(db: Session = Depends(get_db)):
    reports = get_reports(db)
    return ReportListResponse(total=len(reports), reports=reports)


@router.get("/{report_id}", response_model=ReportResponse)
def get_report_by_id(report_id: int, db: Session = Depends(get_db)):
    report = get_report(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report
