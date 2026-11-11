from sqlalchemy import (
    Column, Integer, String, Float, Boolean, ForeignKey,
    DateTime, Text, Enum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database import Base


class UserRole(str, enum.Enum):
    customer = "customer"
    admin = "admin"


class OrderStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    processing = "processing"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=True)
    google_id = Column(String, unique=True, index=True, nullable=True)
    auth_provider = Column(String, default="local", nullable=False)
    phone = Column(String, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.customer)
    is_active = Column(Boolean, default=True)
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    addresses = relationship("Address", back_populates="user", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="user")
    cart_items = relationship("CartItem", back_populates="user", cascade="all, delete-orphan")
    wishlist_items = relationship("WishlistItem", back_populates="user", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="user")


class Address(Base):
    __tablename__ = "addresses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    label = Column(String, default="Home")
    full_address = Column(Text, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    zip_code = Column(String, nullable=False)
    is_default = Column(Boolean, default=False)

    user = relationship("User", back_populates="addresses")
    orders = relationship("Order", back_populates="address")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    color = Column(String, default="#004ac6")
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)

    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    slug = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    original_price = Column(Float, nullable=True)
    unit = Column(String, default="piece")
    stock = Column(Integer, default=0)
    sku = Column(String, unique=True, nullable=True)
    image_url = Column(String, nullable=True)
    images = Column(Text, nullable=True)  # JSON array of image URLs
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    is_on_sale = Column(Boolean, default=False)
    rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    category = relationship("Category", back_populates="products")
    cart_items = relationship("CartItem", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")
    wishlist_items = relationship("WishlistItem", back_populates="product")
    reviews = relationship("Review", back_populates="product")


class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, default=1)
    added_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="cart_items")
    product = relationship("Product", back_populates="cart_items")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String, unique=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    address_id = Column(Integer, ForeignKey("addresses.id"), nullable=True)
    status = Column(Enum(OrderStatus), default=OrderStatus.pending)
    subtotal = Column(Float, nullable=False)
    delivery_fee = Column(Float, default=2.99)
    discount = Column(Float, default=0.0)
    total = Column(Float, nullable=False)
    notes = Column(Text, nullable=True)
    payment_method = Column(String, default="cash_on_delivery")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="orders")
    address = relationship("Address", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")


class WishlistItem(Base):
    __tablename__ = "wishlist_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    added_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="wishlist_items")
    product = relationship("Product", back_populates="wishlist_items")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="reviews")
    product = relationship("Product", back_populates="reviews")
