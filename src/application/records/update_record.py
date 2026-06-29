from datetime import datetime
from uuid import UUID

from src.infrastructure.database.persistence.time_record_repo import TimeRecordRepository


class UpdateRecordUseCase:
    def __init__(self, time_record_repo: TimeRecordRepository) -> None:
        self.time_record_repo = time_record_repo

    async def execute(
        self,
        record_id: UUID,
        member_id: str,
        duration_min: int | None = None,
        comment: str | None = None,
        record_date: str | None = None,
    ) -> dict | None:
        record = await self.time_record_repo.get_model_by_id(record_id)
        if not record or record.trello_member_id != member_id:
            return None

        if duration_min is not None:
            record.duration_sec = duration_min * 60
        if comment is not None:
            record.comment = comment
        if record_date is not None:
            try:
                record.record_date = datetime.fromisoformat(record_date)
            except ValueError:
                record.record_date = datetime.strptime(record_date, "%Y-%m-%d")

        await self.time_record_repo.session.flush()
        await self.time_record_repo.session.refresh(record)
        return self.time_record_repo._to_dict(record)
