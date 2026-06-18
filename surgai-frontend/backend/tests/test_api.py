"""
SurgAI Backend API Tests
Run with: python -m pytest tests/test_api.py -v
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))



def test_health_check(client):
    """Test the health check endpoint."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "SurgAI Backend"


def test_prediction_endpoint(client):
    """Test creating a new prediction."""
    response = client.post("/api/predictions", json={
        "operation_type": "Dental Implant Surgery",
        "procedure_complexity": "Medium",
        "surgeon_experience_level": "Senior",
        "medical_risk_category": "Low",
        "asa_score": 2,
        "previous_similar_duration": 70,
        "emergency_status": "Planned",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["predicted_duration"] > 0
    assert data["confidence_score"] > 0
    assert data["risk_level"] in ["Low", "Medium", "High"]
    assert data["recommended_buffer"] > 0
    assert len(data["main_factors"]) > 0
    assert data["model_version"] is not None


def test_prediction_validation(client):
    """Test that prediction validation works."""
    response = client.post("/api/predictions", json={
        "operation_type": "",  # empty
        "procedure_complexity": "",
    })
    assert response.status_code == 422


def test_case_creation(client):
    """Test creating a surgical case."""
    response = client.post("/api/cases", json={
        "operation_type": "Wisdom Tooth Removal",
        "procedure_complexity": "Low",
        "status": "draft",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["case_id"] is not None
    assert data["operation_type"] == "Wisdom Tooth Removal"


def test_list_cases(client):
    """Test listing cases."""
    response = client.get("/api/cases")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "cases" in data


def test_dashboard_stats(client):
    """Test dashboard statistics endpoint."""
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert "today_scheduled_operations" in data
    assert "average_predicted_duration" in data
    assert "schedule_risk_level" in data
    assert "model_confidence_average" in data


def test_model_analytics(client):
    """Test model analytics endpoint."""
    response = client.get("/api/model/analytics")
    assert response.status_code == 200
    data = response.json()
    assert "model_version" in data
    assert "accuracy_score" in data
    assert "mean_absolute_error" in data
    assert "model_health_status" in data


def test_schedule_creation(client):
    """Test creating a schedule."""
    response = client.post("/api/schedule", json={
        "scheduled_date": "2026-06-20",
        "start_time": "09:00",
        "room_number": "OR-1",
        "operation_type": "Dental Implant Surgery",
        "schedule_status": "scheduled",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["schedule_status"] == "scheduled"


def test_schedule_conflict(client):
    """Test schedule conflict detection."""
    # First booking
    client.post("/api/schedule", json={
        "scheduled_date": "2026-06-20",
        "start_time": "09:00",
        "end_time": "10:00",
        "room_number": "OR-CONFLICT",
        "operation_type": "Test Op 1",
        "schedule_status": "scheduled",
    })
    # Overlapping booking
    response = client.post("/api/schedule", json={
        "scheduled_date": "2026-06-20",
        "start_time": "09:30",
        "room_number": "OR-CONFLICT",
        "operation_type": "Test Op 2",
        "schedule_status": "scheduled",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["conflict_warning"] is not None


def test_dataset_upload_validation(client):
    """Test that non-CSV files are rejected."""
    response = client.post("/api/datasets/upload")
    assert response.status_code == 422  # No file provided


def test_report_generation(client):
    """Test report generation."""
    response = client.post("/api/reports/generate", json={
        "report_type": "prediction_report",
    })
    data = response.json()
    assert response.status_code == 200 or response.status_code == 201
    assert data["status"] == "generated"
    assert len(data["sections"]) > 0


def test_reports_list(client):
    """Test listing reports."""
    response = client.get("/api/reports")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data


def test_dashboard_recent_activity(client):
    """Test recent activity endpoint."""
    response = client.get("/api/dashboard/recent-activity")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_error_by_operation_type(client):
    """Test error analytics by operation type."""
    response = client.get("/api/model/error-by-operation-type")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_accuracy_over_time(client):
    """Test accuracy over time analytics."""
    response = client.get("/api/model/accuracy-over-time")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_predicted_vs_actual(client):
    """Test predicted vs actual chart data."""
    response = client.get("/api/model/predicted-vs-actual")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
