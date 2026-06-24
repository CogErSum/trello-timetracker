from fastapi import Header, HTTPException


async def get_trello_member_id(
    x_trello_member_id: str = Header(..., alias="X-Trello-Member-Id"),
) -> str:
    if not x_trello_member_id:
        raise HTTPException(status_code=401, detail="Trello member ID required")
    return x_trello_member_id
