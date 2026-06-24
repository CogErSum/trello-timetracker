import csv
import io
import json
import urllib.request
import urllib.parse
from datetime import datetime

from openpyxl import Workbook

from src.application.common.interfaces import ITimeRecordRepository
from src.config.settings import settings


def fetch_card_names(card_ids: set[str]) -> dict[str, str]:
    if not settings.trello.api_key or not settings.trello.api_token:
        return {}
    names = {}
    for card_id in card_ids:
        try:
            url = f"https://api.trello.com/1/cards/{card_id}?key={settings.trello.api_key}&token={settings.trello.api_token}&fields=name"
            with urllib.request.urlopen(url, timeout=5) as resp:
                names[card_id] = json.loads(resp.read()).get("name", card_id)
        except Exception:
            pass
    return names


def fetch_member_name(member_id: str) -> str:
    if not settings.trello.api_key or not settings.trello.api_token:
        return member_id
    try:
        url = f"https://api.trello.com/1/members/{member_id}?key={settings.trello.api_key}&token={settings.trello.api_token}&fields=fullName"
        with urllib.request.urlopen(url, timeout=5) as resp:
            return json.loads(resp.read()).get("fullName", member_id)
    except Exception:
        pass
    return member_id


class ExportRecordsUseCase:
    def __init__(self, time_record_repo: ITimeRecordRepository) -> None:
        self.time_record_repo = time_record_repo

    async def execute(
        self,
        trello_member_id: str,
        format: str,
        card_id: str | None = None,
        date_from: datetime | None = None,
        date_to: datetime | None = None,
    ) -> tuple[bytes, str, str]:
        records = await self.time_record_repo.list_all(
            trello_member_id=trello_member_id,
            card_id=card_id,
            date_from=date_from,
            date_to=date_to,
        )

        card_ids = {r["trello_card_id"] for r in records}
        card_names = fetch_card_names(card_ids)
        member_name = fetch_member_name(trello_member_id)

        if format == "csv":
            return self._to_csv(records, card_names, member_name)
        elif format == "xlsx":
            return self._to_excel(records, card_names, member_name)
        else:
            raise ValueError(f"Unsupported format: {format}")

    def _to_csv(self, records: list[dict], card_names: dict[str, str], member_name: str) -> tuple[bytes, str, str]:
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Member", "Card", "Duration (sec)", "Duration (h:m)", "Comment", "Date"])

        for record in records:
            duration = record["duration_sec"]
            hours = duration // 3600
            minutes = (duration % 3600) // 60
            card_name = card_names.get(record["trello_card_id"], record["trello_card_id"])
            writer.writerow([
                member_name,
                card_name,
                duration,
                f"{hours}h {minutes}m",
                record.get("comment", ""),
                record.get("created_at", ""),
            ])

        content = output.getvalue().encode("utf-8")
        return content, "text/csv", "time_records.csv"

    def _to_excel(self, records: list[dict], card_names: dict[str, str], member_name: str) -> tuple[bytes, str, str]:
        wb = Workbook()
        ws = wb.active
        ws.title = "Time Records"

        ws.append(["Member", "Card", "Duration (sec)", "Duration (h:m)", "Comment", "Date"])

        for record in records:
            duration = record["duration_sec"]
            hours = duration // 3600
            minutes = (duration % 3600) // 60
            card_name = card_names.get(record["trello_card_id"], record["trello_card_id"])
            ws.append([
                member_name,
                card_name,
                duration,
                f"{hours}h {minutes}m",
                record.get("comment", ""),
                record.get("created_at", ""),
            ])

        buffer = io.BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        return buffer.read(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "time_records.xlsx"
