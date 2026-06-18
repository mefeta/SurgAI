import os
import pandas as pd
import numpy as np
from sqlalchemy.orm import Session

from app.models.dataset import DatasetUpload
from app.config import settings

ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".xls"}

REQUIRED_COLUMNS = {
    "operation_type", "patient_age", "risk_level",
    "surgeon_experience", "complexity_score", "actual_duration",
}

OPTIONAL_COLUMNS = {
    "asa_score", "estimated_steps", "previous_duration",
    "anesthesia_type", "assistant_count", "preparation_time", "turnover_time",
}


def validate_file(filename: str) -> tuple[bool, str]:
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return False, "Only CSV and Excel files (.csv, .xlsx, .xls) are accepted."
    return True, ""


def process_upload(db: Session, file, filename: str) -> dict:
    """Process uploaded file and store metadata."""
    ext = os.path.splitext(filename)[1].lower()
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    filepath = os.path.join(settings.UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(file.file.read())

    if ext == ".csv":
        df = pd.read_csv(filepath)
    else:
        df = pd.read_excel(filepath)

    row_count = len(df)
    col_count = len(df.columns)
    missing = int(df.isnull().sum().sum())
    duplicates = int(df.duplicated().sum())

    # Data quality score
    score = 100.0
    score -= (missing / max(1, row_count * col_count)) * 100 * 2
    score -= (duplicates / max(1, row_count)) * 50
    score = max(0, min(100, round(score, 1)))

    # Check required columns
    found_required = REQUIRED_COLUMNS.intersection(df.columns.str.lower())
    missing_req = REQUIRED_COLUMNS - found_required
    if missing_req:
        score -= 10 * len(missing_req)

    record = DatasetUpload(
        filename=filename,
        row_count=row_count,
        column_count=col_count,
        data_quality_score=score,
        missing_value_count=missing,
        duplicate_count=duplicates,
        status="uploaded",
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "id": record.id,
        "filename": filename,
        "row_count": row_count,
        "column_count": col_count,
        "data_quality_score": score,
        "missing_value_count": missing,
        "duplicate_count": duplicates,
        "status": "uploaded",
    }


def get_preview(db: Session, dataset_id: int) -> dict | None:
    record = db.query(DatasetUpload).filter(DatasetUpload.id == dataset_id).first()
    if not record:
        return None

    filepath = os.path.join(settings.UPLOAD_DIR, record.filename)
    if not os.path.exists(filepath):
        return None

    ext = os.path.splitext(record.filename)[1].lower()
    if ext == ".csv":
        df = pd.read_csv(filepath)
    else:
        df = pd.read_excel(filepath)

    return {
        "filename": record.filename,
        "columns": list(df.columns),
        "rows": df.head(20).fillna("").to_dict(orient="records"),
        "total_rows": len(df),
    }


def prepare_dataset(db: Session, dataset_id: int) -> dict | None:
    """Clean dataset: remove duplicates, fill missing values, validate columns."""
    record = db.query(DatasetUpload).filter(DatasetUpload.id == dataset_id).first()
    if not record:
        return None

    filepath = os.path.join(settings.UPLOAD_DIR, record.filename)
    if not os.path.exists(filepath):
        return None

    ext = os.path.splitext(record.filename)[1].lower()
    if ext == ".csv":
        df = pd.read_csv(filepath)
    else:
        df = pd.read_excel(filepath)

    original_count = len(df)
    dup_count = int(df.duplicated().sum())
    df = df.drop_duplicates()

    missing_before = int(df.isnull().sum().sum())
    for col in df.columns:
        if df[col].dtype in ["float64", "int64"]:
            df[col] = df[col].fillna(df[col].median())
        else:
            df[col] = df[col].fillna(df[col].mode().iloc[0] if not df[col].mode().empty else "")
    missing_filled = missing_before

    # Normalize column names
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

    # Save cleaned version
    cleaned_path = filepath.replace(".csv", "_cleaned.csv").replace(".xlsx", "_cleaned.csv")
    df.to_csv(cleaned_path, index=False)

    record.status = "prepared"
    record.data_quality_score = min(100, (record.data_quality_score or 0) + 5)
    db.commit()

    return {
        "filename": record.filename,
        "original_row_count": original_count,
        "cleaned_row_count": len(df),
        "duplicates_removed": dup_count,
        "missing_values_filled": missing_filled,
        "status": "prepared",
    }


def get_datasets(db: Session) -> list[DatasetUpload]:
    return db.query(DatasetUpload).order_by(DatasetUpload.id.desc()).all()
