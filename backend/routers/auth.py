from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    get_current_user,
    verify_google_id_token,
)
from jose import JWTError, jwt
from config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _issue_token_response(user: models.User) -> schemas.TokenResponse:
    return schemas.TokenResponse(
        access_token=create_access_token({"sub": str(user.id)}),
        refresh_token=create_refresh_token({"sub": str(user.id)}),
    )


@router.post("/register", response_model=schemas.TokenResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: schemas.UserRegister, db: Session = Depends(get_db)):
    email = user_data.email.strip().lower()
    if db.query(models.User).filter(func.lower(models.User.email) == email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = models.User(
        email=email,
        full_name=user_data.full_name,
        phone=user_data.phone,
        hashed_password=get_password_hash(user_data.password),
        auth_provider="local",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return _issue_token_response(user)


@router.post("/login", response_model=schemas.TokenResponse)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    email = credentials.email.strip().lower()
    user = db.query(models.User).filter(func.lower(models.User.email) == email).first()
    if user and not user.hashed_password:
        raise HTTPException(
            status_code=401,
            detail="This account uses Google Sign-In. Please continue with Google.",
        )
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is deactivated")

    return _issue_token_response(user)


@router.post("/google", response_model=schemas.TokenResponse)
def google_login(body: schemas.GoogleAuthRequest, db: Session = Depends(get_db)):
    idinfo = verify_google_id_token(body.credential)
    google_sub = idinfo["sub"]
    email = idinfo["email"].strip().lower()
    full_name = (idinfo.get("name") or email.split("@")[0]).strip()
    avatar_url = idinfo.get("picture")

    user = db.query(models.User).filter(models.User.google_id == google_sub).first()
    if not user:
        user = db.query(models.User).filter(func.lower(models.User.email) == email).first()

    if user:
        if not user.is_active:
            raise HTTPException(status_code=400, detail="Account is deactivated")
        if not user.google_id:
            user.google_id = google_sub
        if user.hashed_password and user.auth_provider == "local":
            user.auth_provider = "both"
        elif not user.hashed_password:
            user.auth_provider = "google"
        if avatar_url and (not user.avatar_url or user.auth_provider == "google"):
            user.avatar_url = avatar_url
        if not user.full_name:
            user.full_name = full_name
    else:
        user = models.User(
            email=email,
            full_name=full_name,
            hashed_password=None,
            google_id=google_sub,
            auth_provider="google",
            avatar_url=avatar_url,
        )
        db.add(user)

    db.commit()
    db.refresh(user)
    return _issue_token_response(user)


@router.post("/refresh", response_model=schemas.TokenResponse)
def refresh_token(body: schemas.RefreshTokenRequest, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(body.refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return _issue_token_response(user)


@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=schemas.UserResponse)
def update_me(update_data: schemas.UserUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    for field, value in update_data.model_dump(exclude_none=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user
