from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response

from src.application.export.export_records import ExportRecordsUseCase
from src.infrastructure.database.persistence.time_record_repo import TimeRecordRepository
from src.presentation.api.dependencies import get_trello_member_id

router = APIRouter(prefix="/api/v1/export", tags=["export"])


@router.get("")
async def export_records(
    format: str = Query(..., pattern="^(csv|xlsx)$"),
    card_id: str | None = Query(None),
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
    member_id: str = Depends(get_trello_member_id),
):
    from src.infrastructure.database.main import async_session_factory

    async with async_session_factory() as session:
        time_record_repo = TimeRecordRepository(session)
        use_case = ExportRecordsUseCase(time_record_repo)

        parsed_date_from = datetime.fromisoformat(date_from) if date_from else None
        parsed_date_to = datetime.fromisoformat(date_to) if date_to else None

        try:
            content, content_type, filename = await use_case.execute(
                trello_member_id=member_id,
                format=format,
                card_id=card_id,
                date_from=parsed_date_from,
                date_to=parsed_date_to,
            )
            return Response(
                content=content,
                media_type=content_type,
                headers={"Content-Disposition": f'attachment; filename="{filename}"'},
            )
        except ValueError as e:
            raise HTTPException(status_code=422, detail=str(e))
