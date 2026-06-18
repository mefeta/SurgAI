"""
Pytest fixtures — overrides DB with a fresh in-memory SQLite database
so tests don't conflict with seed data or persist across runs.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models.user import User, hash_password
from app.routes.auth_routes import get_current_user

TEST_ENGINE = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TEST_SESSION_LOCAL = sessionmaker(
    bind=TEST_ENGINE, autocommit=False, autoflush=False
)


def override_get_db():
    db = TEST_SESSION_LOCAL()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Create all tables once per test session."""
    Base.metadata.create_all(bind=TEST_ENGINE)
    # Seed a test user for auth
    db = TEST_SESSION_LOCAL()
    test_user = User(
        username="testdoctor",
        full_name="Dr. Test User",
        email="test@surgai.com",
        password_hash=hash_password("test123"),
        role="clinic_manager",
        is_admin=False,
        clinic_name="Test Clinic",
    )
    db.add(test_user)
    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=TEST_ENGINE)


@pytest.fixture(scope="session")
def test_user() -> User:
    """Return the seeded test user."""
    db = TEST_SESSION_LOCAL()
    user = db.query(User).filter(User.username == "testdoctor").first()
    db.close()
    return user


@pytest.fixture(autouse=True)
def clean_tables():
    """Clear all rows between tests so each test starts fresh (keep users)."""
    db = TEST_SESSION_LOCAL()
    try:
        for table in reversed(Base.metadata.sorted_tables):
            if table.name != "users":
                db.execute(table.delete())
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def override_get_current_user():
    """Return the seeded test user for all authenticated requests."""
    db = next(override_get_db())
    try:
        return db.query(User).filter(User.username == "testdoctor").first()
    finally:
        db.close()


@pytest.fixture()
def client():
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
