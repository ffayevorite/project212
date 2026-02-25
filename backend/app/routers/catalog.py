from fastapi import APIRouter, HTTPException
from app.database import get_supabase
from typing import Optional

router = APIRouter()
supabase = get_supabase()

@router.get("/categories")
async def get_categories():
    try:
        response = supabase.table("catalog").select("category").execute()
        unique_categories = {item["category"] for item in response.data if item.get("category")}
        sorted_categories = sorted(list(unique_categories))
        
        return {"categories": sorted_categories}

    except Exception as e:
        print(f"Supabase Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.get("")
async def get_catalog(category: Optional[str] = None, search: Optional[str] = None):
    try:
        query = supabase.table("catalog").select("*")

        if category and category != "All":
            query = query.eq("category", category)

        if search:
            query = query.ilike("title", f"%{search}%")

        response = query.order("id", desc=True).execute()
        
        return response.data

    except Exception as e:
        print(f"Supabase Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")