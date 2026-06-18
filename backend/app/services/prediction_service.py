import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.models.prediction import Prediction
from app.models.case import SurgicalCase
from app.models.schedule import Schedule
from app.schemas.prediction_schema import PredictionRequest
from app.services.ml_model_service import predict_operation_duration, generate_suggested_room_slot


def create_prediction(db: Session, data: PredictionRequest, surgeon_name: str | None = None) -> dict:
    """Create a surgical case + prediction, return prediction result."""
    # Create or use existing case_id
    case_id = data.case_id or f"CASE-2026-{_next_case_number(db):04d}"

    # Save the case
    case = SurgicalCase(
        case_id=case_id,
        patient_age_range=data.patient_age_range,
        patient_gender=data.patient_gender,
        medical_risk_category=data.medical_risk_category,
        asa_score=data.asa_score,
        operation_type=data.operation_type,
        surgical_specialty=data.surgical_specialty,
        procedure_complexity=data.procedure_complexity,
        estimated_surgical_steps=data.estimated_surgical_steps,
        anatomy_region=data.anatomy_region,
        emergency_status=data.emergency_status or "Planned",
        anesthesia_type=data.anesthesia_type,
        surgeon_experience_level=data.surgeon_experience_level,
        assistant_count=data.assistant_count or 0,
        operating_room_type=data.operating_room_type,
        previous_similar_duration=data.previous_similar_duration,
        equipment_preparation_time=data.equipment_preparation_time,
        cleaning_turnover_time=data.cleaning_turnover_time,
        preop_preparation_duration=data.preop_preparation_duration,
        notes=data.notes,
        status="predicted",
    )
    db.add(case)
    db.flush()

    # Run prediction
    params = {
        "operation_type": data.operation_type,
        "procedure_complexity": data.procedure_complexity,
        "asa_score": data.asa_score,
        "emergency_status": data.emergency_status or "Planned",
        "surgeon_experience_level": data.surgeon_experience_level,
        "assistant_count": data.assistant_count or 0,
        "previous_similar_duration": data.previous_similar_duration,
        "equipment_preparation_time": data.equipment_preparation_time,
        "cleaning_turnover_time": data.cleaning_turnover_time,
        "preop_preparation_duration": data.preop_preparation_duration,
        "medical_risk_category": data.medical_risk_category,
        "patient_age_range": data.patient_age_range,
    }
    result = predict_operation_duration(params)

    slot = generate_suggested_room_slot(result["predicted_duration"], result["recommended_buffer"])

    prediction = Prediction(
        surgical_case_id=case.id,
        case_id=case_id,
        predicted_duration=result["predicted_duration"],
        min_duration=result["min_duration"],
        max_duration=result["max_duration"],
        confidence_score=result["confidence_score"],
        risk_level=result["risk_level"],
        recommended_buffer=result["recommended_buffer"],
        suggested_room_slot=slot,
        main_factors=json.dumps(result["main_factors"]),
        explanation=result["explanation"],
        model_version="demo-v1.0",
    )
    db.add(prediction)

    # Create a schedule entry linked to this surgeon
    if surgeon_name:
        if data.scheduled_date:
            sched_date = datetime.strptime(data.scheduled_date, "%Y-%m-%d")
        else:
            sched_date = datetime.utcnow() + timedelta(days=1)

        start_time = data.scheduled_time or "08:00"
        start_h, start_m = map(int, start_time.split(":"))
        total_mins = start_h * 60 + start_m + result["predicted_duration"] + result["recommended_buffer"]
        end_h = (total_mins // 60) % 24
        end_m = total_mins % 60
        computed_end = f"{end_h:02d}:{end_m:02d}"

        # Check for scheduling conflicts
        conflict_warning = None
        try:
            from app.schemas.schedule_schema import ScheduleCreate
            from app.services.schedule_service import _detect_conflict

            sched_data = ScheduleCreate(
                scheduled_date=sched_date.date(),
                start_time=start_time,
                end_time=computed_end,
                room_number=data.operating_room_type or "OR-1",
                assigned_surgeon=surgeon_name,
                operation_type=data.operation_type,
                predicted_duration=result["predicted_duration"],
                risk_level=result["risk_level"],
                schedule_status="scheduled",
            )
            conflict_warning = _detect_conflict(db, sched_data)
        except Exception:
            pass

        schedule = Schedule(
            surgical_case_id=case.id,
            case_id=case_id,
            scheduled_date=sched_date,
            start_time=start_time,
            end_time=computed_end,
            room_number=data.operating_room_type or "OR-1",
            assigned_surgeon=surgeon_name,
            operation_type=data.operation_type,
            predicted_duration=result["predicted_duration"],
            risk_level=result["risk_level"],
            schedule_status="scheduled",
            conflict_warning=conflict_warning,
        )
        db.add(schedule)

    db.commit()
    db.refresh(prediction)
    db.refresh(case)

    return {
        "id": prediction.id,
        "case_id": case_id,
        "predicted_duration": result["predicted_duration"],
        "min_duration": result["min_duration"],
        "max_duration": result["max_duration"],
        "confidence_score": result["confidence_score"],
        "risk_level": result["risk_level"],
        "recommended_buffer": result["recommended_buffer"],
        "suggested_room_slot": slot,
        "main_factors": result["main_factors"],
        "explanation": result["explanation"],
        "model_version": "demo-v1.0",
        "created_at": prediction.created_at.isoformat() if prediction.created_at else "",
        "scheduled": surgeon_name is not None,
        "scheduled_date": sched_date.strftime("%Y-%m-%d") if surgeon_name else None,
        "scheduled_time": start_time if surgeon_name else None,
    }


def _next_case_number(db: Session) -> int:
    last = db.query(SurgicalCase).order_by(SurgicalCase.id.desc()).first()
    if last:
        import re
        matches = re.findall(r'(\d+)', last.case_id or "")
        return (int(matches[-1]) + 1) if matches else 1
    return 1


def get_prediction(db: Session, prediction_id: int) -> Prediction | None:
    return db.query(Prediction).filter(Prediction.id == prediction_id).first()


def get_predictions(db: Session, skip: int = 0, limit: int = 50) -> list[Prediction]:
    return db.query(Prediction).order_by(Prediction.id.desc()).offset(skip).limit(limit).all()


def delete_prediction(db: Session, prediction_id: int) -> bool:
    pred = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if pred:
        db.delete(pred)
        db.commit()
        return True
    return False


def get_prediction_count(db: Session) -> int:
    return db.query(Prediction).count()
