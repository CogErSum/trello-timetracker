import csv
import io
from datetime import datetime

from openpyxl import Workbook

from src.application.common.interfaces import ITimeRecordRepository


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

        if format == "csv":
            return self._to_csv(records)
        elif format == "xlsx":
            return self._to_excel(records)
        else:
            raise ValueError(f"Unsupported format: {format}")

    def _to_csv(self, records: list[dict]) -> tuple[bytes, str, str]:
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Card ID", "Duration (sec)", "Duration (h:m)", "Comment", "Date"])

        for record in records:
            duration = record["duration_sec"]
            hours = duration // 3600
            minutes = (duration % 3600) // 60
            writer.writerow([
                record["trello_card_id"],
                duration,
                f"{hours}h {minutes}m",
                record.get("comment", ""),
                record.get("created_at", ""),
            ])

        content = output.getvalue().encode("utf-8")
        return content, "text/csv", "time_records.csv"

    def _to_excel(self, records: list[dict]) -> tuple[bytes, str, str]:
        wb = Workbook()
        ws = wb.active
        ws.title = "Time Records"

        ws.append(["Card ID", "Duration (sec)", "Duration (h:m)", "Comment", "Date"])

        for record in records:
            duration = record["duration_sec"]
            hours = duration // 3600
            minutes = (duration % 3600) // 60
            ws.append([
                record["trello_card_id"],
                duration,
                f"{hours}h {minutes}m",
                record.get("comment", ""),
                record.get("created_at", ""),
            ])

        buffer = io.BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        return buffer.read(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "time_records.xlsx"
