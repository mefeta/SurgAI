from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.schedule import Schedule
from app.schemas.schedule_schema import ScheduleCreate, ScheduleUpdate


def create_schedule(db: Session, data: ScheduleCreate) -> Schedule:
    # Calculate end_time if not provided
    end_time = data.end_time
    if not end_time and data.predicted_duration:
        try:
            start_h, start_m = map(int, data.start_time.split(":"))
            total_min = start_h * 60 + start_m + data.predicted_duration
            end_h = (total_min // 60) % 24
            end_m = total_min % 60
            end_time = f"{end_h:02d}:{end_m:02d}"
        except (ValueError, AttributeError):
            end_time = None

    # Conflict detection
    conflict = _detect_conflict(db, data)

    schedule = Schedule(
        surgical_case_id=data.surgical_case_id,
        case_id=data.case_id,
        scheduled_date=datetime.combine(data.scheduled_date, datetime.min.time()),
        start_time=data.start_time,
        end_time=end_time,
        room_number=data.room_number,
        assigned_surgeon=data.assigned_surgeon,
        operation_type=data.operation_type,
        predicted_duration=data.predicted_duration,
        risk_level=data.risk_level,
        schedule_status=data.schedule_status or "scheduled",
        conflict_warning=conflict,
    )
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    return schedule


def _detect_conflict(db: Session, data: ScheduleCreate) -> str | None:
    """Check for room/time conflicts."""
    # Determine end_time for the incoming booking
    end_time = data.end_time
    if not end_time and data.start_time and data.predicted_duration:
        try:
            sh, sm = map(int, data.start_time.split(":"))
            total_min = sh * 60 + sm + data.predicted_duration
            end_h = (total_min // 60) % 24
            end_m = total_min % 60
            end_time = f"{end_h:02d}:{end_m:02d}"
        except (ValueError, AttributeError):
            end_time = None
    # If still no end time, treat as a zero-length booking at start_time
    # so overlap with any existing booking containing that time is detected
    if not end_time:
        end_time = data.start_time

    existing = (
        db.query(Schedule)
        .filter(
            Schedule.room_number == data.room_number,
            Schedule.schedule_status.in_(["scheduled", "in_progress"]),
            Schedule.scheduled_date == datetime.combine(data.scheduled_date, datetime.min.time()),
        )
        .all()
    )
    if not existing:
        return None

    for ex in existing:
        if ex.start_time and ex.end_time and data.start_time and end_time:
            if _times_overlap(data.start_time, end_time, ex.start_time, ex.end_time):
                return (
                    f"Room {data.room_number} is already booked for "
                    f"{ex.operation_type or 'another operation'} "
                    f"from {ex.start_time} to {ex.end_time}."
                )
    return None


def _times_overlap(start: str, end: str, existing_start: str, existing_end: str) -> bool:
    try:
        s = _to_minutes(start)
        e = _to_minutes(end)
        es = _to_minutes(existing_start)
        ee = _to_minutes(existing_end)
        return s < ee and e > es
    except (ValueError, TypeError):
        return False


def _to_minutes(t: str) -> int:
    h, m = map(int, t.split(":"))
    return h * 60 + m


def get_schedule(db: Session, skip: int = 0, limit: int = 50) -> list[Schedule]:
    return (
        db.query(Schedule)
        .order_by(Schedule.scheduled_date.desc(), Schedule.start_time)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_schedule_by_day(db: Session, day: date) -> list[Schedule]:
    start = datetime.combine(day, datetime.min.time())
    end = datetime.combine(day, datetime.max.time())
    return (
        db.query(Schedule)
        .filter(and_(Schedule.scheduled_date >= start, Schedule.scheduled_date <= end))
        .order_by(Schedule.start_time)
        .all()
    )


def get_schedule_by_week(db: Session, start_date: date) -> list[Schedule]:
    start = datetime.combine(start_date, datetime.min.time())
    end = datetime.combine(start_date + timedelta(days=6), datetime.max.time())
    return (
        db.query(Schedule)
        .filter(and_(Schedule.scheduled_date >= start, Schedule.scheduled_date <= end))
        .order_by(Schedule.scheduled_date, Schedule.start_time)
        .all()
    )


def update_schedule(db: Session, schedule_id: int, data: ScheduleUpdate) -> Schedule | None:
    sched = db.query(Schedule).filter(Schedule.id == schedule_id).first()
    if not sched:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(sched, field, value)
    db.commit()
    db.refresh(sched)
    return sched


def delete_schedule(db: Session, schedule_id: int) -> bool:
    sched = db.query(Schedule).filter(Schedule.id == schedule_id).first()
    if sched:
        db.delete(sched)
        db.commit()
        return True
    return False


def get_schedule_count(db: Session) -> int:
    return db.query(Schedule).count()
