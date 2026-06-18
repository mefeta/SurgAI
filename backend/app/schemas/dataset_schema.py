from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DatasetUploadResponse(BaseModel):
    id: int
    filename: str
    row_count: Optional[int] = None
    column_count: Optional[int] = None
    data_quality_score: Optional[float] = None
    missing_value_count: Optional[int] = None
    duplicate_count: Optional[int] = None
    status: str
    uploaded_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DatasetListResponse(BaseModel):
    total: int
    datasets: list[DatasetUploadResponse]


class DatasetPreviewResponse(BaseModel):
    filename: str
    columns: list[str]
    rows: list[dict]
    total_rows: int


class DatasetPrepareResponse(BaseModel):
    filename: str
    original_row_count: int
    cleaned_row_count: int
    duplicates_removed: int
    missing_values_filled: int
    status: str
