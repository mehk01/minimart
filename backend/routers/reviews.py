from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from database import get_db
import models, schemas
from auth import get_current_user

router = APIRouter(prefix="/products/{product_id}/reviews", tags=["Reviews"])


@router.get("", response_model=List[schemas.ReviewResponse])
def get_product_reviews(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id, models.Product.is_active == True).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    reviews = (
        db.query(models.Review)
        .options(joinedload(models.Review.user))
        .filter(models.Review.product_id == product_id)
        .order_by(models.Review.created_at.desc())
        .all()
    )
    return reviews


@router.post("", response_model=schemas.ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_product_review(
    product_id: int,
    review_in: schemas.ReviewCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    product = db.query(models.Product).filter(models.Product.id == product_id, models.Product.is_active == True).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    review = models.Review(
        user_id=current_user.id,
        product_id=product_id,
        rating=review_in.rating,
        comment=review_in.comment
    )
    db.add(review)
    db.flush()

    # Recalculate average rating & review count for the product
    all_reviews = db.query(models.Review).filter(models.Review.product_id == product_id).all()
    product.review_count = len(all_reviews)
    if all_reviews:
        product.rating = round(sum(r.rating for r in all_reviews) / len(all_reviews), 2)

    db.commit()

    return (
        db.query(models.Review)
        .options(joinedload(models.Review.user))
        .filter(models.Review.id == review.id)
        .first()
    )
