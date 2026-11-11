from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session, joinedload
from typing import List, Union
from database import get_db
import models, schemas
from auth import get_current_user

router = APIRouter(prefix="/cart", tags=["Cart"])


@router.get("", response_model=List[schemas.CartItemResponse])
def get_cart(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    items = (
        db.query(models.CartItem)
        .options(joinedload(models.CartItem.product))
        .filter(models.CartItem.user_id == current_user.id)
        .all()
    )
    return items


@router.post("", response_model=schemas.CartItemResponse, status_code=status.HTTP_201_CREATED)
def add_to_cart(
    item_in: schemas.CartItemAdd,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    product = db.query(models.Product).filter(models.Product.id == item_in.product_id).first()
    if not product or not product.is_active:
        raise HTTPException(status_code=404, detail="Product not found or inactive")

    # Check if item already exists in user's cart
    existing_item = (
        db.query(models.CartItem)
        .options(joinedload(models.CartItem.product))
        .filter(models.CartItem.user_id == current_user.id, models.CartItem.product_id == item_in.product_id)
        .first()
    )

    if existing_item:
        existing_item.quantity += item_in.quantity
        db.commit()
        db.refresh(existing_item)
        return existing_item

    new_item = models.CartItem(
        user_id=current_user.id,
        product_id=item_in.product_id,
        quantity=max(1, item_in.quantity)
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    
    # Reload with product relationship eagerly loaded
    return (
        db.query(models.CartItem)
        .options(joinedload(models.CartItem.product))
        .filter(models.CartItem.id == new_item.id)
        .first()
    )


@router.post("/merge", response_model=List[schemas.CartItemResponse])
def merge_guest_cart(
    items_in: List[schemas.CartItemAdd],
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    for item_in in items_in:
        if item_in.quantity <= 0:
            continue
        product = db.query(models.Product).filter(models.Product.id == item_in.product_id, models.Product.is_active == True).first()
        if not product:
            continue
        existing = (
            db.query(models.CartItem)
            .filter(models.CartItem.user_id == current_user.id, models.CartItem.product_id == item_in.product_id)
            .first()
        )
        if existing:
            existing.quantity += item_in.quantity
        else:
            new_item = models.CartItem(
                user_id=current_user.id,
                product_id=item_in.product_id,
                quantity=item_in.quantity
            )
            db.add(new_item)
    db.commit()
    return (
        db.query(models.CartItem)
        .options(joinedload(models.CartItem.product))
        .filter(models.CartItem.user_id == current_user.id)
        .all()
    )


@router.put("/{item_id}")
def update_cart_item(
    item_id: int,
    item_update: schemas.CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    item = (
        db.query(models.CartItem)
        .filter(models.CartItem.id == item_id, models.CartItem.user_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    if item_update.quantity <= 0:
        db.delete(item)
        db.commit()
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    item.quantity = item_update.quantity
    db.commit()
    
    return (
        db.query(models.CartItem)
        .options(joinedload(models.CartItem.product))
        .filter(models.CartItem.id == item.id)
        .first()
    )


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_cart_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    item = (
        db.query(models.CartItem)
        .filter(models.CartItem.id == item_id, models.CartItem.user_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    db.delete(item)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def clear_cart(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db.query(models.CartItem).filter(models.CartItem.user_id == current_user.id).delete()
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

