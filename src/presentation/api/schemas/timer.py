from pydantic import BaseModel


class StartTimerRequest(BaseModel):
    card_id: str


class TimerResponse(BaseModel):
    id: str
    trello_member_id: str
    trello_card_id: str
    started_at: str | None = None
    created_at: str | None = None


class StartTimerResponse(BaseModel):
    timer: TimerResponse


class StopTimerResponse(BaseModel):
    record: dict
