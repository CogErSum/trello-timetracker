from datetime import datetime, timezone

from src.application.common.interfaces import IActiveTimerRepository


class StartTimerUseCase:
    def __init__(self, active_timer_repo: IActiveTimerRepository) -> None:
        self.active_timer_repo = active_timer_repo

    async def execute(self, trello_member_id: str, trello_card_id: str) -> dict:
        existing = await self.active_timer_repo.get_active(trello_member_id)
        if existing:
            raise ValueError("Active timer already exists")

        now = datetime.now(timezone.utc)
        return await self.active_timer_repo.create(trello_member_id, trello_card_id, now)
