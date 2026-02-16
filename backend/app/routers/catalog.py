from fastapi import APIRouter, HTTPException
from app.database import get_supabase

router = APIRouter()
supabase = get_supabase()

@router.get("/")
async def get_catalog():
    try:
        response = supabase.table("catalog") \
            .select("*") \
            .order("created_at", desc=True) \
            .execute()

        if response.data is None:
            return []
        return response.data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
