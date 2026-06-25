import json
import urllib.request

from src.config.settings import settings


def fetch_boards(member_id: str) -> list[dict]:
    if not settings.trello.api_key or not settings.trello.api_token:
        return []
    try:
        url = (
            f"https://api.trello.com/1/members/{member_id}/boards"
            f"?key={settings.trello.api_key}&token={settings.trello.api_token}"
            f"&fields=name,closed&filter=open"
        )
        with urllib.request.urlopen(url, timeout=10) as resp:
            boards = json.loads(resp.read())
            return [{"id": b["id"], "name": b["name"]} for b in boards if not b.get("closed")]
    except Exception:
        return []


def fetch_cards_by_boards(board_ids: list[str]) -> dict[str, str]:
    if not settings.trello.api_key or not settings.trello.api_token or not board_ids:
        return {}
    card_to_board = {}
    for board_id in board_ids:
        try:
            url = (
                f"https://api.trello.com/1/boards/{board_id}/cards"
                f"?key={settings.trello.api_key}&token={settings.trello.api_token}"
                f"&fields=name"
            )
            with urllib.request.urlopen(url, timeout=10) as resp:
                cards = json.loads(resp.read())
                for card in cards:
                    card_to_board[card["id"]] = board_id
        except Exception:
            pass
    return card_to_board
