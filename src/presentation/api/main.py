from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator
from pathlib import Path
import logging

from alembic import command
from alembic.config import Config
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles

from src.config.settings import settings
from src.presentation.api.routes.timer import router as timer_router
from src.presentation.api.routes.records import router as records_router
from src.presentation.api.routes.dashboard import router as dashboard_router
from src.presentation.api.routes.export import router as export_router
from src.presentation.api.exception_handlers import register_exception_handlers

logger = logging.getLogger(__name__)
STATIC_DIR = Path("/app/static")


def run_migrations() -> None:
    try:
        alembic_cfg = Config(str(Path(__file__).resolve().parents[3] / "alembic.ini"))
        command.upgrade(alembic_cfg, "head")
        logger.info("Migrations applied successfully")
    except Exception as e:
        logger.error(f"Migration failed: {e}")


async def seed_member() -> None:
    from src.infrastructure.database.main import async_session_factory
    from src.infrastructure.database.seed import ensure_member_exists

    member_id = "6a100df28c8a4d38a17c0c5f"
    try:
        async with async_session_factory() as session:
            async with session.begin():
                await ensure_member_exists(session, member_id)
                logger.info(f"Member {member_id} seeded")
    except Exception as e:
        logger.error(f"Seed failed: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    run_migrations()
    await seed_member()
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title="Trello Time Tracker",
        version="0.1.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors.origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(timer_router)
    app.include_router(records_router)
    app.include_router(dashboard_router)
    app.include_router(export_router)

    register_exception_handlers(app)

    @app.get("/health")
    async def health_check() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/power-up/", response_class=HTMLResponse)
    @app.get("/power-up/index.html", response_class=HTMLResponse)
    async def power_up_connector():
        connector_path = STATIC_DIR / "power-up" / "index.html"
        return HTMLResponse(content=connector_path.read_text())

    app.mount("/power-up", StaticFiles(directory=str(STATIC_DIR / "power-up")), name="power-up")
    app.mount("/assets", StaticFiles(directory=str(STATIC_DIR / "assets")), name="assets")

    @app.get("/{full_path:path}", response_class=HTMLResponse)
    async def serve_spa(full_path: str):
        file_path = STATIC_DIR / full_path
        if file_path.is_file():
            return FileResponse(str(file_path))
        return FileResponse(str(STATIC_DIR / "index.html"))

    return app
