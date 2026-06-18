"""
ML prediction service. Uses trained RandomForest model with fallback to rule-based logic.
"""

import os
import warnings
import pandas as pd
import numpy as np
from joblib import load

warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")

from app.config import settings
from app.ml.train_model import (
    CATEGORICAL_FEATURES, NUMERICAL_FEATURES, FEATURES, OPERATION_TYPES,
    BASE_DURATIONS, load_model,
)

_model = None
_encoders = None

OPERATION_TYPE_AVERAGES = {
    "Dental Implant Surgery": 60, "Tooth Extraction": 30, "Root Canal Surgery": 75,
    "Periodontal Surgery": 90, "Wisdom Tooth Removal": 35, "Minor Oral Surgery": 45,
    "Jaw Cyst Removal": 80, "Gum Graft Surgery": 70, "Total Knee Replacement": 120,
    "Cataract Surgery": 45, "Laparoscopic Cholecystectomy": 90, "Spinal Fusion": 180,
    "ACL Reconstruction": 110, "Hip Replacement": 150, "Tonsillectomy": 30,
    "Mastectomy": 90, "Hernia Repair": 60, "Appendectomy": 50,
    "Dental Crown Placement": 55, "Root Canal Therapy": 70, "Coronary Artery Bypass": 240,
}


def _ensure_model_loaded():
    global _model, _encoders
    if _model is None or _encoders is None:
        try:
            _model, _encoders = load_model()
        except Exception:
            _model = None
            _encoders = None
    return _model, _encoders


def _rule_based_prediction(params: dict) -> dict:
    """Fallback rule-based prediction when ML model is unavailable."""
    op_type = params.get("operation_type", "")
    base = OPERATION_TYPE_AVERAGES.get(op_type, 60)
    prev_dur = params.get("previous_similar_duration")
    if prev_dur:
        base = int(prev_dur)

    complexity = params.get("procedure_complexity", "Medium")
    complexity_bonus = {"Low": 0, "Medium": 5, "High": 15}.get(complexity, 5)

    asa = params.get("asa_score", 2)
    asa_bonus = max(0, (asa or 2) - 1) * 3

    emergency = params.get("emergency_status", "Planned")
    emergency_bonus = 10 if emergency == "Emergency" else 0

    experience = params.get("surgeon_experience_level", "Intermediate")
    exp_mod = {"Junior": 12, "Intermediate": 5, "Senior": 0, "Expert": -5}.get(experience, 5)

    assistants = params.get("assistant_count", 0) or 0
    prep = params.get("equipment_preparation_time", 0) or 0
    turnover = params.get("cleaning_turnover_time", 0) or 0

    predicted = base + complexity_bonus + asa_bonus + emergency_bonus + exp_mod
    predicted -= assistants * 1.5
    predicted += prep * 0.3 + turnover * 0.2
    predicted = max(5, round(predicted))

    # Confidence
    confidence = 70
    if prev_dur:
        confidence += 10
    if op_type in OPERATION_TYPE_AVERAGES:
        confidence += 8
    if params.get("procedure_complexity"):
        confidence += 5
    if params.get("surgeon_experience_level"):
        confidence += 4
    confidence = min(98, confidence)

    error = max(5, int(predicted * 0.12))
    min_dur = max(5, predicted - error)
    max_dur = predicted + error + 5

    # Risk
    if complexity == "High" or (asa or 0) >= 4 or emergency == "Emergency":
        risk = "High"
    elif complexity == "Medium" or (asa or 0) >= 3 or predicted > 120:
        risk = "Medium"
    else:
        risk = "Low"

    buffer = 25 if risk == "High" else (15 if risk == "Medium" else 10)

    factors = []
    factors.append(f"Procedure {complexity.lower()} complexity")
    factors.append(f"ASA score of {asa or 2}")
    if experience:
        factors.append(f"{experience} surgeon experience")
    factors.append(f"Historical average ~{base} min")
    if prev_dur:
        factors.append(f"Previous similar case: {prev_dur} min")

    explanation = (
        f"The predicted duration of {predicted} minutes is based on "
        f"{complexity.lower()} complexity, ASA {asa or 2}, "
        f"{experience.lower() if experience else 'average'} surgeon experience, "
        f"and a base duration of {base} minutes for {op_type}."
    )

    return {
        "predicted_duration": predicted,
        "confidence_score": confidence,
        "min_duration": min_dur,
        "max_duration": max_dur,
        "risk_level": risk,
        "recommended_buffer": buffer,
        "main_factors": factors,
        "explanation": explanation,
    }


def predict_operation_duration(params: dict) -> dict:
    """Main prediction function - tries ML model first, falls back to rules."""
    model, encoders = _ensure_model_loaded()

    if model is not None and encoders is not None:
        try:
            return _ml_prediction(params, model, encoders)
        except Exception:
            pass

    return _rule_based_prediction(params)


def _ml_prediction(params: dict, model, encoders) -> dict:
    """Use trained ML model for prediction."""
    row = {}
    for col in CATEGORICAL_FEATURES:
        val = params.get(col)
        if col == "operation_type" and not val:
            val = "Other"
        if col in encoders:
            encoder = encoders[col]
            try:
                row[col] = encoder.transform([str(val)])[0]
            except (ValueError, TypeError):
                row[col] = -1
        else:
            row[col] = -1

    for col in NUMERICAL_FEATURES:
        val = params.get(col, 0)
        row[col] = float(val) if val is not None else 0.0

    x = pd.DataFrame([row])[FEATURES]
    predicted = float(model.predict(x)[0])
    predicted = max(5, round(predicted))

    # Calculate confidence from model's estimator variance
    try:
        predictions = [est.predict(x)[0] for est in model.estimators_[:20]]
        std = np.std(predictions)
        confidence = max(50, min(98, int(100 - std * 0.5)))
    except Exception:
        confidence = 85

    op_type = params.get("operation_type", "")
    prev_dur = params.get("previous_similar_duration")
    if prev_dur:
        confidence = min(98, confidence + 5)
    if op_type:
        confidence = min(98, confidence + 3)
    confidence = min(98, confidence)

    error = max(5, int(predicted * (0.08 + (100 - confidence) * 0.002)))
    min_dur = max(5, predicted - error)
    max_dur = predicted + error + int(error * 0.3)

    complexity = params.get("procedure_complexity", "Medium") or "Medium"
    asa = params.get("asa_score", 2) or 2
    emergency = params.get("emergency_status", "Planned") or "Planned"

    if complexity == "High" or asa >= 4 or emergency == "Emergency":
        risk = "High"
    elif complexity == "Medium" or asa >= 3 or predicted > 120:
        risk = "Medium"
    else:
        risk = "Low"

    buffer = 25 if risk == "High" else (15 if risk == "Medium" else 10)

    factors = []
    factors.append(f"{complexity} procedure complexity")
    factors.append(f"ASA score of {asa}")
    experience = params.get("surgeon_experience_level", "Average")
    factors.append(f"{experience} surgeon experience")
    if prev_dur:
        factors.append(f"Previous similar case: {prev_dur} min")
    else:
        factors.append(f"Historical average for {op_type or 'procedure'}")

    explanation = (
        f"The predicted duration of {predicted} minutes is generated by the "
        f"ML model based on {complexity.lower()} complexity, ASA {asa}, "
        f"and the selected operation type characteristics."
    )

    return {
        "predicted_duration": predicted,
        "confidence_score": confidence,
        "min_duration": min_dur,
        "max_duration": max_dur,
        "risk_level": risk,
        "recommended_buffer": buffer,
        "main_factors": factors,
        "explanation": explanation,
    }


def generate_suggested_room_slot(predicted_duration: int, buffer: int) -> str:
    """Generate a suggested time slot based on duration."""
    total = predicted_duration + buffer
    hours = total // 60
    mins = total % 60
    start_hour = 8
    return f"{start_hour:02d}:00 - {start_hour + hours:02d}:{mins:02d}"
