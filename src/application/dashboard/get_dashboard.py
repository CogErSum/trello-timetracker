from src.application.common.interfaces import ITimeRecordRepository


class GetDashboardUseCase:
    def __init__(self, time_record_repo: ITimeRecordRepository) -> None:
        self.time_record_repo = time_record_repo

    async def execute(self, trello_member_id: str) -> dict:
        return await self.time_record_repo.get_dashboard_stats(trello_member_id)
