import json
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.report import Report
from app.models.prediction import Prediction
from app.models.case import SurgicalCase

REPORT_TYPES = {
    "prediction_report": {
        "title": "Operation Duration Prediction Report",
        "description": "Complete prediction analysis with duration estimates and confidence scores.",
    },
    "test_validation_report": {
        "title": "System Test Report",
        "description": "Validation results and accuracy benchmarks for the prediction model.",
    },
    "monthly_clinic_performance_report": {
        "title": "Monthly Clinic Performance Report",
        "description": "Monthly analysis of scheduling efficiency and resource utilization.",
    },
    "model_performance_report": {
        "title": "Model Accuracy Report",
        "description": "Detailed accuracy metrics and model performance trends.",
    },
    "schedule_optimization_report": {
        "title": "Schedule Optimization Report",
        "description": "AI-driven recommendations for schedule improvement.",
    },
    "clinical_workflow_analysis_report": {
        "title": "Clinical Workflow Analysis Report",
        "description": "Analysis of clinical workflow efficiency and recommendations.",
    },
}


def generate_report(db: Session, report_type: str, related_case_id: str | None = None) -> dict:
    """Generate a mock report with structured sections."""
    info = REPORT_TYPES.get(report_type, {
        "title": "Clinical Report",
        "description": "Generated report.",
    })

    predictions = (
        db.query(Prediction).order_by(Prediction.id.desc()).limit(10).all()
        if report_type == "prediction_report"
        else []
    )

    sections = []

    if report_type == "prediction_report" and predictions:
        sections.append({"title": "Case Information", "content": "Summary of all recent predictions."})
        sections.append({
            "title": "Prediction Results",
            "content": f"Total predictions analyzed: {len(predictions)}. "
                       f"Average predicted duration: {sum(p.predicted_duration for p in predictions) / len(predictions):.0f} min.",
        })
        sections.append({
            "title": "Main Factors",
            "content": "Key factors affecting predictions: procedure complexity, surgeon experience, patient risk level, and historical data.",
        })
        sections.append({
            "title": "Recommendations",
            "content": "Recommended buffer times and scheduling adjustments based on prediction analysis.",
        })
    else:
        sections.append({"title": "Executive Summary", "content": info["description"]})
        sections.append({"title": "Analysis", "content": "Detailed analysis and findings."})
        sections.append({"title": "Recommendations", "content": "Actionable recommendations based on data analysis."})

    summary = info["description"]

    report = Report(
        report_type=report_type,
        title=info["title"],
        related_case_id=related_case_id,
        report_status="generated",
        report_content_json=json.dumps(sections),
        summary=summary,
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return {
        "report_id": report.id,
        "report_type": report_type,
        "title": info["title"],
        "generated_at": datetime.utcnow().isoformat(),
        "status": "generated",
        "summary": summary,
        "sections": sections,
    }


def _report_with_sections(report: Report) -> dict:
    """Convert a Report ORM object to a dict with parsed sections."""
    sections = []
    if report.report_content_json:
        try:
            sections = json.loads(report.report_content_json)
        except (json.JSONDecodeError, TypeError):
            sections = []
    return {
        "id": report.id,
        "report_type": report.report_type,
        "title": report.title,
        "related_case_id": report.related_case_id,
        "report_status": report.report_status,
        "summary": report.summary,
        "generated_at": report.generated_at,
        "sections": sections,
    }


def get_reports(db: Session) -> list[dict]:
    reports = db.query(Report).order_by(Report.id.desc()).all()
    return [_report_with_sections(r) for r in reports]


def get_report(db: Session, report_id: int) -> dict | None:
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        return None
    return _report_with_sections(report)
