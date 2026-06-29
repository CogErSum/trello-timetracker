import asyncio
import json
import logging
import urllib.request

from src.config.settings import settings

logger = logging.getLogger(__name__)


def _post_comment_sync(card_id: str, text: str) -> None:
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
    with urllib.request.urlopen(req, timeout=10) as resp:
        logger.info(f"Posted comment to card {card_id}: {text}")


def post_card_comment(card_id: str, text: str) -> None:
    if not settings.trello.api_key or not settings.trello.api_token:
        logger.warning("Trello API credentials not configured, skipping comment")
        return

    try:
        _post_comment_sync(card_id, text)
    except Exception as e:
        logger.error(f"Failed to post comment to card {card_id}: {e}")


def format_duration_comment(duration_sec: int, action: str = "logged") -> str:
    h = duration_sec // 3600
    m = (duration_sec % 3600) // 60
    if h > 0 and m > 0:
        dur_str = f"{h}h {m}m"
    elif h > 0:
        dur_str = f"{h}h"
    else:
        dur_str = f"{m}m"
    return f"[TeamSight] +{dur_str} {action}"
