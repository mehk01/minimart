from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import engine, Base
import models
from routers import auth, categories, products, cart, orders, user_data, reviews
from seed import seed_database



@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables and auto-seed if needed
    Base.metadata.create_all(bind=engine)
    try:
        seed_database()
    except Exception as e:
        print(f"Error seeding database: {e}")
    yield


app = FastAPI(
    title="MiniMart API",
    description="Modern Grocery Delivery & Shopping API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS setup for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers with /api prefix
app.include_router(auth.router, prefix="/api")
app.include_router(categories.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(cart.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(user_data.router, prefix="/api")
app.include_router(reviews.router, prefix="/api")



@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "MiniMart API", "version": "1.0.0"}


@app.post("/api/seed")
def trigger_seed():
    seed_database()
    return {"message": "Database seeded successfully"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
