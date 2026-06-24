from abc import ABC, abstractmethod
from datetime import datetime
from uuid import UUID


class ITimeRecordRepository(ABC):
    @abstractmethod
    async def create(
        self,
        trello_member_id: str,
        trello_card_id: str,
        duration_sec: int,
        start_time: datetime | None = None,
        end_time: datetime | None = None,
        comment: str | None = None,
    ) -> dict:
        pass

    @abstractmethod
    async def get_by_id(self, record_id: UUID) -> dict | None:
        pass

    @abstractmethod
    async def get_by_card(self, trello_member_id: str, trello_card_id: str) -> list[dict]:
        pass

    @abstractmethod
    async def list_all(
        self,
        trello_member_id: str,
        card_id: str | None = None,
        date_from: datetime | None = None,
        date_to: datetime | None = None,
    ) -> list[dict]:
        pass

    @abstractmethod
    async def update(
        self,
        record_id: UUID,
        duration_sec: int | None = None,
        comment: str | None = None,
    ) -> dict | None:
        pass

    @abstractmethod
    async def delete(self, record_id: UUID) -> bool:
        pass

    @abstractmethod
    async def get_total_by_card(self, trello_member_id: str, trello_card_id: str) -> int:
        pass

    @abstractmethod
    async def get_dashboard_stats(self, trello_member_id: str) -> dict:
        pass
