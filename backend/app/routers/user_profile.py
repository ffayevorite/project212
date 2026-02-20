from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, "../../"))
sys.path.append(project_root)

from app.database import get_supabase 

supabase = get_supabase()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/users/{user_id}/borrow-history")
async def get_borrow_history(user_id: str):
    try:
        user_response = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
        history_response = supabase.table("borrow_items").select("*").eq("user_id", user_id).execute()

        return {
            "user": user_response.data,
            "history": history_response.data
        }
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)