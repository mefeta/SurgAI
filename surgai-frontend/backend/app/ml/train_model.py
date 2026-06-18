"""
Train a demo ML model for surgical duration prediction.
This generates a synthetic dataset and trains a RandomForestRegressor.
"""

import os
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from joblib import dump
import random

from app.config import settings

OPERATION_TYPES = [
    "Dental Implant Surgery", "Tooth Extraction", "Root Canal Surgery",
    "Periodontal Surgery", "Wisdom Tooth Removal", "Minor Oral Surgery",
    "Jaw Cyst Removal", "Gum Graft Surgery", "Total Knee Replacement",
    "Cataract Surgery", "Laparoscopic Cholecystectomy", "Spinal Fusion",
    "ACL Reconstruction", "Hip Replacement", "Tonsillectomy",
]

SPECIALTIES = {
    "Dental Implant Surgery": "Oral Surgery", "Tooth Extraction": "Oral Surgery",
    "Root Canal Surgery": "Endodontics", "Periodontal Surgery": "Periodontics",
    "Wisdom Tooth Removal": "Oral Surgery", "Minor Oral Surgery": "Oral Surgery",
    "Jaw Cyst Removal": "Oral Surgery", "Gum Graft Surgery": "Periodontics",
    "Total Knee Replacement": "Orthopedics", "Cataract Surgery": "Ophthalmology",
    "Laparoscopic Cholecystectomy": "General Surgery", "Spinal Fusion": "Neurosurgery",
    "ACL Reconstruction": "Orthopedics", "Hip Replacement": "Orthopedics",
    "Tonsillectomy": "ENT",
}

AGE_RANGES = ["0-18", "19-35", "36-55", "56-70", "70+"]
RISK_LEVELS = ["Low", "Medium", "High"]
COMPLEXITY = ["Low", "Medium", "High"]
EXPERIENCE = ["Junior", "Intermediate", "Senior", "Expert"]
ANESTHESIA = ["General", "Regional", "Local", "Sedation"]
EMERGENCY = ["Planned", "Emergency"]
GENDERS = ["Male", "Female"]

BASE_DURATIONS = {
    "Dental Implant Surgery": 60, "Tooth Extraction": 30, "Root Canal Surgery": 75,
    "Periodontal Surgery": 90, "Wisdom Tooth Removal": 35, "Minor Oral Surgery": 45,
    "Jaw Cyst Removal": 80, "Gum Graft Surgery": 70, "Total Knee Replacement": 120,
    "Cataract Surgery": 45, "Laparoscopic Cholecystectomy": 90, "Spinal Fusion": 180,
    "ACL Reconstruction": 110, "Hip Replacement": 150, "Tonsillectomy": 30,
}


def _generate_synthetic_data(n_samples: int = 500) -> pd.DataFrame:
    """Generate synthetic surgical case data for model training."""
    rows = []
    for _ in range(n_samples):
        op_type = random.choice(OPERATION_TYPES)
        age = random.choice(AGE_RANGES)
        gender = random.choice(GENDERS)
        risk = random.choice(RISK_LEVELS)
        complexity = random.choice(COMPLEXITY)
        experience = random.choice(EXPERIENCE)
        anesthesia = random.choice(ANESTHESIA)
        emergency = random.choice(EMERGENCY)
        asa = random.randint(1, 4)
        steps = random.randint(3, 12)
        assistants = random.randint(0, 4)

        base = BASE_DURATIONS[op_type]
        complexity_mod = {"Low": 0.85, "Medium": 1.0, "High": 1.25}[complexity]
        exp_mod = {"Junior": 1.2, "Intermediate": 1.05, "Senior": 0.95, "Expert": 0.85}[experience]
        risk_mod = {"Low": 0.9, "Medium": 1.0, "High": 1.15}[risk]
        emergency_mod = 1.15 if emergency == "Emergency" else 1.0
        asa_mod = 1.0 + (asa - 1) * 0.05
        noise = random.uniform(-0.1, 0.1)

        actual_duration = base * complexity_mod * exp_mod * risk_mod * emergency_mod * asa_mod * (1 + noise)
        actual_duration = max(10, round(actual_duration))

        rows.append({
            "operation_type": op_type,
            "surgical_specialty": SPECIALTIES[op_type],
            "patient_age_range": age,
            "patient_gender": gender,
            "medical_risk_category": risk,
            "asa_score": asa,
            "procedure_complexity": complexity,
            "estimated_surgical_steps": steps,
            "emergency_status": emergency,
            "anesthesia_type": anesthesia,
            "surgeon_experience_level": experience,
            "assistant_count": assistants,
            "previous_similar_duration": int(base * random.uniform(0.8, 1.2)),
            "equipment_preparation_time": random.randint(5, 25),
            "cleaning_turnover_time": random.randint(10, 30),
            "preop_preparation_duration": random.randint(5, 20),
            "actual_duration": actual_duration,
        })

    return pd.DataFrame(rows)


CATEGORICAL_FEATURES = [
    "operation_type", "surgical_specialty", "patient_age_range",
    "patient_gender", "medical_risk_category", "procedure_complexity",
    "emergency_status", "anesthesia_type", "surgeon_experience_level",
]

NUMERICAL_FEATURES = [
    "asa_score", "estimated_surgical_steps", "assistant_count",
    "previous_similar_duration", "equipment_preparation_time",
    "cleaning_turnover_time", "preop_preparation_duration",
]

FEATURES = CATEGORICAL_FEATURES + NUMERICAL_FEATURES
TARGET = "actual_duration"


def _encode_features(df: pd.DataFrame, encoders: dict | None = None) -> tuple[pd.DataFrame, dict]:
    """Encode categorical features using LabelEncoder."""
    encoded = df.copy()
    new_encoders = encoders if encoders else {}

    for col in CATEGORICAL_FEATURES:
        if col in encoded.columns:
            if encoders and col in encoders:
                encoded[col] = encoded[col].map(
                    lambda v: encoders[col].transform([v])[0]
                    if v in encoders[col].classes_ else -1
                )
            else:
                le = LabelEncoder()
                encoded[col] = le.fit_transform(encoded[col].astype(str))
                new_encoders[col] = le

    return encoded, new_encoders


def train_and_save_model(n_samples: int = 500):
    """Train model using real cleaned data if available, otherwise generate synthetic data."""
    from sklearn.metrics import mean_absolute_error as mae_metric

    os.makedirs(os.path.dirname(settings.ML_MODEL_PATH), exist_ok=True)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # Check for real cleaned datasets
    real_data = None
    if os.path.isdir(settings.UPLOAD_DIR):
        cleaned_files = sorted(
            f for f in os.listdir(settings.UPLOAD_DIR) if f.endswith("_cleaned.csv")
        )
        if cleaned_files:
            latest = os.path.join(settings.UPLOAD_DIR, cleaned_files[-1])
            df_real = pd.read_csv(latest)
            # Rename columns to match expected feature names
            df_real.columns = [c.strip().lower().replace(" ", "_") for c in df_real.columns]
            # Check if required columns exist
            required = set(CATEGORICAL_FEATURES + NUMERICAL_FEATURES + ["actual_duration"])
            if required.intersection(df_real.columns):
                real_data = df_real
                print(f"Training on real data from: {latest} ({len(df_real)} rows)")

    if real_data is not None:
        df = real_data
        df.to_csv(settings.TRAINING_DATA_PATH, index=False)
    else:
        df = _generate_synthetic_data(n_samples)
        df.to_csv(settings.TRAINING_DATA_PATH, index=False)
        print(f"Synthetic training data saved to {settings.TRAINING_DATA_PATH}")

    # Filter to only available feature columns
    available_features = [c for c in FEATURES if c in df.columns]
    available_cat = [c for c in CATEGORICAL_FEATURES if c in df.columns]
    available_num = [c for c in NUMERICAL_FEATURES if c in df.columns]

    df_encoded, encoders = _encode_features(df)
    X = df_encoded[available_features]
    y = df_encoded[TARGET] if TARGET in df_encoded.columns else df_encoded.get("actual_duration", pd.Series([0] * len(df_encoded)))

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = RandomForestRegressor(
        n_estimators=100, max_depth=15, random_state=42, n_jobs=-1
    )
    model.fit(X_train, y_train)

    r2_score = model.score(X_test, y_test)
    y_pred = model.predict(X_test)
    mae = float(mae_metric(y_test, y_pred))
    print(f"Model R² score: {r2_score:.4f}, MAE: {mae:.2f}")

    dump(model, settings.ML_MODEL_PATH)
    dump(encoders, settings.FEATURE_ENCODER_PATH)
    print(f"Model saved to {settings.ML_MODEL_PATH}")

    return model, encoders, r2_score, mae


def load_model():
    """Load trained model and encoders, or train if not available."""
    from joblib import load

    if os.path.exists(settings.ML_MODEL_PATH) and os.path.exists(settings.FEATURE_ENCODER_PATH):
        model = load(settings.ML_MODEL_PATH)
        encoders = load(settings.FEATURE_ENCODER_PATH)
        return model, encoders
    else:
        result = train_and_save_model()
        return result[0], result[1]


if __name__ == "__main__":
    train_and_save_model()
