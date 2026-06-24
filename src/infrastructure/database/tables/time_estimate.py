import uuid
from datetime import datetime

from sqlalchemy import String, Integer, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from src.infrastructure.database.main import Base
from src.infrastructure.database.tables.mixin.id import IdMixin
from src.infrastructure.database.tables.mixin.date import DateMixin


class TimeEstimate(Base, IdMixin, DateMixin):
    __tablename__ = "time_estimate"

    trello_member_id: Mapped[str] = mapped_column(String, index=True, nullable=False)
    trello_card_id: Mapped[str] = mapped_column(String, index=True, nullable=False)
    estimated_min: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
