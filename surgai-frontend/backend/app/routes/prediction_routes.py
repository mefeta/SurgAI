import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.routes.auth_routes import get_current_user
from app.schemas.prediction_schema import PredictionRequest, PredictionResponse, PredictionListResponse
from app.services.prediction_service import (
    create_prediction, get_prediction, get_predictions, delete_prediction,
)
from app.utils.validators import validate_prediction_input

router = APIRouter(prefix="/predictions", tags=["Predictions"])


@router.post("", response_model=PredictionResponse, status_code=201)
def create_new_prediction(
    data: PredictionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    validate_prediction_input(data.model_dump())
    result = create_prediction(db, data, surgeon_name=current_user.full_name)
    return result


@router.get("", response_model=PredictionListResponse)
def list_predictions(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    predictions = get_predictions(db, skip=skip, limit=limit)
    total = len(predictions)
    return PredictionListResponse(
        total=total,
        predictions=[
            PredictionResponse(
                id=p.id,
                case_id=p.case_id,
                predicted_duration=p.predicted_duration,
                min_duration=p.min_duration,
                max_duration=p.max_duration,
                confidence_score=p.confidence_score,
                risk_level=p.risk_level,
                recommended_buffer=p.recommended_buffer,
                suggested_room_slot=p.suggested_room_slot,
                main_factors=json.loads(p.main_factors) if p.main_factors else [],
                explanation=p.explanation,
                model_version=p.model_version,
                created_at=p.created_at.isoformat() if p.created_at else "",
            )
            for p in predictions
        ],
    )


@router.get("/{prediction_id}", response_model=PredictionResponse)
def get_prediction_by_id(prediction_id: int, db: Session = Depends(get_db)):
    pred = get_prediction(db, prediction_id)
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")
    return PredictionResponse(
        id=pred.id,
        case_id=pred.case_id,
        predicted_duration=pred.predicted_duration,
        min_duration=pred.min_duration,
        max_duration=pred.max_duration,
        confidence_score=pred.confidence_score,
        risk_level=pred.risk_level,
        recommended_buffer=pred.recommended_buffer,
        suggested_room_slot=pred.suggested_room_slot,
        main_factors=json.loads(pred.main_factors) if pred.main_factors else [],
        explanation=pred.explanation,
        model_version=pred.model_version,
        created_at=pred.created_at.isoformat() if pred.created_at else "",
    )


@router.delete("/{prediction_id}", status_code=204)
def delete_prediction_by_id(prediction_id: int, db: Session = Depends(get_db)):
    deleted = delete_prediction(db, prediction_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Prediction not found")
