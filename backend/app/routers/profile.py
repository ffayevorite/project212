from app.database import supabase_admin
from fastapi import APIRouter, HTTPException

router = APIRouter()

@router.get("")
def get_profiles(user_id: str):
    try:
        if len(user_id) != 36 or "-" not in user_id:
            raise HTTPException(status_code=400, detail="Invalid UUID format")

        user_db_response = supabase_admin.table("profiles").select("*").eq("id", user_id).execute()
        if not user_db_response.data:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        user_data = user_db_response.data[0]

        auth_user = supabase_admin.auth.admin.get_user_by_id(user_id)
        
        db_avatar = user_data.get("avatar_url")
        
        metadata_avatar = None
        if auth_user and auth_user.user:
            metadata_avatar = auth_user.user.user_metadata.get("avatar_url")

        final_avatar_url = db_avatar or metadata_avatar or None

        if final_avatar_url and not final_avatar_url.startswith("http"):
            final_avatar_url = supabase_admin.storage.from_("avatars").get_public_url(final_avatar_url)

        user_data["avatar_url"] = final_avatar_url

        borrow_response = supabase_admin.table("borrow_requests").select("*").eq("user_id", user_id).execute()
            
        return {
            "user": [user_data],
            "history": borrow_response.data or []
        }

    except HTTPException:
        raise 
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

