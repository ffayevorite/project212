from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.database import get_supabase
from typing import Optional

# router = APIRouter()
supabase = get_supabase()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

# @router.get('/')
@app.get("/api/catalog")
async def get_catalog(category: Optional[str] = None, search: Optional[str] = None):
    try:
        query = supabase.table("catalog_items").select("*")
        if category and category != "All":
            if category == "Other":
                query = query.not_.in_("category", MAIN_CATEGORIES)
            else:
                query = query.eq("category", category)

        if search:
            query = query.ilike("name", f"%{search}%")

        response = query.order("id", desc=True).execute()
        return response.data

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
