from datetime import datetime

from src.application.common.interfaces import ITimeRecordRepository


class ListRecordsUseCase:
    def __init__(self, time_record_repo: ITimeRecordRepository) -> None:
        self.time_record_repo = time_record_repo

    async def execute(
        self,
        trello_member_id: str,
        card_id: str | None = None,
        date_from: datetime | None = None,
        date_to: datetime | None = None,
    ) -> list[dict]:
        return await self.time_record_repo.list_all(
            trello_member_id=trello_member_id,
            card_id=card_id,
            date_from=date_from,
            date_to=date_to,
        )
