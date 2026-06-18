import re
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.case import SurgicalCase
from app.models.schedule import Schedule
from app.models.prediction import Prediction
from app.schemas.case_schema import CaseCreate, CaseUpdate


def create_case(db: Session, data: CaseCreate) -> SurgicalCase:
    case_id = data.case_id or _next_case_number(db)
    case = SurgicalCase(
        case_id=case_id,
        **data.model_dump(exclude={"case_id"}),
    )
    db.add(case)
    db.commit()
    db.refresh(case)
    return case


def _next_case_number(db: Session) -> str:
    last = db.query(SurgicalCase).order_by(SurgicalCase.id.desc()).first()
    if last and last.case_id:
        matches = re.findall(r'(\d+)', last.case_id)
        num = (int(matches[-1]) + 1) if matches else 1
    else:
        num = 1
    return f"CASE-2026-{num:04d}"


def get_case(db: Session, case_id: str) -> SurgicalCase | None:
    return db.query(SurgicalCase).filter(SurgicalCase.case_id == case_id).first()


def get_case_by_id(db: Session, case_id_int: int) -> SurgicalCase | None:
    return db.query(SurgicalCase).filter(SurgicalCase.id == case_id_int).first()


def get_cases(
    db: Session,
    skip: int = 0,
    limit: int = 50,
    operation_type: str | None = None,
    surgeon: str | None = None,
    risk_level: str | None = None,
    status: str | None = None,
) -> list[SurgicalCase]:
    query = db.query(SurgicalCase)
    filters = []
    if operation_type:
        filters.append(SurgicalCase.operation_type.ilike(f"%{operation_type}%"))
    if status:
        filters.append(SurgicalCase.status == status)
    if surgeon or risk_level:
        # Join through Schedule and Prediction for filtering
        if surgeon:
            query = query.join(Schedule, Schedule.surgical_case_id == SurgicalCase.id)
            filters.append(Schedule.assigned_surgeon.ilike(f"%{surgeon}%"))
        if risk_level:
            query = query.join(Prediction, Prediction.surgical_case_id == SurgicalCase.id)
            filters.append(Prediction.risk_level.ilike(f"%{risk_level}%"))
    if filters:
        query = query.filter(and_(*filters))
    return query.order_by(SurgicalCase.id.desc()).offset(skip).limit(limit).all()


def update_case(db: Session, case_id: str, data: CaseUpdate) -> SurgicalCase | None:
    case = get_case(db, case_id)
    if not case:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(case, field, value)
    case.status = data.status or case.status
    db.commit()
    db.refresh(case)
    return case


def delete_case(db: Session, case_id: str) -> bool:
    case = get_case(db, case_id)
    if case:
        db.delete(case)
        db.commit()
        return True
    return False


def get_case_count(db: Session) -> int:
    return db.query(SurgicalCase).count()
