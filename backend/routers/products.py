from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from typing import Optional, List, Union
from database import get_db
import models, schemas
from auth import get_current_admin

router = APIRouter(prefix="/products", tags=["Products"])



@router.get("", response_model=Union[schemas.PaginatedProductResponse, List[schemas.ProductListResponse]])
def get_products(
    category_id: Optional[int] = None,
    category_slug: Optional[str] = None,
    search: Optional[str] = None,
    featured: Optional[bool] = None,
    on_sale: Optional[bool] = None,
    sort_by: Optional[str] = Query("newest", pattern="^(price_asc|price_desc|rating|popular|newest)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(24, ge=1, le=100),
    offset: Optional[int] = None,
    paginated: bool = True,
    db: Session = Depends(get_db)
):
    query = db.query(models.Product).filter(models.Product.is_active == True)

    if category_id:
        query = query.filter(models.Product.category_id == category_id)
    elif category_slug:
        query = query.join(models.Category).filter(models.Category.slug == category_slug)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (models.Product.name.ilike(search_pattern)) |
            (models.Product.description.ilike(search_pattern))
        )

    if featured is not None:
        query = query.filter(models.Product.is_featured == featured)

    if on_sale is not None:
        query = query.filter(models.Product.is_on_sale == on_sale)

    if sort_by == "price_asc":
        query = query.order_by(models.Product.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(models.Product.price.desc())
    elif sort_by == "rating":
        query = query.order_by(models.Product.rating.desc())
    elif sort_by == "popular":
        query = query.order_by(models.Product.review_count.desc(), models.Product.rating.desc())
    else:
        query = query.order_by(models.Product.id.desc())

    total = query.count()
    actual_offset = offset if offset is not None else (page - 1) * limit
    products = query.offset(actual_offset).limit(limit).all()

    if not paginated:
        return products

    pages = max(1, (total + limit - 1) // limit)
    return schemas.PaginatedProductResponse(
        items=products,
        total=total,
        page=page,
        size=limit,
        pages=pages
    )



@router.get("/featured", response_model=List[schemas.ProductListResponse])
def get_featured_products(limit: int = 10, db: Session = Depends(get_db)):
    return (
        db.query(models.Product)
        .filter(models.Product.is_active == True, models.Product.is_featured == True)
        .order_by(models.Product.rating.desc())
        .limit(limit)
        .all()
    )


@router.get("/deals", response_model=List[schemas.ProductListResponse])
def get_deal_products(limit: int = 10, db: Session = Depends(get_db)):
    return (
        db.query(models.Product)
        .filter(models.Product.is_active == True, models.Product.is_on_sale == True)
        .order_by(models.Product.id.desc())
        .limit(limit)
        .all()
    )


@router.get("/{slug_or_id}", response_model=schemas.ProductResponse)
def get_product(slug_or_id: str, db: Session = Depends(get_db)):
    query = db.query(models.Product).options(joinedload(models.Product.category))
    if slug_or_id.isdigit():
        product = query.filter(models.Product.id == int(slug_or_id)).first()
    else:
        product = query.filter(models.Product.slug == slug_or_id).first()

    if not product or not product.is_active:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("", response_model=schemas.ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_data: schemas.ProductCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin)
):
    existing = db.query(models.Product).filter(models.Product.slug == product_data.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Product slug already exists")

    product = models.Product(**product_data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put("/{product_id}", response_model=schemas.ProductResponse)
def update_product(
    product_id: int,
    product_data: schemas.ProductUpdate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin)
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    for field, value in product_data.model_dump(exclude_none=True).items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin)
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.is_active = False
    db.commit()
    return None
