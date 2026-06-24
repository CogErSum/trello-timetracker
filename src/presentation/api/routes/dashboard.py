from fastapi import APIRouter, Depends

from src.application.dashboard.get_dashboard import GetDashboardUseCase
from src.infrastructure.database.persistence.time_record_repo import TimeRecordRepository
from src.presentation.api.dependencies import get_trello_member_id
from src.presentation.api.schemas.record import DashboardResponse

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardResponse)
async def get_dashboard(
    member_id: str = Depends(get_trello_member_id),
):
    from src.infrastructure.database.main import async_session_factory

    async with async_session_factory() as session:
        time_record_repo = TimeRecordRepository(session)
        use_case = GetDashboardUseCase(time_record_repo)
        return await use_case.execute(member_id)
