from abc import ABC, abstractmethod
from datetime import datetime


class IActiveTimerRepository(ABC):
    @abstractmethod
    async def get_active(self, trello_member_id: str) -> dict | None:
        pass

    @abstractmethod
    async def create(self, trello_member_id: str, trello_card_id: str, started_at: datetime) -> dict:
        pass

    @abstractmethod
    async def delete(self, trello_member_id: str) -> bool:
        pass
