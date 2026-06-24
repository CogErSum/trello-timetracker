from dishka import make_async_container

from src.presentation.composition.di.providers.infrastructure.database import DatabaseProvider


def create_container() -> make_async_container:
    return make_async_container(
        DatabaseProvider(),
    )
