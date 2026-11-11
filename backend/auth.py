import json
import urllib.request
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db
from config import settings
import models

security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: Optional[str]) -> bool:
    if not hashed_password:
        return False
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def _verify_google_token_via_jwks(token: str) -> dict:
    """Fallback Google ID token verifier using Google's public JWKS and python-jose."""
    try:
        header = jwt.get_unverified_header(token)
        with urllib.request.urlopen("https://www.googleapis.com/oauth2/v3/certs", timeout=5) as resp:
            jwks = json.loads(resp.read().decode("utf-8"))
        key = next((k for k in jwks.get("keys", []) if k.get("kid") == header.get("kid")), None)
        if not key:
            raise ValueError("Matching Google signing key not found")
        return jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience=settings.GOOGLE_CLIENT_ID,
            options={"verify_iss": False},
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Google token",
        )


def verify_google_id_token(token: str) -> dict:
    """Verify a Google Sign-In ID token and return its validated claims."""
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google Sign-In is not configured on the server",
        )
    try:
        from google.oauth2 import id_token as google_id_token
        from google.auth.transport import requests as google_requests

        idinfo = google_id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except ImportError:
        idinfo = _verify_google_token_via_jwks(token)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Google token",
        )

    if idinfo.get("iss") not in ("accounts.google.com", "https://accounts.google.com"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google token issuer")
    if not idinfo.get("email_verified") or not idinfo.get("email") or not idinfo.get("sub"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Google email is not verified")
    return idinfo


def get_password_hash(password: str) -> str:
    # bcrypt limit is 72 bytes
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id_raw = payload.get("sub")
        if user_id_raw is None:
            raise credentials_exception
        user_id = int(user_id_raw)
    except (JWTError, ValueError):
        raise credentials_exception

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None or not user.is_active:
        raise credentials_exception
    return user


async def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    db: Session = Depends(get_db)
) -> Optional[models.User]:
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id_raw = payload.get("sub")
        if user_id_raw is None:
            return None
        user_id = int(user_id_raw)
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if user and user.is_active:
            return user
    except Exception:
        return None
    return None


async def get_current_admin(current_user: models.User = Depends(get_current_user)) -> models.User:
    if current_user.role != models.UserRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user
