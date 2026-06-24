from sqlalchemy import Column, String

from src.infrastructure.database.main import Base
from src.infrastructure.database.tables.mixin.date import DateMixin
from src.infrastructure.database.tables.mixin.id import IdMixin


class Member(IdMixin, DateMixin, Base):
    __tablename__ = "member"

    trello_id = Column(String, unique=True, nullable=False, index=True)
    username = Column(String, nullable=True)
