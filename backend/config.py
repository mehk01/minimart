from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./minimart.db"
    SECRET_KEY: str = "supersecretkey-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    GOOGLE_CLIENT_ID: str = "1034213506563-5tgoasb9p2eljhb5a18gq94fagnm9m95.apps.googleusercontent.com"

    class Config:
        env_file = ".env"


settings = Settings()
