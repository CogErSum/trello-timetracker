from fastapi import APIRouter, Depends, HTTPException, Query

from src.application.records.create_manual_record import CreateManualRecordUseCase
from src.infrastructure.database.persistence.time_record_repo import TimeRecordRepository
from src.presentation.api.dependencies import get_trello_member_id
from src.presentation.api.schemas.record import CreateRecordRequest, RecordResponse, UpdateRecordRequest

router = APIRouter(prefix="/api/v1/records", tags=["records"])


@router.get("/card-summary")
async def card_time_summary(
    card_id: str,
    member_id: str = Depends(get_trello_member_id),
):
    from src.infrastructure.database.main import async_session_factory

    async with async_session_factory() as session:
        time_record_repo = TimeRecordRepository(session)
        records = await time_record_repo.list_all(
            trello_member_id=member_id,
            card_id=card_id,
        )
        total_sec = sum(r["duration_sec"] for r in records)
        return {
            "card_id": card_id,
            "total_sec": total_sec,
            "record_count": len(records),
        }


@router.get("/board-summary")
async def board_time_summary(
    member_id: str = Depends(get_trello_member_id),
):
    from src.infrastructure.database.main import async_session_factory
    from collections import defaultdict

    async with async_session_factory() as session:
        time_record_repo = TimeRecordRepository(session)
        records = await time_record_repo.list_all(trello_member_id=member_id)
        summaries = defaultdict(lambda: {"total_sec": 0, "record_count": 0, "members": set()})
        for r in records:
            summaries[r["trello_card_id"]]["total_sec"] += r["duration_sec"]
            summaries[r["trello_card_id"]]["record_count"] += 1
            summaries[r["trello_card_id"]]["members"].add(r["trello_member_id"])
        result = {}
        for card_id, data in summaries.items():
            result[card_id] = {
                "total_sec": data["total_sec"],
                "record_count": data["record_count"],
                "members": list(data["members"]),
            }
        return result


@router.get("/team-summary")
async def team_time_summary():
    from src.infrastructure.database.main import async_session_factory
    from collections import defaultdict
    import json
    import urllib.request

    async with async_session_factory() as session:
        time_record_repo = TimeRecordRepository(session)
        records = await time_record_repo.list_all(trello_member_id=None)
        summaries = defaultdict(lambda: {"total_sec": 0, "record_count": 0, "members": set()})
        for r in records:
            summaries[r["trello_card_id"]]["total_sec"] += r["duration_sec"]
            summaries[r["trello_card_id"]]["record_count"] += 1
            summaries[r["trello_card_id"]]["members"].add(r["trello_member_id"])

        member_ids = set()
        for data in summaries.values():
            member_ids.update(data["members"])

        member_names = {}
        from src.config.settings import settings
        if settings.trello.api_key and settings.trello.api_token:
            for mid in member_ids:
                try:
                    url = f"https://api.trello.com/1/members/{mid}?key={settings.trello.api_key}&token={settings.trello.api_token}&fields=fullName"
                    with urllib.request.urlopen(url, timeout=5) as resp:
                        member_names[mid] = json.loads(resp.read()).get("fullName", mid)
                except Exception:
                    member_names[mid] = mid

        result = {}
        for card_id, data in summaries.items():
            result[card_id] = {
                "total_sec": data["total_sec"],
                "record_count": data["record_count"],
                "members": [member_names.get(m, m) for m in data["members"]],
            }
        return result


@router.post("", response_model=RecordResponse, status_code=201)
async def create_record(
    request: CreateRecordRequest,
    member_id: str = Depends(get_trello_member_id),
):
    from src.infrastructure.database.main import async_session_factory

    async with async_session_factory() as session:
        time_record_repo = TimeRecordRepository(session)
        use_case = CreateManualRecordUseCase(time_record_repo)

        try:
            record = await use_case.execute(
                trello_member_id=member_id,
                trello_card_id=request.card_id,
                duration_min=request.duration_min,
                date=request.date,
                comment=request.comment,
            )
            await session.commit()
            return record
        except ValueError as e:
            raise HTTPException(status_code=422, detail=str(e))


@router.get("", response_model=list[RecordResponse])
async def list_records(
    card_id: str | None = Query(None),
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
    member_id: str = Depends(get_trello_member_id),
):
    from src.infrastructure.database.main import async_session_factory
    from datetime import datetime
    import json
    import urllib.request
    from src.config.settings import settings

    async with async_session_factory() as session:
        time_record_repo = TimeRecordRepository(session)

        parsed_date_from = datetime.fromisoformat(date_from) if date_from else None
        parsed_date_to = datetime.fromisoformat(date_to) if date_to else None

        records = await time_record_repo.list_all(
            trello_member_id=None if card_id else member_id,
            card_id=card_id,
            date_from=parsed_date_from,
            date_to=parsed_date_to,
        )

        member_ids = {r["trello_member_id"] for r in records}
        member_names = {}
        if settings.trello.api_key and settings.trello.api_token:
            for mid in member_ids:
                try:
                    url = f"https://api.trello.com/1/members/{mid}?key={settings.trello.api_key}&token={settings.trello.api_token}&fields=fullName"
                    with urllib.request.urlopen(url, timeout=5) as resp:
                        member_names[mid] = json.loads(resp.read()).get("fullName", mid)
                except Exception:
                    member_names[mid] = mid

        for r in records:
            r["member_name"] = member_names.get(r["trello_member_id"], r["trello_member_id"])

        return records


@router.patch("/{record_id}", response_model=RecordResponse)
async def update_record(
    record_id: str,
    request: UpdateRecordRequest,
    member_id: str = Depends(get_trello_member_id),
):
    from src.infrastructure.database.main import async_session_factory
    from uuid import UUID
    from datetime import datetime

    async with async_session_factory() as session:
        from sqlalchemy import select
        from src.infrastructure.database.tables.time_record import TimeRecord

        result = await session.execute(select(TimeRecord).where(TimeRecord.id == UUID(record_id)))
        record = result.scalar_one_or_none()
        if not record or record.trello_member_id != member_id:
            raise HTTPException(status_code=404, detail="Record not found")

        if request.duration_min is not None:
            record.duration_sec = request.duration_min * 60
        if request.comment is not None:
            record.comment = request.comment
        if request.record_date is not None:
            try:
                record.record_date = datetime.fromisoformat(request.record_date)
            except ValueError:
                record.record_date = datetime.strptime(request.record_date, "%Y-%m-%d")

        await session.commit()

        return {
            "id": str(record.id),
            "trello_member_id": record.trello_member_id,
            "trello_card_id": record.trello_card_id,
            "start_time": record.start_time.isoformat() if record.start_time else None,
            "end_time": record.end_time.isoformat() if record.end_time else None,
            "duration_sec": record.duration_sec,
            "comment": record.comment,
            "record_date": record.record_date.isoformat() if record.record_date else None,
            "created_at": record.created_at.isoformat() if record.created_at else None,
            "updated_at": record.updated_at.isoformat() if record.updated_at else None,
            "member_name": member_id,
        }


@router.delete("/{record_id}", status_code=204)
async def delete_record(
    record_id: str,
    member_id: str = Depends(get_trello_member_id),
):
    from src.infrastructure.database.main import async_session_factory
    from uuid import UUID

    async with async_session_factory() as session:
        time_record_repo = TimeRecordRepository(session)

        existing = await time_record_repo.get_by_id(UUID(record_id))
        if not existing or existing["trello_member_id"] != member_id:
            raise HTTPException(status_code=404, detail="Record not found")

        await time_record_repo.delete(UUID(record_id))
        await session.commit()
