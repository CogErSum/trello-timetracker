from fastapi import APIRouter, Depends, Query

from src.presentation.api.dependencies import get_trello_member_id

router = APIRouter(prefix="/api/v1/boards", tags=["boards"])


@router.get("")
async def list_boards(
    member_id: str = Depends(get_trello_member_id),
):
    from src.application.export.trello_boards import fetch_boards
    return fetch_boards(member_id)


@router.get("/cards")
async def card_names(
    card_ids: str = Query(..., description="Comma-separated card IDs"),
):
    from src.application.export.export_records import fetch_card_names
    ids = [c.strip() for c in card_ids.split(",") if c.strip()]
    cards = fetch_card_names(set(ids))
    return {card_id: info["name"] for card_id, info in cards.items()}
