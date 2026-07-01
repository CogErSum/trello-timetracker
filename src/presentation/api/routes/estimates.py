from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from src.infrastructure.database.persistence.time_estimate_repo import TimeEstimateRepository
from src.presentation.api.dependencies import get_trello_member_id
from src.infrastructure.trello.comments import post_card_comment, fetch_member_name

router = APIRouter(prefix="/api/v1/estimates", tags=["estimates"])


class EstimateRequest(BaseModel):
    card_id: str
    estimated_min: int
    comment: str | None = None


class EstimateResponse(BaseModel):
    id: str
    trello_card_id: str
    estimated_min: int
    comment: str | None = None


@router.get("")
async def get_estimate(
    card_id: str,
    member_id: str = Depends(get_trello_member_id),
):
    from src.infrastructure.database.main import async_session_factory

    async with async_session_factory() as session:
        repo = TimeEstimateRepository(session)
        estimate = await repo.get_by_card(member_id, card_id)
        if not estimate:
            raise HTTPException(status_code=404, detail="No estimate")
        return estimate


@router.post("", response_model=EstimateResponse, status_code=201)
async def upsert_estimate(
    request: EstimateRequest,
    member_id: str = Depends(get_trello_member_id),
):
    from src.infrastructure.database.main import async_session_factory

    async with async_session_factory() as session:
        repo = TimeEstimateRepository(session)
        estimate = await repo.upsert(member_id, request.card_id, request.estimated_min, request.comment)
        await session.commit()
        h = request.estimated_min // 60
        m = request.estimated_min % 60
        dur_str = f"{h}h {m}m" if h > 0 and m > 0 else (f"{h}h" if h > 0 else f"{m}m")
        name = fetch_member_name(member_id)
        post_card_comment(request.card_id, f"[TeamSight] {name}: estimate set {dur_str}")
        return estimate


@router.delete("/{card_id}", status_code=204)
async def delete_estimate(
    card_id: str,
    member_id: str = Depends(get_trello_member_id),
):
    from src.infrastructure.database.main import async_session_factory

    async with async_session_factory() as session:
        repo = TimeEstimateRepository(session)
        deleted = await repo.delete(member_id, card_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Estimate not found")
        await session.commit()
        name = fetch_member_name(member_id)
        post_card_comment(card_id, f"[TeamSight] {name}: estimate removed")


@router.get("/board")
async def board_estimates(
    member_id: str = Depends(get_trello_member_id),
):
    from src.infrastructure.database.main import async_session_factory

    async with async_session_factory() as session:
        repo = TimeEstimateRepository(session)
        return await repo.get_board_estimates(member_id)


@router.get("/team-board")
async def team_estimates():
    from src.infrastructure.database.main import async_session_factory

    async with async_session_factory() as session:
        repo = TimeEstimateRepository(session)
        result = await repo.get_board_estimates(None)
        return result
