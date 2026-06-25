from fastapi import APIRouter, Depends

from src.presentation.api.dependencies import get_trello_member_id

router = APIRouter(prefix="/api/v1/boards", tags=["boards"])


@router.get("")
async def list_boards(
    member_id: str = Depends(get_trello_member_id),
):
    from src.application.export.trello_boards import fetch_boards
    return fetch_boards(member_id)
