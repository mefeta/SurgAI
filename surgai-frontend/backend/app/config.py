from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "SurgAI Backend"
    APP_VERSION: str = "1.0.0"
    DATABASE_URL: str = "sqlite:///./surgai.db"
    SECRET_KEY: str = "surgai-demo-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    ML_MODEL_PATH: str = "app/ml/model.pkl"
    FEATURE_ENCODER_PATH: str = "app/ml/feature_encoder.pkl"
    TRAINING_DATA_PATH: str = "app/ml/sample_training_data.csv"
    UPLOAD_DIR: str = "uploads"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
