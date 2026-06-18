from fastapi import HTTPException


def validate_prediction_input(data: dict):
    errors = []

    if not data.get("operation_type"):
        errors.append("operation_type is required")

    if not data.get("procedure_complexity"):
        errors.append("procedure_complexity is required")

    prev_dur = data.get("previous_similar_duration")
    if prev_dur is not None:
        try:
            val = int(prev_dur)
            if val < 0:
                errors.append("previous_similar_duration must be non-negative")
        except (ValueError, TypeError):
            errors.append("previous_similar_duration must be a number")

    asa = data.get("asa_score")
    if asa is not None:
        try:
            val = int(asa)
            if val < 1 or val > 5:
                errors.append("asa_score must be between 1 and 5")
        except (ValueError, TypeError):
            errors.append("asa_score must be a number")

    assistants = data.get("assistant_count", 0)
    if assistants is not None:
        try:
            val = int(assistants)
            if val < 0:
                errors.append("assistant_count must be non-negative")
        except (ValueError, TypeError):
            errors.append("assistant_count must be a number")

    for field in ["equipment_preparation_time", "cleaning_turnover_time", "preop_preparation_duration"]:
        val = data.get(field)
        if val is not None:
            try:
                v = int(val)
                if v < 0:
                    errors.append(f"{field} must be non-negative")
            except (ValueError, TypeError):
                errors.append(f"{field} must be a number")

    if errors:
        raise HTTPException(status_code=422, detail="; ".join(errors))
