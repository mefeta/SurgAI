from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.schedule_schema import (
    ScheduleCreate, ScheduleUpdate, ScheduleResponse, ScheduleListResponse,
)
from app.services.schedule_service import (
    create_schedule, get_schedule, get_schedule_by_day,
    get_schedule_by_week, update_schedule, delete_schedule,
)

router = APIRouter(prefix="/schedule", tags=["Schedule"])


@router.post("", response_model=ScheduleResponse, status_code=201)
def create_new_schedule(data: ScheduleCreate, db: Session = Depends(get_db)):
    sched = create_schedule(db, data)
    return sched


@router.get("", response_model=ScheduleListResponse)
def list_schedule(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    schedules = get_schedule(db, skip=skip, limit=limit)
    return ScheduleListResponse(total=len(schedules), schedules=schedules)


@router.get("/day/{day_date}", response_model=ScheduleListResponse)
def get_schedule_for_day(day_date: str, db: Session = Depends(get_db)):
    try:
        day = datetime.strptime(day_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")
    schedules = get_schedule_by_day(db, day)
    return ScheduleListResponse(total=len(schedules), schedules=schedules)


@router.get("/week/{start_date}", response_model=ScheduleListResponse)
def get_schedule_for_week(start_date: str, db: Session = Depends(get_db)):
    try:
        start = datetime.strptime(start_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")
    schedules = get_schedule_by_week(db, start)
    return ScheduleListResponse(total=len(schedules), schedules=schedules)


@router.put("/{schedule_id}", response_model=ScheduleResponse)
def update_schedule_by_id(schedule_id: int, data: ScheduleUpdate, db: Session = Depends(get_db)):
    sched = update_schedule(db, schedule_id, data)
    if not sched:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return sched


@router.delete("/{schedule_id}", status_code=204)
def delete_schedule_by_id(schedule_id: int, db: Session = Depends(get_db)):
    deleted = delete_schedule(db, schedule_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Schedule not found")
