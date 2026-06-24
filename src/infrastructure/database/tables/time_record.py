from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text

from src.infrastructure.database.main import Base
from src.infrastructure.database.tables.mixin.date import DateMixin
from src.infrastructure.database.tables.mixin.id import IdMixin


class TimeRecord(IdMixin, DateMixin, Base):
    __tablename__ = "time_record"

    trello_member_id = Column(String, ForeignKey("member.trello_id"), nullable=False, index=True)
    trello_card_id = Column(String, nullable=False, index=True)
    start_time = Column(DateTime(timezone=True), nullable=True)
    end_time = Column(DateTime(timezone=True), nullable=True)
    duration_sec = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
