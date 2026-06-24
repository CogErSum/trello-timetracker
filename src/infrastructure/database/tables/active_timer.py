from sqlalchemy import Column, DateTime, ForeignKey, String

from src.infrastructure.database.main import Base
from src.infrastructure.database.tables.mixin.date import DateMixin
from src.infrastructure.database.tables.mixin.id import IdMixin


class ActiveTimer(IdMixin, DateMixin, Base):
    __tablename__ = "active_timer"

    trello_member_id = Column(String, ForeignKey("member.trello_id"), unique=True, nullable=False, index=True)
    trello_card_id = Column(String, nullable=False)
    started_at = Column(DateTime(timezone=True), nullable=False)
