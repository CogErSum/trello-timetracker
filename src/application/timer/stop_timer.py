from datetime import datetime, timezone

from src.application.common.interfaces import IActiveTimerRepository, ITimeRecordRepository


class StopTimerUseCase:
    def __init__(
        self,
        active_timer_repo: IActiveTimerRepository,
        time_record_repo: ITimeRecordRepository,
    ) -> None:
        self.active_timer_repo = active_timer_repo
        self.time_record_repo = time_record_repo

    async def execute(self, trello_member_id: str) -> dict:
        active_timer = await self.active_timer_repo.get_active(trello_member_id)
        if not active_timer:
            raise ValueError("No active timer found")

        started_at = datetime.fromisoformat(active_timer["started_at"])
        now = datetime.now(timezone.utc)
        duration_sec = int((now - started_at).total_seconds())

        if duration_sec < 1:
            raise ValueError("Tracking too short")

        record = await self.time_record_repo.create(
            trello_member_id=trello_member_id,
            trello_card_id=active_timer["trello_card_id"],
            duration_sec=duration_sec,
            start_time=started_at,
            end_time=now,
        )

        await self.active_timer_repo.delete(trello_member_id)

        return record
