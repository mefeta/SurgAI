"""Seed demo data for initial database setup."""

import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.models.case import SurgicalCase
from app.models.prediction import Prediction
from app.models.schedule import Schedule
from app.models.dataset import DatasetUpload
from app.models.model_metrics import ModelMetrics
from app.models.report import Report
from app.models.user import User, hash_password

OPERATION_TYPES = [
    "Dental Implant Surgery", "Tooth Extraction", "Root Canal Surgery",
    "Periodontal Surgery", "Wisdom Tooth Removal", "Minor Oral Surgery",
    "Jaw Cyst Removal", "Gum Graft Surgery", "Total Knee Replacement",
    "Cataract Surgery", "Laparoscopic Cholecystectomy", "Spinal Fusion",
]

SPECIALTIES = {
    "Dental Implant Surgery": "Oral Surgery", "Tooth Extraction": "Oral Surgery",
    "Root Canal Surgery": "Endodontics", "Periodontal Surgery": "Periodontics",
    "Wisdom Tooth Removal": "Oral Surgery", "Minor Oral Surgery": "Oral Surgery",
    "Jaw Cyst Removal": "Oral Surgery", "Gum Graft Surgery": "Periodontics",
    "Total Knee Replacement": "Orthopedics", "Cataract Surgery": "Ophthalmology",
    "Laparoscopic Cholecystectomy": "General Surgery", "Spinal Fusion": "Neurosurgery",
}

SURGEONS = [
    "Dr. Efe Barış", "Dr. Ayşe Yılmaz", "Dr. Mehmet Demir",
    "Dr. Zeynep Kaya", "Dr. Can Öztürk", "Dr. Elif Şahin",
]

EXPERIENCE = ["Junior", "Intermediate", "Senior", "Expert"]
COMPLEXITY = ["Low", "Medium", "High"]
RISK = ["Low", "Medium", "High"]
ANESTHESIA = ["General", "Regional", "Local", "Sedation"]
ROOMS = ["OR-1", "OR-2", "OR-3", "OR-4", "DEN-1", "DEN-2"]

BASE_DURATIONS = {
    "Dental Implant Surgery": 60, "Tooth Extraction": 30, "Root Canal Surgery": 75,
    "Periodontal Surgery": 90, "Wisdom Tooth Removal": 35, "Minor Oral Surgery": 45,
    "Jaw Cyst Removal": 80, "Gum Graft Surgery": 70, "Total Knee Replacement": 120,
    "Cataract Surgery": 45, "Laparoscopic Cholecystectomy": 90, "Spinal Fusion": 180,
}


def seed_demo_data(db: Session):
    """Seed the database with realistic demo data."""
    if db.query(SurgicalCase).count() > 0:
        return  # Already seeded

    # Users
    admin = User(
        username="admin",
        full_name="System Administrator",
        email="admin@surgai.com",
        password_hash=hash_password("admin123"),
        role="admin",
        is_admin=True,
        clinic_name="SurgAI Admin",
    )
    db.add(admin)

    doctor = User(
        username="efe",
        full_name="Dr. Efe Barış",
        email="dr.efe@surgai-demo.com",
        password_hash=hash_password("doctor123"),
        role="clinic_manager",
        is_admin=False,
        clinic_name="City Medical Center",
    )
    db.add(doctor)

    # Surgical Cases + Predictions + Schedules
    for i in range(40):
        op_type = random.choice(OPERATION_TYPES)
        complexity = random.choice(COMPLEXITY)
        experience = random.choice(EXPERIENCE)
        risk = random.choice(RISK)
        prev_dur = BASE_DURATIONS[op_type] * random.uniform(0.8, 1.2)

        case = SurgicalCase(
            case_id=f"CASE-2026-{i + 1:04d}",
            patient_age_range=random.choice(["19-35", "36-55", "56-70", "70+"]),
            patient_gender=random.choice(["Male", "Female"]),
            medical_risk_category=risk,
            asa_score=random.randint(1, 4),
            operation_type=op_type,
            surgical_specialty=SPECIALTIES.get(op_type, "General"),
            procedure_complexity=complexity,
            estimated_surgical_steps=random.randint(3, 12),
            emergency_status=random.choices(["Planned", "Emergency"], weights=[0.85, 0.15])[0],
            anesthesia_type=random.choice(ANESTHESIA),
            surgeon_experience_level=experience,
            assistant_count=random.randint(0, 4),
            operating_room_type=random.choice(ROOMS),
            previous_similar_duration=int(prev_dur),
            equipment_preparation_time=random.randint(5, 25),
            cleaning_turnover_time=random.randint(10, 30),
            preop_preparation_duration=random.randint(5, 20),
            status="completed" if i < 30 else "predicted",
            notes=f"Sample case {i + 1} for {op_type}.",
        )
        db.add(case)
        db.flush()

        # Prediction
        comp_mod = {"Low": 0.85, "Medium": 1.0, "High": 1.25}[complexity]
        exp_mod = {"Junior": 1.2, "Intermediate": 1.05, "Senior": 0.95, "Expert": 0.85}[experience]
        risk_mod = {"Low": 0.9, "Medium": 1.0, "High": 1.15}[risk]
        predicted = max(10, round(BASE_DURATIONS[op_type] * comp_mod * exp_mod * risk_mod * random.uniform(0.9, 1.1)))
        confidence = random.randint(75, 97)
        error = int(predicted * 0.1)

        pred = Prediction(
            surgical_case_id=case.id,
            case_id=case.case_id,
            predicted_duration=predicted,
            min_duration=max(5, predicted - error),
            max_duration=predicted + error + random.randint(0, 5),
            confidence_score=confidence,
            risk_level=risk,
            recommended_buffer=25 if risk == "High" else (15 if risk == "Medium" else 10),
            suggested_room_slot=f"{random.randint(8, 15):02d}:00 - {random.randint(9, 16):02d}:00",
            main_factors='["Procedure complexity", "Surgeon experience", "Patient risk level", "Historical average"]',
            explanation=f"Predicted duration based on {complexity.lower()} complexity, {experience.lower()} experience.",
            model_version="demo-v1.0",
        )
        db.add(pred)

        # Schedule (for ALL cases — spanning past 14 days through future)
        if i < 30:
            sched_date = datetime.utcnow() - timedelta(days=14) + timedelta(days=i)
        else:
            sched_date = datetime.utcnow() + timedelta(days=i - 29)
        start_h = random.randint(8, 15)
        end_h = start_h + (predicted // 60) + 1
        is_past = sched_date < datetime.utcnow() or (sched_date.date() == datetime.utcnow().date() and start_h < datetime.utcnow().hour)
        status = random.choice(["scheduled", "completed", "delayed"]) if is_past else "scheduled"
        conflict = None
        room = random.choice(ROOMS)
        end_m = random.randint(0, 59)
        if random.random() < 0.15:
            conflict = (
                f"Room {room} is already booked for {random.choice(OPERATION_TYPES)} "
                f"from {start_h:02d}:00 to {min(end_h, 23):02d}:{end_m:02d}."
            )

        sched = Schedule(
            surgical_case_id=case.id,
            case_id=case.case_id,
            scheduled_date=sched_date,
            start_time=f"{start_h:02d}:00",
            end_time=f"{min(end_h, 23):02d}:{end_m:02d}",
            room_number=room,
            assigned_surgeon=random.choice(SURGEONS),
            operation_type=op_type,
            predicted_duration=predicted,
            risk_level=risk,
            schedule_status=status,
            conflict_warning=conflict,
        )
        db.add(sched)

    # Datasets
    for i in range(3):
        ds = DatasetUpload(
            filename=f"historical_cases_batch_{i + 1}.csv",
            row_count=random.randint(150, 350),
            column_count=12,
            data_quality_score=random.uniform(85, 98),
            missing_value_count=random.randint(0, 15),
            duplicate_count=random.randint(0, 5),
            status="uploaded",
        )
        db.add(ds)

    # Model Metrics
    for i in range(6):
        mm = ModelMetrics(
            model_version=f"demo-v1.0",
            accuracy_score=round(0.82 + i * 0.025, 4),
            mean_absolute_error=round(10 - i * 0.3, 1),
            average_error_minutes=round(9.5 - i * 0.25, 1),
            confidence_average=round(80 + i * 1.5, 1),
            training_data_size=500,
            model_health_status="Healthy",
            last_training_date=datetime.utcnow() - timedelta(days=(5 - i) * 30),
        )
        db.add(mm)

    # Reports
    report_configs = [
        ("prediction_report", "Operation Duration Prediction Report"),
        ("test_validation_report", "System Test Report"),
        ("monthly_clinic_performance_report", "Monthly Clinic Performance Report"),
        ("model_performance_report", "Model Accuracy Report"),
        ("schedule_optimization_report", "Schedule Optimization Report"),
    ]
    for rtype, rtitle in report_configs:
        report = Report(
            report_type=rtype,
            title=rtitle,
            report_status="generated",
            report_content_json='[{"title": "Section 1", "content": "Report content."}]',
            summary=f"Generated {rtitle.lower()} with demo data.",
        )
        db.add(report)

    db.commit()
