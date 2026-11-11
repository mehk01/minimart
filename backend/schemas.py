from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
from models import UserRole, OrderStatus


# ── Auth ─────────────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    phone: Optional[str] = None

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class GoogleAuthRequest(BaseModel):
    credential: str


# ── User ─────────────────────────────────────────────────────────────────────

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    phone: Optional[str]
    role: UserRole
    avatar_url: Optional[str]
    auth_provider: Optional[str] = "local"
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str



# ── Address ───────────────────────────────────────────────────────────────────

class AddressCreate(BaseModel):
    label: str = "Home"
    full_address: str
    city: str
    state: str
    zip_code: str
    is_default: bool = False


class AddressUpdate(BaseModel):
    label: Optional[str] = None
    full_address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    is_default: Optional[bool] = None


class AddressResponse(BaseModel):
    id: int
    label: str
    full_address: str
    city: str
    state: str
    zip_code: str
    is_default: bool

    class Config:
        from_attributes = True



# ── Category ─────────────────────────────────────────────────────────────────

class CategoryCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = None
    image_url: Optional[str] = None
    color: str = "#004ac6"
    sort_order: int = 0


class CategoryResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str]
    icon: Optional[str]
    image_url: Optional[str]
    color: str
    sort_order: int
    is_active: bool

    class Config:
        from_attributes = True


# ── Product ───────────────────────────────────────────────────────────────────

class ProductCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    price: float
    original_price: Optional[float] = None
    unit: str = "piece"
    stock: int = 0
    sku: Optional[str] = None
    image_url: Optional[str] = None
    images: Optional[str] = None
    category_id: int
    is_featured: bool = False
    is_on_sale: bool = False


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    unit: Optional[str] = None
    stock: Optional[int] = None
    image_url: Optional[str] = None
    images: Optional[str] = None
    category_id: Optional[int] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    is_on_sale: Optional[bool] = None


class ProductResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str]
    price: float
    original_price: Optional[float]
    unit: str
    stock: int
    image_url: Optional[str]
    images: Optional[str]
    category_id: int
    category: CategoryResponse
    is_active: bool
    is_featured: bool
    is_on_sale: bool
    rating: float
    review_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    id: int
    name: str
    slug: str
    price: float
    original_price: Optional[float]
    unit: str
    stock: int
    image_url: Optional[str]
    category_id: int
    is_featured: bool
    is_on_sale: bool
    rating: float
    review_count: int

    class Config:
        from_attributes = True


# ── Cart ─────────────────────────────────────────────────────────────────────

class CartItemAdd(BaseModel):
    product_id: int
    quantity: int = 1


class CartItemUpdate(BaseModel):
    quantity: int


class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: ProductListResponse

    class Config:
        from_attributes = True


# ── Order ─────────────────────────────────────────────────────────────────────

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: float
    product: ProductListResponse

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    address_id: Optional[int] = None
    notes: Optional[str] = None
    payment_method: str = "cash_on_delivery"
    coupon_code: Optional[str] = None


class OrderResponse(BaseModel):
    id: int
    order_number: str
    status: OrderStatus
    subtotal: float
    delivery_fee: float
    discount: float
    total: float
    notes: Optional[str]
    payment_method: str
    created_at: datetime
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True


# ── Wishlist ──────────────────────────────────────────────────────────────────

class WishlistItemResponse(BaseModel):
    id: int
    product_id: int
    product: ProductListResponse
    added_at: datetime

    class Config:
        from_attributes = True


class WishlistToggleResponse(BaseModel):
    status: str  # "added" | "removed"
    product_id: int
    message: str



# ── Review ────────────────────────────────────────────────────────────────────

class ReviewCreate(BaseModel):
    rating: int
    comment: Optional[str] = None

    @field_validator("rating")
    @classmethod
    def rating_range(cls, v):
        if not 1 <= v <= 5:
            raise ValueError("Rating must be between 1 and 5")
        return v


class ReviewResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    rating: int
    comment: Optional[str]
    created_at: datetime
    user: UserResponse

    class Config:
        from_attributes = True


# ── Pagination ────────────────────────────────────────────────────────────────

class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    size: int
    pages: int


class PaginatedProductResponse(BaseModel):
    items: List[ProductListResponse]
    total: int
    page: int
    size: int
    pages: int

