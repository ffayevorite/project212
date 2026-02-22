from fastapi import APIRouter, HTTPException
from typing import Optional
from app.database import get_supabase

router = APIRouter()
supabase = get_supabase()

@router.get("")
async def get_catalog(
    category: Optional[str] = None,
    search: Optional[str] = None,
):
    try:
        query = supabase.table("catalog").select("*")

        if category and category != "All":
            query = query.eq("category", category)

        if search:
            query = query.ilike("title", f"%{search}%")

        response = query.order("created_at", desc=True).execute()

        if not response.data:
            return []
            
        return response.data

    except Exception as e:
        print(f"Error fetching catalog: {e}")
        raise HTTPException(status_code=500, detail=str(e))