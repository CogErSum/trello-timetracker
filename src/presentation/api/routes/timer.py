from fastapi import APIRouter, Depends, HTTPException

from src.application.timer.start_timer import StartTimerUseCase
from src.application.timer.stop_timer import StopTimerUseCase
from src.infrastructure.database.persistence.active_timer_repo import ActiveTimerRepository
from src.infrastructure.database.persistence.time_record_repo import TimeRecordRepository
from src.presentation.api.dependencies import get_trello_member_id
from src.presentation.api.schemas.timer import StartTimerRequest, StartTimerResponse, StopTimerResponse
from src.infrastructure.trello.comments import post_card_comment, fetch_member_name

router = APIRouter(prefix="/api/v1/timers", tags=["timers"])


@router.post("/start", response_model=StartTimerResponse)
async def start_timer(
    request: StartTimerRequest,
    member_id: str = Depends(get_trello_member_id),
):
    from src.infrastructure.database.main import async_session_factory

    async with async_session_factory() as session:
        active_timer_repo = ActiveTimerRepository(session)
        use_case = StartTimerUseCase(active_timer_repo)

        try:
            timer = await use_case.execute(member_id, request.card_id)
            await session.commit()
            name = fetch_member_name(member_id)
            post_card_comment(request.card_id, f"[TeamSight] {name}: timer started")
            return StartTimerResponse(timer=timer)
        except ValueError as e:
            raise HTTPException(status_code=409, detail=str(e))


@router.post("/stop", response_model=StopTimerResponse)
async def stop_timer(
    member_id: str = Depends(get_trello_member_id),
):
    from src.infrastructure.database.main import async_session_factory
    from src.infrastructure.trello.comments import format_duration_comment

    async with async_session_factory() as session:
        active_timer_repo = ActiveTimerRepository(session)
        time_record_repo = TimeRecordRepository(session)
        use_case = StopTimerUseCase(active_timer_repo, time_record_repo)

        try:
            record = await use_case.execute(member_id)
            await session.commit()
            post_card_comment(record["trello_card_id"], format_duration_comment(record["duration_sec"], "logged", member_id))
            return StopTimerResponse(record=record)
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))


@router.get("/active")
async def get_active_timer(
    member_id: str = Depends(get_trello_member_id),
):
    from src.infrastructure.database.main import async_session_factory

    async with async_session_factory() as session:
        active_timer_repo = ActiveTimerRepository(session)
        timer = await active_timer_repo.get_active(member_id)

        if not timer:
            raise HTTPException(status_code=404, detail="No active timer")

        return timer
