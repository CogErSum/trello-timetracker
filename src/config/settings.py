from pydantic_settings import BaseSettings, SettingsConfigDict


class DatabaseSettings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="DATABASE_")

    url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/trello_timetracker"
    echo: bool = False


class CORSSettings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="CORS_")

    origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]


class TrelloSettings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="TRELLO_")

    api_key: str = ""
    api_token: str = ""


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    database: DatabaseSettings = DatabaseSettings()
    cors: CORSSettings = CORSSettings()
    trello: TrelloSettings = TrelloSettings()


settings = Settings()
