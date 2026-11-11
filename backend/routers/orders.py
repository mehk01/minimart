from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
import uuid
from datetime import datetime
from database import get_db
import models, schemas
from auth import get_current_user, get_current_admin

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=schemas.OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_in: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    cart_items = (
        db.query(models.CartItem)
        .options(joinedload(models.CartItem.product))
        .filter(models.CartItem.user_id == current_user.id)
        .all()
    )

    if not cart_items:
        raise HTTPException(status_code=400, detail="Cannot create order with an empty cart")

    # Validate stock
    for item in cart_items:
        if item.product.stock is not None and item.product.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {item.product.name} (available: {item.product.stock})"
            )

    subtotal = sum(item.product.price * item.quantity for item in cart_items)
    delivery_fee = 0.0 if subtotal >= 499.0 else 29.0
    discount = 0.0

    if order_in.coupon_code:
        code = order_in.coupon_code.strip().upper()
        if code == "SAVE20":
            discount = round(subtotal * 0.20, 2)
        elif code == "FREEDELIVERY":
            delivery_fee = 0.0

    total = round(max(0.0, subtotal + delivery_fee - discount), 2)

    order_number = f"MM-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

    order = models.Order(
        order_number=order_number,
        user_id=current_user.id,
        address_id=order_in.address_id,
        status=models.OrderStatus.pending,
        subtotal=round(subtotal, 2),
        delivery_fee=delivery_fee,
        discount=discount,
        total=total,
        notes=order_in.notes,
        payment_method=order_in.payment_method
    )
    db.add(order)
    db.flush()

    for item in cart_items:
        order_item = models.OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price=item.product.price
        )
        db.add(order_item)
        # Deduct stock
        if item.product.stock is not None:
            item.product.stock = max(0, item.product.stock - item.quantity)

    # Clear user cart
    db.query(models.CartItem).filter(models.CartItem.user_id == current_user.id).delete()
    db.commit()

    # Refresh with items and products
    order = (
        db.query(models.Order)
        .options(joinedload(models.Order.items).joinedload(models.OrderItem.product))
        .filter(models.Order.id == order.id)
        .first()
    )
    return order


@router.get("", response_model=List[schemas.OrderResponse])
def get_user_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = (
        db.query(models.Order)
        .options(joinedload(models.Order.items).joinedload(models.OrderItem.product))
    )
    if current_user.role != models.UserRole.admin:
        query = query.filter(models.Order.user_id == current_user.id)

    orders = query.order_by(models.Order.created_at.desc()).all()
    return orders


@router.get("/{order_id}", response_model=schemas.OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = (
        db.query(models.Order)
        .options(joinedload(models.Order.items).joinedload(models.OrderItem.product))
        .filter(models.Order.id == order_id)
    )
    if current_user.role != models.UserRole.admin:
        query = query.filter(models.Order.user_id == current_user.id)

    order = query.first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.patch("/{order_id}/status", response_model=schemas.OrderResponse)
def update_order_status(
    order_id: int,
    new_status: models.OrderStatus,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin)
):
    order = (
        db.query(models.Order)
        .options(joinedload(models.Order.items).joinedload(models.OrderItem.product))
        .filter(models.Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = new_status
    db.commit()
    db.refresh(order)
    return order
