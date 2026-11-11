from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_user_google_schema():
    """Migrate existing SQLite users table to support passwordless Google OAuth."""
    if "sqlite" not in settings.DATABASE_URL:
        return

    with engine.connect().execution_options(isolation_level="AUTOCOMMIT") as conn:
        rows = conn.exec_driver_sql("PRAGMA table_info(users)").fetchall()
        if not rows:
            return

        cols = {row[1]: row for row in rows}
        needs_nullable_password = "hashed_password" in cols and cols["hashed_password"][3] == 1

        if needs_nullable_password:
            google_id_expr = "google_id" if "google_id" in cols else "NULL"
            auth_provider_expr = "COALESCE(auth_provider, 'local')" if "auth_provider" in cols else "'local'"

            conn.exec_driver_sql("PRAGMA foreign_keys=OFF")
            try:
                conn.exec_driver_sql("BEGIN")
                conn.exec_driver_sql(
                    """
                    CREATE TABLE users_new (
                        id INTEGER NOT NULL PRIMARY KEY,
                        email VARCHAR NOT NULL,
                        full_name VARCHAR NOT NULL,
                        hashed_password VARCHAR,
                        google_id VARCHAR,
                        auth_provider VARCHAR NOT NULL DEFAULT 'local',
                        phone VARCHAR,
                        role VARCHAR(8),
                        is_active BOOLEAN,
                        avatar_url VARCHAR,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME
                    )
                    """
                )
                conn.exec_driver_sql(
                    f"""
                    INSERT INTO users_new (
                        id, email, full_name, hashed_password, google_id, auth_provider,
                        phone, role, is_active, avatar_url, created_at, updated_at
                    )
                    SELECT
                        id, email, full_name, hashed_password, {google_id_expr}, {auth_provider_expr},
                        phone, role, is_active, avatar_url, created_at, updated_at
                    FROM users
                    """
                )
                conn.exec_driver_sql("DROP TABLE users")
                conn.exec_driver_sql("ALTER TABLE users_new RENAME TO users")
                conn.exec_driver_sql("CREATE INDEX IF NOT EXISTS ix_users_id ON users (id)")
                conn.exec_driver_sql("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_email ON users (email)")
                conn.exec_driver_sql("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_google_id ON users (google_id)")
                conn.exec_driver_sql("COMMIT")
            except Exception:
                conn.exec_driver_sql("ROLLBACK")
                raise
            finally:
                conn.exec_driver_sql("PRAGMA foreign_keys=ON")
            return

        if "google_id" not in cols:
            conn.exec_driver_sql("ALTER TABLE users ADD COLUMN google_id VARCHAR")
            conn.exec_driver_sql("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_google_id ON users (google_id)")
        if "auth_provider" not in cols:
            conn.exec_driver_sql("ALTER TABLE users ADD COLUMN auth_provider VARCHAR NOT NULL DEFAULT 'local'")
