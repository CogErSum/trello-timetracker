import csv
import io
import json
import urllib.request
import urllib.parse
from datetime import datetime

from openpyxl import Workbook

from src.application.common.interfaces import ITimeRecordRepository
from src.config.settings import settings


def fetch_card_names(card_ids: set[str]) -> dict[str, dict]:
    if not settings.trello.api_key or not settings.trello.api_token:
        return {}
    cards = {}
    for card_id in card_ids:
        try:
            url = f"https://api.trello.com/1/cards/{card_id}?key={settings.trello.api_key}&token={settings.trello.api_token}&fields=name,idBoard"
            with urllib.request.urlopen(url, timeout=5) as resp:
                data = json.loads(resp.read())
                cards[card_id] = {"name": data.get("name", card_id), "board_id": data.get("idBoard", "")}
        except Exception:
            pass
    return cards


def fetch_board_names(board_ids: set[str]) -> dict[str, str]:
    if not settings.trello.api_key or not settings.trello.api_token:
        return {}
    names = {}
    for board_id in board_ids:
        if not board_id:
            continue
        try:
            url = f"https://api.trello.com/1/boards/{board_id}?key={settings.trello.api_key}&token={settings.trello.api_token}&fields=name"
            with urllib.request.urlopen(url, timeout=5) as resp:
                names[board_id] = json.loads(resp.read()).get("name", board_id)
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
        board_ids: list[str] | None = None,
    ) -> tuple[bytes, str, str]:
        records = await self.time_record_repo.list_all(
            trello_member_id=None,
            card_id=card_id,
            date_from=date_from,
            date_to=date_to,
        )

        if board_ids:
            from src.application.export.trello_boards import fetch_cards_by_boards
            card_to_board = fetch_cards_by_boards(board_ids)
            records = [r for r in records if r["trello_card_id"] in card_to_board]

        card_ids = {r["trello_card_id"] for r in records}
        cards_info = fetch_card_names(card_ids)
        board_ids = {c["board_id"] for c in cards_info.values() if c.get("board_id")}
        board_names = fetch_board_names(board_ids)
        member_name = fetch_member_name(trello_member_id)

        if format == "csv":
            return self._to_csv(records, cards_info, board_names, member_name)
        elif format == "xlsx":
            return self._to_excel(records, cards_info, board_names, member_name)
        else:
            raise ValueError(f"Unsupported format: {format}")

    def _to_csv(self, records: list[dict], cards_info: dict, board_names: dict, member_name: str) -> tuple[bytes, str, str]:
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Member", "Board", "Card", "Duration (sec)", "Duration (h:m)", "Comment", "Date"])

        for record in records:
            duration = record["duration_sec"]
            hours = duration // 3600
            minutes = (duration % 3600) // 60
            card = cards_info.get(record["trello_card_id"], {})
            card_name = card.get("name", record["trello_card_id"])
            board_name = board_names.get(card.get("board_id", ""), "")
            writer.writerow([
                member_name,
                board_name,
                card_name,
                duration,
                f"{hours}h {minutes}m",
                record.get("comment", ""),
                record.get("created_at", ""),
            ])

        content = output.getvalue().encode("utf-8")
        return content, "text/csv", "time_records.csv"

    def _to_excel(self, records: list[dict], cards_info: dict, board_names: dict, member_name: str) -> tuple[bytes, str, str]:
        wb = Workbook()
        ws = wb.active
        ws.title = "Time Records"

        ws.append(["Member", "Board", "Card", "Duration (sec)", "Duration (h:m)", "Comment", "Date"])

        for record in records:
            duration = record["duration_sec"]
            hours = duration // 3600
            minutes = (duration % 3600) // 60
            card = cards_info.get(record["trello_card_id"], {})
            card_name = card.get("name", record["trello_card_id"])
            board_name = board_names.get(card.get("board_id", ""), "")
            ws.append([
                member_name,
                board_name,
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
