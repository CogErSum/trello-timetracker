from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.application.common.interfaces.active_timer_repository import IActiveTimerRepository
from src.infrastructure.database.tables.active_timer import ActiveTimer


class ActiveTimerRepository(IActiveTimerRepository):
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_active(self, trello_member_id: str) -> dict | None:
        result = await self.session.execute(
            select(ActiveTimer).where(ActiveTimer.trello_member_id == trello_member_id)
        )
        timer = result.scalar_one_or_none()
        return self._to_dict(timer) if timer else None

    async def create(self, trello_member_id: str, trello_card_id: str, started_at: datetime) -> dict:
        timer = ActiveTimer(
            trello_member_id=trello_member_id,
            trello_card_id=trello_card_id,
            started_at=started_at,
        )
        self.session.add(timer)
        await self.session.flush()
        return self._to_dict(timer)

    async def delete(self, trello_member_id: str) -> bool:
        result = await self.session.execute(
            select(ActiveTimer).where(ActiveTimer.trello_member_id == trello_member_id)
        )
        timer = result.scalar_one_or_none()
        if not timer:
            return False

        await self.session.delete(timer)
        await self.session.flush()
        return True

    def _to_dict(self, timer: ActiveTimer) -> dict:
        return {
            "id": str(timer.id),
            "trello_member_id": timer.trello_member_id,
            "trello_card_id": timer.trello_card_id,
            "started_at": timer.started_at.isoformat() if timer.started_at else None,
            "created_at": timer.created_at.isoformat() if timer.created_at else None,
        }
