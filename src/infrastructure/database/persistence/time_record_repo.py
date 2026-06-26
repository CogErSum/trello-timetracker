from datetime import datetime, timedelta
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.application.common.interfaces.time_record_repository import ITimeRecordRepository
from src.infrastructure.database.tables.time_record import TimeRecord


class TimeRecordRepository(ITimeRecordRepository):
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(
        self,
        trello_member_id: str,
        trello_card_id: str,
        duration_sec: int,
        start_time: datetime | None = None,
        end_time: datetime | None = None,
        comment: str | None = None,
        record_date: datetime | None = None,
    ) -> dict:
        record = TimeRecord(
            trello_member_id=trello_member_id,
            trello_card_id=trello_card_id,
            duration_sec=duration_sec,
            start_time=start_time,
            end_time=end_time,
            comment=comment,
            record_date=record_date,
        )
        self.session.add(record)
        await self.session.flush()
        return self._to_dict(record)

    async def get_model_by_id(self, record_id: UUID) -> TimeRecord | None:
        result = await self.session.execute(select(TimeRecord).where(TimeRecord.id == record_id))
        return result.scalar_one_or_none()

    async def get_by_id(self, record_id: UUID) -> dict | None:
        result = await self.session.execute(select(TimeRecord).where(TimeRecord.id == record_id))
        record = result.scalar_one_or_none()
        return self._to_dict(record) if record else None

    async def get_by_card(self, trello_member_id: str, trello_card_id: str) -> list[dict]:
        result = await self.session.execute(
            select(TimeRecord)
            .where(TimeRecord.trello_member_id == trello_member_id)
            .where(TimeRecord.trello_card_id == trello_card_id)
            .order_by(TimeRecord.created_at.desc())
        )
        return [self._to_dict(r) for r in result.scalars().all()]

    async def list_all(
        self,
        trello_member_id: str | None = None,
        card_id: str | None = None,
        date_from: datetime | None = None,
        date_to: datetime | None = None,
    ) -> list[dict]:
        query = select(TimeRecord)

        if trello_member_id:
            query = query.where(TimeRecord.trello_member_id == trello_member_id)
        if card_id:
            query = query.where(TimeRecord.trello_card_id == card_id)
        if date_from:
            query = query.where(TimeRecord.created_at >= date_from)
        if date_to:
            query = query.where(TimeRecord.created_at <= date_to)

        query = query.order_by(TimeRecord.created_at.desc())
        result = await self.session.execute(query)
        return [self._to_dict(r) for r in result.scalars().all()]

    async def update(
        self,
        record_id: UUID,
        duration_sec: int | None = None,
        comment: str | None = None,
        record_date: datetime | None = None,
    ) -> dict | None:
        result = await self.session.execute(select(TimeRecord).where(TimeRecord.id == record_id))
        record = result.scalar_one_or_none()
        if not record:
            return None

        if duration_sec is not None:
            record.duration_sec = duration_sec
        if comment is not None:
            record.comment = comment
        if record_date is not None:
            record.record_date = record_date

        await self.session.flush()
        return self._to_dict(record)

    async def delete(self, record_id: UUID) -> bool:
        result = await self.session.execute(select(TimeRecord).where(TimeRecord.id == record_id))
        record = result.scalar_one_or_none()
        if not record:
            return False

        await self.session.delete(record)
        await self.session.flush()
        return True

    async def get_total_by_card(self, trello_member_id: str, trello_card_id: str) -> int:
        result = await self.session.execute(
            select(func.sum(TimeRecord.duration_sec))
            .where(TimeRecord.trello_member_id == trello_member_id)
            .where(TimeRecord.trello_card_id == trello_card_id)
        )
        return result.scalar() or 0

    async def get_dashboard_stats(self, trello_member_id: str) -> dict:
        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = today_start - timedelta(days=today_start.weekday())
        month_start = today_start.replace(day=1)

        today_result = await self.session.execute(
            select(func.sum(TimeRecord.duration_sec))
            .where(TimeRecord.trello_member_id == trello_member_id)
            .where(TimeRecord.created_at >= today_start)
        )
        today_sec = today_result.scalar() or 0

        week_result = await self.session.execute(
            select(func.sum(TimeRecord.duration_sec))
            .where(TimeRecord.trello_member_id == trello_member_id)
            .where(TimeRecord.created_at >= week_start)
        )
        week_sec = week_result.scalar() or 0

        month_result = await self.session.execute(
            select(func.sum(TimeRecord.duration_sec))
            .where(TimeRecord.trello_member_id == trello_member_id)
            .where(TimeRecord.created_at >= month_start)
        )
        month_sec = month_result.scalar() or 0

        recent_result = await self.session.execute(
            select(TimeRecord)
            .where(TimeRecord.trello_member_id == trello_member_id)
            .order_by(TimeRecord.created_at.desc())
            .limit(10)
        )
        recent_records = [self._to_dict(r) for r in recent_result.scalars().all()]

        return {
            "today_sec": today_sec,
            "week_sec": week_sec,
            "month_sec": month_sec,
            "recent_records": recent_records,
        }

    def _to_dict(self, record: TimeRecord) -> dict:
        return {
            "id": str(record.id),
            "trello_member_id": record.trello_member_id,
            "trello_card_id": record.trello_card_id,
            "start_time": record.start_time.isoformat() if record.start_time else None,
            "end_time": record.end_time.isoformat() if record.end_time else None,
            "duration_sec": record.duration_sec,
            "comment": record.comment,
            "record_date": record.record_date.isoformat() if record.record_date else None,
            "created_at": record.created_at.isoformat() if record.created_at else None,
            "updated_at": record.updated_at.isoformat() if record.updated_at else None,
        }
