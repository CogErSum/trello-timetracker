import asyncio

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.infrastructure.database.main import async_session_factory
from src.infrastructure.database.tables.member import Member


async def ensure_member_exists(session: AsyncSession, trello_id: str) -> Member:
    result = await session.execute(select(Member).where(Member.trello_id == trello_id))
    member = result.scalar_one_or_none()

    if not member:
        member = Member(trello_id=trello_id, username=f"user_{trello_id}")
        session.add(member)
        await session.flush()

    return member


async def seed_member(trello_id: str) -> None:
    async with async_session_factory() as session:
        async with session.begin():
            await ensure_member_exists(session, trello_id)
            print(f"Member {trello_id} ensured in database")


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python -m src.infrastructure.database.seed <trello_member_id>")
        sys.exit(1)

    asyncio.run(seed_member(sys.argv[1]))
