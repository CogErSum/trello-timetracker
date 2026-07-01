from fastapi import APIRouter, Depends
from pydantic import BaseModel

from src.presentation.api.dependencies import get_trello_member_id
from src.infrastructure.trello.comments import post_card_comment

router = APIRouter(prefix="/api/v1/comments", tags=["comments"])


class CommentRequest(BaseModel):
    card_id: str
    text: str


@router.post("", status_code=204)
async def log_comment(
    request: CommentRequest,
    member_id: str = Depends(get_trello_member_id),
):
    post_card_comment(request.card_id, request.text)
