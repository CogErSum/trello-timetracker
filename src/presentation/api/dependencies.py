import asyncio
from fastapi import Header, HTTPException


async def get_trello_member_id(
    x_trello_member_id: str = Header(..., alias="X-Trello-Member-Id"),
) -> str:
    if not x_trello_member_id:
        raise HTTPException(status_code=401, detail="Trello member ID required")

    from src.presentation.api.main import auto_create_member
    asyncio.create_task(auto_create_member(x_trello_member_id))

    return x_trello_member_id
