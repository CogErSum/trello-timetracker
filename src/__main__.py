import asyncio

from src.presentation.main import create_app


async def main() -> None:
    app = create_app()
    import uvicorn

    config = uvicorn.Config(app, host="0.0.0.0", port=8000)
    server = uvicorn.Server(config)
    await server.serve()


if __name__ == "__main__":
    asyncio.run(main())
