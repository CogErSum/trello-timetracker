from collections.abc import AsyncGenerator

from dishka import Provider, Scope, provide
from sqlalchemy.ext.asyncio import AsyncSession

from src.infrastructure.database.main import async_session_factory


class DatabaseProvider(Provider):
    scope = Scope.APP

    @provide
    async def get_session(self) -> AsyncGenerator[AsyncSession, None]:
        async with async_session_factory() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
