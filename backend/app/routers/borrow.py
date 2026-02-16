from fastapi import APIRouter, HTTPException
from database import supabase
from schemas import BorrowCreate

router = APIRouter(prefix="/borrow", tags=["Borrow"])

@router.post("/")
async def borrow_item(data: BorrowCreate, user_id: str):
    # เช็คของเหลือ
    item = supabase.table("items") \
        .select("*") \
        .eq("id", data.item_id) \
        .single() \
        .execute()

    if not item.data:
        raise HTTPException(status_code=404, detail="Item not found")

    if item.data["available_quantity"] <= 0:
        raise HTTPException(status_code=400, detail="Item not available")

    # สร้าง request
    supabase.table("borrow_requests").insert({
        "user_id": user_id,
        "item_id": data.item_id,
        "status": "pending",
        "borrow_date": data.borrow_date,
        "return_date": data.return_date
    }).execute()

    return {"message": "Borrow request created"}
