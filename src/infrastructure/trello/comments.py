import json
import logging
import urllib.request

from src.config.settings import settings

logger = logging.getLogger(__name__)


def fetch_member_name(member_id: str) -> str:
    if not settings.trello.api_key or not settings.trello.api_token:
        return member_id
    try:
        url = (
            f"https://api.trello.com/1/members/{member_id}"
            f"?key={settings.trello.api_key}&token={settings.trello.api_token}"
            f"&fields=fullName"
        )
        with urllib.request.urlopen(url, timeout=5) as resp:
            return json.loads(resp.read()).get("fullName", member_id)
    except Exception:
        return member_id


def post_card_comment(card_id: str, text: str) -> None:
    if not settings.trello.api_key or not settings.trello.api_token:
        logger.warning("Trello API credentials not configured, skipping comment")
        return

    url = (
        f"https://api.trello.com/1/cards/{card_id}/actions/comments"
        f"?key={settings.trello.api_key}&token={settings.trello.api_token}"
    )
    data = json.dumps({"text": text}).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            logger.info(f"Posted comment to card {card_id}: {text}")
    except Exception as e:
        logger.error(f"Failed to post comment to card {card_id}: {e}")


def format_duration_comment(duration_sec: int, action: str = "logged", member_id: str | None = None) -> str:
    h = duration_sec // 3600
    m = (duration_sec % 3600) // 60
    if h > 0 and m > 0:
        dur_str = f"{h}h {m}m"
    elif h > 0:
        dur_str = f"{h}h"
    else:
        dur_str = f"{m}m"

    name = fetch_member_name(member_id) if member_id else "Unknown"
    return f"[TeamSight] {name}: +{dur_str} {action}"
