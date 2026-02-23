from fastapi import APIRouter, HTTPException
from app.database import get_supabase
from typing import Optional

router = APIRouter()
supabase = get_supabase()

MAIN_CATEGORIES = [
    "All",
    "Computer",
    "Laptop",
    "Monitor",
    "Keyboard",
    "Mouse",
    "Printer",
    "Projector",
    "Networking",
    "Microcontroller",
    "RaspberryPi",
    "Arduino",
    "Cable",
    "Adapter",
    "StorageDevice",
    "Document",
    "SoftwareLicense",
    "Other",
  ]

@router.get("")
async def get_catalog(category: Optional[str] = None, search: Optional[str] = None):
    try:
        query = supabase.table("catalog").select("*")

        if category and category != "All":
            if category == "Other":
                filter_list = [c for c in MAIN_CATEGORIES if c not in ["All", "Other"]]
                query = query.not_.in_("category", filter_list)
            else:
                query = query.eq("category", category)

        if search:
            query = query.ilike("name", f"%{search}%")

        response = query.order("id", desc=True).execute()
        
        return response.data

    except Exception as e:
        print(f"Supabase Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")