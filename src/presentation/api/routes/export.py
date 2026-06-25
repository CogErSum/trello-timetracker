from datetime import datetime

from fastapi import APIRouter, Header, HTTPException, Query
from fastapi.responses import Response

from src.application.export.export_records import ExportRecordsUseCase
from src.infrastructure.database.persistence.time_record_repo import TimeRecordRepository

router = APIRouter(prefix="/api/v1/export", tags=["export"])


@router.get("")
async def export_records(
    format: str = Query(..., pattern="^(csv|xlsx)$"),
    card_id: str | None = Query(None),
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
    member_id: str | None = Query(None),
    board_ids: str | None = Query(None, description="Comma-separated board IDs"),
    x_trello_member_id: str | None = Header(None, alias="X-Trello-Member-Id"),
):
    from src.infrastructure.database.main import async_session_factory

    async with async_session_factory() as session:
        time_record_repo = TimeRecordRepository(session)
        use_case = ExportRecordsUseCase(time_record_repo)

        parsed_date_from = datetime.fromisoformat(date_from) if date_from else None
        parsed_date_to = datetime.fromisoformat(date_to) if date_to else None
        resolved_member_id = member_id or x_trello_member_id
        if not resolved_member_id:
            raise HTTPException(status_code=422, detail="member_id query param or X-Trello-Member-Id header required")

        parsed_boards = board_ids.split(",") if board_ids else None

        try:
            content, content_type, filename = await use_case.execute(
                trello_member_id=resolved_member_id,
                format=format,
                card_id=card_id,
                date_from=parsed_date_from,
                date_to=parsed_date_to,
                board_ids=parsed_boards,
            )
            return Response(
                content=content,
                media_type=content_type,
                headers={"Content-Disposition": f'attachment; filename="{filename}"'},
            )
        except ValueError as e:
            raise HTTPException(status_code=422, detail=str(e))
