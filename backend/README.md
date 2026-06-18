# SurgAI Backend

AI-Powered Surgical Operation Duration Prediction API.

## Tech Stack

- **FastAPI** — async-capable Python web framework
- **SQLAlchemy 2.0** — ORM with SQLite (default)
- **scikit-learn** — RandomForestRegressor for duration prediction
- **Pydantic v2** — request/response validation
- **pytest** — test suite

## Quick Start

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Train the ML model (generates 500 synthetic training records)
python app/ml/train_model.py

# Start the dev server
uvicorn app.main:app --reload --port 8000
```

The API is available at `http://localhost:8000`.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/auth/login` | Mock login (dev only) |
| POST | `/api/predictions` | Create a duration prediction |
| GET | `/api/predictions` | List predictions |
| GET | `/api/predictions/{id}` | Get prediction by ID |
| DELETE | `/api/predictions/{id}` | Delete prediction |
| GET | `/api/cases` | List surgical cases |
| GET | `/api/cases/{id}` | Get case by ID |
| POST | `/api/cases` | Create a surgical case |
| PUT | `/api/cases/{id}` | Update a case |
| DELETE | `/api/cases/{id}` | Delete a case |
| GET | `/api/schedule` | List schedules |
| GET | `/api/schedule/day` | Schedule for a specific day |
| GET | `/api/schedule/week` | Schedule for a week |
| POST | `/api/schedule` | Create a schedule entry |
| PUT | `/api/schedule/{id}` | Update schedule entry |
| DELETE | `/api/schedule/{id}` | Delete schedule entry |
| POST | `/api/datasets/upload` | Upload CSV/Excel dataset |
| GET | `/api/datasets` | List uploaded datasets |
| GET | `/api/datasets/{id}/preview` | Preview dataset rows |
| POST | `/api/datasets/{id}/prepare` | Prepare dataset for training |
| GET | `/api/dashboard/stats` | Dashboard statistics |
| GET | `/api/dashboard/recent-activity` | Recent activity feed |
| GET | `/api/model/analytics` | Model performance metrics |
| GET | `/api/model/error-by-operation-type` | Error breakdown |
| GET | `/api/model/accuracy-over-time` | Accuracy trend data |
| GET | `/api/model/predicted-vs-actual` | Scatter plot data |
| POST | `/api/model/retrain` | Trigger model retraining |
| GET | `/api/reports` | List generated reports |
| POST | `/api/reports/generate` | Generate a new report |
| GET | `/api/reports/{id}` | Get report by ID |

## Project Structure

```
backend/
├── app/
│   ├── ml/               # ML model training & serialized artifacts
│   │   ├── model.pkl     # Trained RandomForestRegressor
│   │   ├── feature_encoder.pkl  # LabelEncoder mappings
│   │   └── train_model.py
│   ├── models/           # SQLAlchemy ORM models
│   ├── routes/           # FastAPI route handlers
│   ├── schemas/          # Pydantic v2 request/response schemas
│   ├── services/         # Business logic layer
│   │   ├── ml_model_service.py   # ML prediction + rule-based fallback
│   │   ├── prediction_service.py
│   │   ├── case_service.py
│   │   ├── schedule_service.py
│   │   ├── dataset_service.py
│   │   ├── analytics_service.py
│   │   └── report_service.py
│   ├── utils/            # Seed data, error handlers, validators
│   ├── config.py         # Settings via pydantic-settings
│   ├── database.py       # Engine, session factory, init_db()
│   └── main.py           # FastAPI app, CORS, lifespan
├── tests/
│   ├── conftest.py       # Fixtures: in-memory SQLite per test
│   └── test_api.py       # 16 endpoint tests
└── requirements.txt
```

## ML Prediction Model

The prediction pipeline uses a **RandomForestRegressor** (100 trees, max depth 15) trained on synthetic surgical data. Features include:

- Operation type, procedure complexity, surgeon experience
- Medical risk category, ASA score, emergency status
- Previous similar procedure duration

**Fallback**: When the ML model is unavailable, a rule-based heuristic calculates duration from complexity, ASA score, and other modifiers.

Model accuracy target: ±15 minutes MAE.

## Testing

```bash
venv/bin/python -m pytest tests/test_api.py -v
```

Uses an in-memory SQLite database per test session — no interference with development data.

## CORS

Allowed origins: `localhost:5173`, `localhost:3000`, and `127.0.0.1` equivalents (Vite + React dev servers).

## Configuration

All settings are in `app/config.py` with sensible defaults — no `.env` file required.
