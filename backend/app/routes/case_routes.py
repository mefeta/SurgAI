from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.case_schema import CaseCreate, CaseUpdate, CaseResponse, CaseListResponse
from app.services.case_service import (
    create_case, get_case, get_cases, update_case, delete_case,
)
from app.models.prediction import Prediction
from app.models.schedule import Schedule
from app.models.case import SurgicalCase

router = APIRouter(prefix="/cases", tags=["Cases"])


@router.post("", response_model=CaseResponse, status_code=201)
def create_new_case(data: CaseCreate, db: Session = Depends(get_db)):
    case = create_case(db, data)
    return case


@router.get("", response_model=CaseListResponse)
def list_cases(
    skip: int = 0,
    limit: int = 50,
    operation_type: str | None = Query(None),
    surgeon: str | None = Query(None),
    risk_level: str | None = Query(None),
    status: str | None = Query(None),
    db: Session = Depends(get_db),
):
    cases = get_cases(
        db, skip=skip, limit=limit,
        operation_type=operation_type,
        surgeon=surgeon,
        risk_level=risk_level,
        status=status,
    )
    return CaseListResponse(total=len(cases), cases=cases)


@router.get("/history")
def get_case_history(
    skip: int = 0,
    limit: int = 50,
    surgeon: str | None = Query(None),
    db: Session = Depends(get_db),
):
    query = (
        db.query(SurgicalCase, Prediction, Schedule)
        .outerjoin(Prediction, Prediction.surgical_case_id == SurgicalCase.id)
        .outerjoin(Schedule, Schedule.surgical_case_id == SurgicalCase.id)
    )

    if surgeon:
        query = query.filter(Schedule.assigned_surgeon == surgeon)

    results = query.order_by(SurgicalCase.id.desc()).offset(skip).limit(limit).all()

    cases = []
    for case, pred, sched in results:
        cases.append({
            "case_id": case.case_id,
            "operation_type": case.operation_type,
            "procedure_complexity": case.procedure_complexity,
            "status": case.status,
            "created_at": case.created_at.isoformat() if case.created_at else None,
            "surgeon": sched.assigned_surgeon if sched else None,
            "predicted_duration": pred.predicted_duration if pred else None,
            "confidence_score": pred.confidence_score if pred else None,
            "risk_level": pred.risk_level if pred else None,
            "scheduled_date": sched.scheduled_date.isoformat() if sched and sched.scheduled_date else None,
            "room_number": sched.room_number if sched else None,
        })

    return {"total": len(cases), "cases": cases}


@router.get("/{case_id}", response_model=CaseResponse)
def get_case_by_id(case_id: str, db: Session = Depends(get_db)):
    case = get_case(db, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


@router.put("/{case_id}", response_model=CaseResponse)
def update_case_by_id(case_id: str, data: CaseUpdate, db: Session = Depends(get_db)):
    case = update_case(db, case_id, data)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


@router.delete("/{case_id}", status_code=204)
def delete_case_by_id(case_id: str, db: Session = Depends(get_db)):
    deleted = delete_case(db, case_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Case not found")


@router.get("/{case_id}/details")
def get_case_details(case_id: str, db: Session = Depends(get_db)):
    case = get_case(db, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    prediction = (
        db.query(Prediction)
        .filter(Prediction.surgical_case_id == case.id)
        .first()
    )
    schedule = (
        db.query(Schedule)
        .filter(Schedule.surgical_case_id == case.id)
        .first()
    )

    return {
        "case": {
            "id": case.id,
            "case_id": case.case_id,
            "operation_type": case.operation_type,
            "procedure_complexity": case.procedure_complexity,
            "status": case.status,
        },
        "prediction": {
            "id": prediction.id,
            "predicted_duration": prediction.predicted_duration,
            "confidence_score": prediction.confidence_score,
            "risk_level": prediction.risk_level,
        } if prediction else None,
        "schedule": {
            "id": schedule.id,
            "scheduled_date": str(schedule.scheduled_date),
            "start_time": schedule.start_time,
            "room_number": schedule.room_number,
        } if schedule else None,
    }
