from database import engine, SessionLocal, Base
import models
from auth import get_password_hash


def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(models.User).filter(models.User.email == "demo@minimart.com").first():
        print("Database already seeded.")
        db.close()
        return

    print("Seeding database...")

    # 1. Users
    admin_user = models.User(
        email="admin@minimart.com",
        full_name="MiniMart Admin",
        hashed_password=get_password_hash("admin123"),
        phone="+1 555-0100",
        role=models.UserRole.admin,
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
    )
    demo_user = models.User(
        email="demo@minimart.com",
        full_name="Alex Morgan",
        hashed_password=get_password_hash("customer123"),
        phone="+1 555-0199",
        role=models.UserRole.customer,
        avatar_url="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
    )
    db.add(admin_user)
    db.add(demo_user)
    db.flush()

    # Address
    address = models.Address(
        user_id=demo_user.id,
        label="Home",
        full_address="742 Evergreen Terrace, Apt 4B",
        city="Springfield",
        state="IL",
        zip_code="62704",
        is_default=True
    )
    db.add(address)

    # 2. Categories
    categories_data = [
        {
            "name": "Fresh Produce",
            "slug": "produce",
            "description": "Farm-fresh fruits, crisp vegetables, and organic greens delivered daily.",
            "icon": "nutrition",
            "image_url": "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80",
            "color": "#10b981",
            "sort_order": 1
        },
        {
            "name": "Dairy & Eggs",
            "slug": "dairy-eggs",
            "description": "Fresh milk, artisan cheeses, yogurts, and free-range farm eggs.",
            "icon": "egg",
            "image_url": "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=400&q=80",
            "color": "#f59e0b",
            "sort_order": 2
        },
        {
            "name": "Bakery & Bread",
            "slug": "bakery",
            "description": "Oven-fresh sourdough, brioche, croissants, and wholesome pastries.",
            "icon": "bakery_dining",
            "image_url": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80",
            "color": "#d97706",
            "sort_order": 3
        },
        {
            "name": "Meat & Seafood",
            "slug": "meat-seafood",
            "description": "Prime cuts, organic poultry, wild-caught salmon, and ocean treasures.",
            "icon": "set_meal",
            "image_url": "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=400&q=80",
            "color": "#ef4444",
            "sort_order": 4
        },
        {
            "name": "Beverages",
            "slug": "beverages",
            "description": "Cold-pressed juices, sparkling waters, kombucha, and premium roast coffees.",
            "icon": "local_cafe",
            "image_url": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80",
            "color": "#3b82f6",
            "sort_order": 5
        },
        {
            "name": "Pantry & Staples",
            "slug": "pantry",
            "description": "Extra virgin olive oils, pastas, grains, spices, and cooking sauces.",
            "icon": "kitchen",
            "image_url": "https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=400&q=80",
            "color": "#8b5cf6",
            "sort_order": 6
        },
        {
            "name": "Snacks & Sweets",
            "slug": "snacks",
            "description": "Artisan nuts, kettle-cooked chips, dried berries, and dark chocolates.",
            "icon": "cookie",
            "image_url": "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=400&q=80",
            "color": "#ec4899",
            "sort_order": 7
        },
        {
            "name": "Organic & Health",
            "slug": "organic-health",
            "description": "Certified non-GMO superfoods, plant-based proteins, and gluten-free goods.",
            "icon": "eco",
            "image_url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
            "color": "#14b8a6",
            "sort_order": 8
        }
    ]

    categories = {}
    for cat_dict in categories_data:
        cat = models.Category(**cat_dict)
        db.add(cat)
        db.flush()
        categories[cat.slug] = cat.id

    # 3. Products
    products_data = [
        # Produce
        {
            "name": "Organic Hass Avocados",
            "slug": "organic-hass-avocados",
            "description": "Creamy, perfectly ripe organic Hass avocados loaded with healthy fats and fiber.",
            "price": 3.99,
            "original_price": 5.49,
            "unit": "3 count bag",
            "stock": 45,
            "image_url": "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80",
            "category_id": categories["produce"],
            "is_featured": True,
            "is_on_sale": True,
            "rating": 4.9,
            "review_count": 84
        },
        {
            "name": "Fresh Organic Strawberries",
            "slug": "organic-strawberries",
            "description": "Sweet, fragrant, sun-ripened California strawberries picked at peak perfection.",
            "price": 4.49,
            "original_price": 5.99,
            "unit": "16 oz box",
            "stock": 38,
            "image_url": "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80",
            "category_id": categories["produce"],
            "is_featured": True,
            "is_on_sale": True,
            "rating": 4.8,
            "review_count": 62
        },
        {
            "name": "Crisp Gala Apples",
            "slug": "crisp-gala-apples",
            "description": "Crunchy Washington Gala apples with mild sweet flavor, ideal for snacking.",
            "price": 2.99,
            "original_price": None,
            "unit": "2 lb bag",
            "stock": 60,
            "image_url": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80",
            "category_id": categories["produce"],
            "is_featured": False,
            "is_on_sale": False,
            "rating": 4.7,
            "review_count": 39
        },
        {
            "name": "Fresh Baby Spinach",
            "slug": "fresh-baby-spinach",
            "description": "Triple-washed tender organic baby spinach leaves, prepped for salads and smoothies.",
            "price": 3.29,
            "original_price": None,
            "unit": "10 oz clam",
            "stock": 25,
            "image_url": "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80",
            "category_id": categories["produce"],
            "is_featured": False,
            "is_on_sale": False,
            "rating": 4.6,
            "review_count": 27
        },
        {
            "name": "Ripe Cavendish Bananas",
            "slug": "ripe-bananas",
            "description": "Golden yellow Fairtrade certified bananas rich in potassium and energy.",
            "price": 1.49,
            "original_price": 1.99,
            "unit": "bunch (approx 2 lbs)",
            "stock": 100,
            "image_url": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80",
            "category_id": categories["produce"],
            "is_featured": True,
            "is_on_sale": True,
            "rating": 4.8,
            "review_count": 115
        },

        # Dairy & Eggs
        {
            "name": "Pasture-Raised Organic Eggs",
            "slug": "pasture-raised-eggs",
            "description": "Grade A large brown eggs with rich deep orange yolks from free-roaming hens.",
            "price": 5.99,
            "original_price": 6.99,
            "unit": "12 count carton",
            "stock": 50,
            "image_url": "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=600&q=80",
            "category_id": categories["dairy-eggs"],
            "is_featured": True,
            "is_on_sale": True,
            "rating": 4.95,
            "review_count": 140
        },
        {
            "name": "Whole Organic Jersey Milk",
            "slug": "whole-organic-milk",
            "description": "Non-homogenized whole milk with rich cream top from grass-fed family farms.",
            "price": 4.89,
            "original_price": None,
            "unit": "1/2 gallon",
            "stock": 35,
            "image_url": "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80",
            "category_id": categories["dairy-eggs"],
            "is_featured": False,
            "is_on_sale": False,
            "rating": 4.9,
            "review_count": 78
        },
        {
            "name": "Greek Whole Milk Yogurt",
            "slug": "greek-plain-yogurt",
            "description": "Authentic strained Greek yogurt, thick and creamy with 18g of protein per serving.",
            "price": 4.29,
            "original_price": 4.99,
            "unit": "32 oz tub",
            "stock": 30,
            "image_url": "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80",
            "category_id": categories["dairy-eggs"],
            "is_featured": False,
            "is_on_sale": True,
            "rating": 4.85,
            "review_count": 56
        },
        {
            "name": "European Cultured Unsalted Butter",
            "slug": "european-butter",
            "description": "82% butterfat slow-churned sweet cream butter for exquisite baking and cooking.",
            "price": 4.79,
            "original_price": None,
            "unit": "8 oz block",
            "stock": 40,
            "image_url": "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=600&q=80",
            "category_id": categories["dairy-eggs"],
            "is_featured": False,
            "is_on_sale": False,
            "rating": 4.9,
            "review_count": 43
        },

        # Bakery
        {
            "name": "San Francisco Style Sourdough Boule",
            "slug": "artisan-sourdough",
            "description": "Crusty golden sourdough baked on stone hearth with naturally fermented bubbly crumb.",
            "price": 5.49,
            "original_price": 6.49,
            "unit": "24 oz loaf",
            "stock": 20,
            "image_url": "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80",
            "category_id": categories["bakery"],
            "is_featured": True,
            "is_on_sale": True,
            "rating": 4.92,
            "review_count": 95
        },
        {
            "name": "All-Butter French Croissants",
            "slug": "french-croissants",
            "description": "Light, flaky, and golden croissants made using traditional laminating techniques.",
            "price": 6.99,
            "original_price": 7.99,
            "unit": "4 pack",
            "stock": 25,
            "image_url": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80",
            "category_id": categories["bakery"],
            "is_featured": True,
            "is_on_sale": True,
            "rating": 4.88,
            "review_count": 68
        },
        {
            "name": "Brioche Burger Buns",
            "slug": "brioche-burger-buns",
            "description": "Soft and sweet golden brioche buns, pre-sliced and topped with toasted sesame.",
            "price": 3.99,
            "original_price": None,
            "unit": "4 count",
            "stock": 35,
            "image_url": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80",
            "category_id": categories["bakery"],
            "is_featured": False,
            "is_on_sale": False,
            "rating": 4.75,
            "review_count": 31
        },

        # Meat & Seafood
        {
            "name": "Wild Alaskan Sockeye Salmon Fillet",
            "slug": "wild-sockeye-salmon",
            "description": "Sustainably harvested wild salmon with vibrant ruby red color and high omega-3 content.",
            "price": 14.99,
            "original_price": 18.99,
            "unit": "1 lb fillet",
            "stock": 18,
            "image_url": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80",
            "category_id": categories["meat-seafood"],
            "is_featured": True,
            "is_on_sale": True,
            "rating": 4.96,
            "review_count": 72
        },
        {
            "name": "Organic Boneless Chicken Breast",
            "slug": "organic-chicken-breast",
            "description": "Air-chilled organic chicken breasts raised without antibiotics or hormones.",
            "price": 9.49,
            "original_price": None,
            "unit": "1.25 lb pack",
            "stock": 30,
            "image_url": "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=600&q=80",
            "category_id": categories["meat-seafood"],
            "is_featured": False,
            "is_on_sale": False,
            "rating": 4.8,
            "review_count": 49
        },

        # Beverages
        {
            "name": "Cold-Pressed Valencia Orange Juice",
            "slug": "cold-pressed-orange-juice",
            "description": "100% pure raw unpasteurized Valencia orange juice with naturally refreshing pulp.",
            "price": 5.29,
            "original_price": 6.29,
            "unit": "32 fl oz",
            "stock": 25,
            "image_url": "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=600&q=80",
            "category_id": categories["beverages"],
            "is_featured": True,
            "is_on_sale": True,
            "rating": 4.87,
            "review_count": 63
        },
        {
            "name": "Sparkling Mineral Water (Lemon)",
            "slug": "sparkling-mineral-water-lemon",
            "description": "Naturally carbonated Italian alpine mineral water infused with organic Sorrento lemon.",
            "price": 7.49,
            "original_price": None,
            "unit": "6 x 330ml glass",
            "stock": 40,
            "image_url": "https://images.unsplash.com/photo-1559839914-17aae19cec71?auto=format&fit=crop&w=600&q=80",
            "category_id": categories["beverages"],
            "is_featured": False,
            "is_on_sale": False,
            "rating": 4.82,
            "review_count": 37
        },
        {
            "name": "Single-Origin Ethiopian Whole Bean Coffee",
            "slug": "ethiopian-coffee-beans",
            "description": "Light roast Yirgacheffe beans with fragrant notes of bergamot, jasmine, and citrus.",
            "price": 13.99,
            "original_price": 16.49,
            "unit": "12 oz bag",
            "stock": 28,
            "image_url": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80",
            "category_id": categories["beverages"],
            "is_featured": True,
            "is_on_sale": True,
            "rating": 4.94,
            "review_count": 88
        },

        # Pantry
        {
            "name": "Extra Virgin Cold-Extracted Olive Oil",
            "slug": "extra-virgin-olive-oil",
            "description": "Single estate Greek Koroneiki olives cold-pressed within hours of harvest.",
            "price": 16.99,
            "original_price": 19.99,
            "unit": "750 ml bottle",
            "stock": 35,
            "image_url": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80",
            "category_id": categories["pantry"],
            "is_featured": True,
            "is_on_sale": True,
            "rating": 4.95,
            "review_count": 102
        },
        {
            "name": "Bronze-Cut Italian Rigatoni Pasta",
            "slug": "bronze-cut-rigatoni",
            "description": "Slow-dried 100% durum wheat semolina pasta with rough textured surface that grips sauce.",
            "price": 3.79,
            "original_price": None,
            "unit": "16 oz box",
            "stock": 55,
            "image_url": "https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&w=600&q=80",
            "category_id": categories["pantry"],
            "is_featured": False,
            "is_on_sale": False,
            "rating": 4.88,
            "review_count": 47
        },
        {
            "name": "Organic San Marzano Crushed Tomatoes",
            "slug": "san-marzano-tomatoes",
            "description": "D.O.P. certified sweet plum tomatoes grown in volcanic soil beneath Mount Vesuvius.",
            "price": 4.49,
            "original_price": None,
            "unit": "28 oz can",
            "stock": 42,
            "image_url": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80",
            "category_id": categories["pantry"],
            "is_featured": False,
            "is_on_sale": False,
            "rating": 4.91,
            "review_count": 53
        },

        # Snacks
        {
            "name": "Himalayan Pink Salt Kettle Potato Chips",
            "slug": "kettle-chips-pink-salt",
            "description": "Batch-cooked thick cut potatoes seasoned with hand-mined Himalayan rock salt.",
            "price": 3.49,
            "original_price": 4.29,
            "unit": "8.5 oz bag",
            "stock": 45,
            "image_url": "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80",
            "category_id": categories["snacks"],
            "is_featured": False,
            "is_on_sale": True,
            "rating": 4.79,
            "review_count": 64
        },
        {
            "name": "Raw Organic Almonds & Walnuts Mix",
            "slug": "raw-almonds-walnuts",
            "description": "California nonpareil almonds paired with buttery halves of heart-healthy walnuts.",
            "price": 8.99,
            "original_price": 10.99,
            "unit": "14 oz pouch",
            "stock": 32,
            "image_url": "https://images.unsplash.com/photo-1508779018996-601e37fa274e?auto=format&fit=crop&w=600&q=80",
            "category_id": categories["snacks"],
            "is_featured": True,
            "is_on_sale": True,
            "rating": 4.93,
            "review_count": 76
        },
        {
            "name": "Single-Origin 72% Dark Chocolate Bar",
            "slug": "dark-chocolate-72",
            "description": "Direct trade Madagascar cocoa beans with subtle fruity and raspberry tasting notes.",
            "price": 4.99,
            "original_price": None,
            "unit": "3 oz bar",
            "stock": 50,
            "image_url": "https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=600&q=80",
            "category_id": categories["snacks"],
            "is_featured": False,
            "is_on_sale": False,
            "rating": 4.89,
            "review_count": 41
        }
    ]

    for prod_dict in products_data:
        prod = models.Product(**prod_dict)
        db.add(prod)

    db.commit()

    # Add a sample cart item for demo user
    first_prod = db.query(models.Product).first()
    if first_prod:
        cart_sample = models.CartItem(
            user_id=demo_user.id,
            product_id=first_prod.id,
            quantity=2
        )
        db.add(cart_sample)
        db.commit()

    print("Seed complete! Added demo users, categories, and products.")
    db.close()


if __name__ == "__main__":
    seed_database()
