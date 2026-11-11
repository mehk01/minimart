from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from database import get_db
import models, schemas
from auth import get_current_user

router = APIRouter(prefix="/user", tags=["User Data"])


# ── Addresses ──────────────────────────────────────────
@router.get("/addresses", response_model=List[schemas.AddressResponse])
def get_addresses(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Address).filter(models.Address.user_id == current_user.id).all()


@router.post("/addresses", response_model=schemas.AddressResponse, status_code=status.HTTP_201_CREATED)
def add_address(
    address_in: schemas.AddressCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if address_in.is_default:
        db.query(models.Address).filter(models.Address.user_id == current_user.id).update({"is_default": False})

    address = models.Address(
        user_id=current_user.id,
        **address_in.model_dump()
    )
    db.add(address)
    db.commit()
    db.refresh(address)
    return address


@router.put("/addresses/{address_id}", response_model=schemas.AddressResponse)
def update_address(
    address_id: int,
    address_update: schemas.AddressUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    addr = db.query(models.Address).filter(models.Address.id == address_id, models.Address.user_id == current_user.id).first()
    if not addr:
        raise HTTPException(status_code=404, detail="Address not found")

    if address_update.is_default:
        db.query(models.Address).filter(models.Address.user_id == current_user.id).update({"is_default": False})

    for field, value in address_update.model_dump(exclude_none=True).items():
        setattr(addr, field, value)

    db.commit()
    db.refresh(addr)
    return addr


@router.delete("/addresses/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_address(
    address_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    addr = db.query(models.Address).filter(models.Address.id == address_id, models.Address.user_id == current_user.id).first()
    if not addr:
        raise HTTPException(status_code=404, detail="Address not found")
    db.delete(addr)
    db.commit()
    return None



# ── Wishlist ──────────────────────────────────────────
@router.get("/wishlist", response_model=List[schemas.WishlistItemResponse])
def get_wishlist(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return (
        db.query(models.WishlistItem)
        .options(joinedload(models.WishlistItem.product))
        .filter(models.WishlistItem.user_id == current_user.id)
        .all()
    )


@router.post("/wishlist/{product_id}", response_model=schemas.WishlistToggleResponse)
def toggle_wishlist(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    product = db.query(models.Product).filter(models.Product.id == product_id, models.Product.is_active == True).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing = (
        db.query(models.WishlistItem)
        .filter(models.WishlistItem.user_id == current_user.id, models.WishlistItem.product_id == product_id)
        .first()
    )
    if existing:
        db.delete(existing)
        db.commit()
        return schemas.WishlistToggleResponse(
            status="removed",
            product_id=product_id,
            message="Removed from wishlist"
        )

    item = models.WishlistItem(user_id=current_user.id, product_id=product_id)
    db.add(item)
    db.commit()
    return schemas.WishlistToggleResponse(
        status="added",
        product_id=product_id,
        message="Saved to favorites"
    )

