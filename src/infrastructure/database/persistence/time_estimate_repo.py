from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.infrastructure.database.tables.time_estimate import TimeEstimate


class TimeEstimateRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_card(self, trello_member_id: str, trello_card_id: str) -> dict | None:
        result = await self.session.execute(
            select(TimeEstimate).where(
                TimeEstimate.trello_member_id == trello_member_id,
                TimeEstimate.trello_card_id == trello_card_id,
            )
        )
        estimate = result.scalar_one_or_none()
        return self._to_dict(estimate) if estimate else None

    async def upsert(self, trello_member_id: str, trello_card_id: str, estimated_min: int, comment: str | None = None) -> dict:
        existing = await self.get_by_card(trello_member_id, trello_card_id)
        if existing:
            est = await self.session.get(TimeEstimate, UUID(existing["id"]))
            est.estimated_min = estimated_min
            est.comment = comment
            await self.session.flush()
            return self._to_dict(est)
        else:
            estimate = TimeEstimate(
                trello_member_id=trello_member_id,
                trello_card_id=trello_card_id,
                estimated_min=estimated_min,
                comment=comment,
            )
            self.session.add(estimate)
            await self.session.flush()
            return self._to_dict(estimate)

    async def delete(self, trello_member_id: str, trello_card_id: str) -> bool:
        result = await self.session.execute(
            select(TimeEstimate).where(
                TimeEstimate.trello_member_id == trello_member_id,
                TimeEstimate.trello_card_id == trello_card_id,
            )
        )
        estimate = result.scalar_one_or_none()
        if not estimate:
            return False
        await self.session.delete(estimate)
        await self.session.flush()
        return True

    async def get_board_estimates(self, trello_member_id: str | None = None) -> dict[str, dict]:
        query = select(TimeEstimate)
        if trello_member_id:
            query = query.where(TimeEstimate.trello_member_id == trello_member_id)
        result = await self.session.execute(query)
        estimates = result.scalars().all()
        return {e.trello_card_id: self._to_dict(e) for e in estimates}

    def _to_dict(self, estimate: TimeEstimate) -> dict:
        return {
            "id": str(estimate.id),
            "trello_member_id": estimate.trello_member_id,
            "trello_card_id": estimate.trello_card_id,
            "estimated_min": estimate.estimated_min,
            "comment": estimate.comment,
            "created_at": estimate.created_at.isoformat() if estimate.created_at else None,
        }
