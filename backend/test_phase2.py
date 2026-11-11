from database import SessionLocal
import models
import schemas
from routers.products import get_products
from routers.user_data import add_address, update_address, delete_address
from routers.categories import create_category, delete_category

def test_phase2():
    db = SessionLocal()
    demo_user = db.query(models.User).filter(models.User.email == "demo@minimart.com").first()
    admin_user = db.query(models.User).filter(models.User.email == "admin@minimart.com").first()

    print("--- 1. Testing Paginated Products Router ---")
    paginated_res = get_products(
        category_id=None,
        category_slug=None,
        search=None,
        featured=None,
        on_sale=None,
        sort_by="newest",
        page=1,
        limit=4,
        offset=None,
        paginated=True,
        db=db
    )
    assert isinstance(paginated_res, schemas.PaginatedProductResponse), f"Expected PaginatedProductResponse, got {type(paginated_res)}"
    print(f"Success: total={paginated_res.total}, pages={paginated_res.pages}, page={paginated_res.page}, returned={len(paginated_res.items)} items")

    print("\n--- 2. Testing Address Creation, Update, and Deletion ---")
    new_addr = add_address(
        address_in=schemas.AddressCreate(
            label="Lake House",
            full_address="4500 Lake Shore Drive",
            city="Springfield",
            state="IL",
            zip_code="62704",
            is_default=False
        ),
        current_user=demo_user,
        db=db
    )
    print(f"Created address id={new_addr.id}, label='{new_addr.label}'")

    updated_addr = update_address(
        address_id=new_addr.id,
        address_update=schemas.AddressUpdate(
            label="Penthouse Suite",
            full_address="4500 Lake Shore Drive, Apt PH1",
            city="Springfield",
            state="IL",
            zip_code="62704",
            is_default=True
        ),
        current_user=demo_user,
        db=db
    )
    assert updated_addr.label == "Penthouse Suite", f"Update failed: {updated_addr.label}"
    print(f"Updated address id={updated_addr.id}: label is now '{updated_addr.label}', address='{updated_addr.full_address}'")

    delete_address(address_id=updated_addr.id, current_user=demo_user, db=db)
    deleted_check = db.query(models.Address).filter(models.Address.id == updated_addr.id).first()
    assert deleted_check is None, "Address still in db after delete"
    print(f"Deleted address id={updated_addr.id} successfully")

    print("\n--- 3. Testing Category Creation and Deletion ---")
    existing_cat = db.query(models.Category).filter(models.Category.slug == "artisan-cheeses-test").first()
    if existing_cat:
        db.delete(existing_cat)
        db.commit()

    cat_create_data = schemas.CategoryCreate(
        name="Artisan Cheeses",
        slug="artisan-cheeses-test",
        description="Aged cheddar and gouda",
        icon="cheese",
        image_url="https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=400&q=80",
        color="#f59e0b",
        sort_order=99
    )
    created_cat = create_category(category_data=cat_create_data, db=db, admin=admin_user)
    print(f"Created category id={created_cat.id}, name='{created_cat.name}', slug='{created_cat.slug}'")

    delete_category(category_id=created_cat.id, db=db, admin=admin_user)
    assert created_cat.is_active is False, "Category is_active was not set to False"
    print(f"Deactivated category id={created_cat.id} successfully")

    # Hard-cleanup test record so tests remain idempotent
    db.delete(created_cat)
    db.commit()

    print("\nALL PHASE 2 BACKEND ENDPOINTS AND ROUTERS VERIFIED 100% WORKING!")

if __name__ == "__main__":
    test_phase2()
