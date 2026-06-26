from pydantic import BaseModel


class CreateRecordRequest(BaseModel):
    card_id: str
    duration_min: int
    date: str
    comment: str | None = None


class UpdateRecordRequest(BaseModel):
    duration_min: int | None = None
    comment: str | None = None


class RecordResponse(BaseModel):
    id: str
    trello_member_id: str
    trello_card_id: str
    start_time: str | None = None
    end_time: str | None = None
    duration_sec: int
    comment: str | None = None
    record_date: str | None = None
    created_at: str | None = None
    updated_at: str | None = None
    member_name: str | None = None


class DashboardResponse(BaseModel):
    today_sec: int
    week_sec: int
    month_sec: int
    recent_records: list[dict]
