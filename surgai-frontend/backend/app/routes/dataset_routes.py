import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.dataset_schema import (
    DatasetUploadResponse, DatasetListResponse,
    DatasetPreviewResponse, DatasetPrepareResponse,
)
from app.services.dataset_service import (
    validate_file, process_upload, get_preview, prepare_dataset, get_datasets,
)

router = APIRouter(prefix="/datasets", tags=["Datasets"])


@router.post("/upload", response_model=DatasetUploadResponse, status_code=201)
def upload_dataset(file: UploadFile = File(...), db: Session = Depends(get_db)):
    valid, msg = validate_file(file.filename or "")
    if not valid:
        raise HTTPException(status_code=400, detail=msg)

    result = process_upload(db, file, file.filename or "unknown")
    return DatasetUploadResponse(**result)


@router.get("", response_model=DatasetListResponse)
def list_datasets(db: Session = Depends(get_db)):
    datasets = get_datasets(db)
    return DatasetListResponse(total=len(datasets), datasets=datasets)


@router.get("/{dataset_id}/preview", response_model=DatasetPreviewResponse)
def preview_dataset(dataset_id: int, db: Session = Depends(get_db)):
    preview = get_preview(db, dataset_id)
    if not preview:
        raise HTTPException(status_code=404, detail="Dataset not found or file missing")
    return DatasetPreviewResponse(**preview)


@router.post("/{dataset_id}/prepare", response_model=DatasetPrepareResponse)
def prepare_dataset_endpoint(dataset_id: int, db: Session = Depends(get_db)):
    result = prepare_dataset(db, dataset_id)
    if not result:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return DatasetPrepareResponse(**result)
