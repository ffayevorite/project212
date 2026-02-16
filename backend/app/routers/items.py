from fastapi import APIRouter
from database import supabase
from schemas import ItemCreate

router = APIRouter(prefix="/items", tags=["Items"])

@router.get("/")
async def get_items():
    result = supabase.table("items").select("*").execute()
    return result.data


@router.post("/")
async def create_item(data: ItemCreate):
    result = supabase.table("items").insert({
        "name": data.name,
        "description": data.description,
        "image_url": data.image_url,
        "total_quantity": data.total_quantity,
        "available_quantity": data.total_quantity
    }).execute()

    return result.data
