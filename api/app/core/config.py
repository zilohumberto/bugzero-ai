from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "BugZero API"
    debug: bool = False
    api_prefix: str = "/api"
    database_url: str

    # PostgreSQL container settings (used by docker-compose)
    postgres_user: str = "postgres"
    postgres_password: str = "postgres"
    postgres_db: str = "bugzero"

    # JWT settings
    secret_key: str = "your-secret-key-change-in-production"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    # Agent service settings
    agent_service_url: str = "http://localhost:8001"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
