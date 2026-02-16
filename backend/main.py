from sre_parse import TYPE_FLAGS
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from app.routers.auth import router as auth_router


# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Project 212 API with Supabase",
    description="Backend API for Project 212 using Supabase as database",
    version="1.0.0"
)

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "https://yourapp.vercel.app",  # Production frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(items.router, tags=["Items"])
app.include_router(borrow.router, tags=["Borrow"])

# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {
        "status": "OK",
        "message": "Server is running with Supabase",
        "database": "Supabase"
    }

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to Project 212 API with Supabase",
        "docs": "/docs",
        "health": "/api/health",
        "database": "Supabase"
    }

@router.patch("/approve/{borrow_id}")
async def approve_borrow(borrow_id: str):

    borrow = supabase.table("borrow_requests") \
        .select("*") \
        .eq("id", borrow_id) \
        .single() \
        .execute()

    if not borrow.data:
        raise HTTPException(status_code=404, detail="Not found")

    # ลดจำนวนของ
    supabase.rpc("decrease_available_quantity", {
        "item_id_input": borrow.data["item_id"]
    }).execute()

    # เปลี่ยน status
    supabase.table("borrow_requests") \
        .update({"status": "approved"}) \
        .eq("id", borrow_id) \
        .execute()

    return {"message": "Approved"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)