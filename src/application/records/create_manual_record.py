from datetime import datetime

from src.application.common.interfaces import ITimeRecordRepository


class CreateManualRecordUseCase:
    def __init__(self, time_record_repo: ITimeRecordRepository) -> None:
        self.time_record_repo = time_record_repo

    async def execute(
        self,
        trello_member_id: str,
        trello_card_id: str,
        duration_min: int,
        date: str,
        comment: str | None = None,
    ) -> dict:
        if duration_min <= 0:
            raise ValueError("Duration must be positive")

        record_date = datetime.fromisoformat(date)
        if record_date.date() > datetime.now().date():
            raise ValueError("Date cannot be in the future")

        duration_sec = duration_min * 60

        return await self.time_record_repo.create(
            trello_member_id=trello_member_id,
            trello_card_id=trello_card_id,
            duration_sec=duration_sec,
            comment=comment,
        )
