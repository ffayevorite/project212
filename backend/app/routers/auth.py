# app/routers/auth.py
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import RedirectResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from gotrue.errors import AuthApiError # ต้องใช้จับ Error ของ Supabase

from app.database import get_supabase
from app.models import UserCreate, UserLogin, UserResponse, SendOtpRequest, VerifyOtpRequest

from datetime import datetime, timedelta
import random

from app.utils.email import send_otp_email

router = APIRouter()
security = HTTPBearer()

# Helper to verify token with Supabase
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    supabase = get_supabase()
    token = credentials.credentials
    
    try:
        # ส่ง Token ไปให้ Supabase ตรวจสอบว่าถูกต้องและยังไม่หมดอายุ
        user = supabase.auth.get_user(token)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user.user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# ==========================================
# Auth Routes (Native Supabase)
# ==========================================

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """Register using Supabase Auth"""
    supabase = get_supabase()
    
    try:
        # ส่งข้อมูลไปสร้าง User ใน Supabase Auth
        # เราเก็บ 'name' ไว้ใน user_metadata
        auth_response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": {
                    "full_name": user_data.name
                }
            }
        })

        # กรณีที่ Supabase ตั้งค่าให้ต้องยืนยัน Email (Default)
        # session จะเป็น None จนกว่า user จะกดลิงก์ในเมล
        if auth_response.user and not auth_response.session:
            return {
                "success": True,
                "message": "Registration successful. Please check your email to confirm your account.",
                "user": {
                    "id": auth_response.user.id,
                    "email": auth_response.user.email,
                    "name": auth_response.user.user_metadata.get("full_name")
                }
            }

        # กรณีไม่ต้องยืนยันเมล (Auto Confirm)
        return {
            "success": True,
            "token": auth_response.session.access_token,
            "user": {
                "id": auth_response.user.id,
                "email": auth_response.user.email,
                "name": auth_response.user.user_metadata.get("full_name")
            }
        }

    except AuthApiError as e:
        raise HTTPException(status_code=400, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/login")
async def login(credentials: UserLogin):
    """Login using Supabase Auth"""
    supabase = get_supabase()
    
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })

        return {
            "success": True,
            "token": auth_response.session.access_token,
            "user": {
                "id": auth_response.user.id,
                "email": auth_response.user.email,
                "name": auth_response.user.user_metadata.get("full_name")
            }
        }

    except AuthApiError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/logout")
async def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Logout from Supabase"""
    supabase = get_supabase()
    token = credentials.credentials
    
    try:
        supabase.auth.sign_out(token)
        return {"success": True, "message": "Logged out successfully"}
    except Exception as e:
        return {"success": False, "message": str(e)}


@router.get("/me")
async def get_my_profile(user = Depends(get_current_user)):
    """Get current user profile from Supabase Token"""
    return {
        "id": user.id,
        "email": user.email,
        "name": user.user_metadata.get("full_name"),
        "created_at": user.created_at,
        "last_sign_in": user.last_sign_in_at,
        "provider": user.app_metadata.get("provider", "email"),
        "is_verified": user.email_confirmed_at is not None
    }
    

# ==========================================
# Google OAuth (via Supabase)
# ==========================================

@router.get("/google/url")
async def get_google_auth_url():
    """Get Google Login URL from Supabase"""
    supabase = get_supabase()
    
    # Supabase จัดการเรื่อง URL และ State ให้
    # redirect_to คือหน้าที่ Frontend จะรับหลังจาก Login สำเร็จ
    res = supabase.auth.sign_in_with_oauth({
        "provider": "google",
        "options": {
            "redirect_to": "http://localhost:3000/auth/callback" 
        }
    })
    
    if res.url:
        return RedirectResponse(url=res.url)
    
    raise HTTPException(status_code=500, detail="Could not generate OAuth URL")

# หมายเหตุ: สำหรับ Supabase Auth ปกติแล้ว OAuth Callback 
# จะเด้งกลับไปที่ Frontend (localhost:3000) โดยตรง พร้อม Hash (#access_token=...)
# ดังนั้น Backend ไม่จำเป็นต้องมี route /callback ยกเว้นจะทำ PKCE Flow ขั้นสูง



@router.post("/send-otp")
async def send_otp(
    data: SendOtpRequest,
    current_user = Depends(get_current_user)
):
    if not data.email.endswith("@cmu.ac.th"):
        raise HTTPException(status_code=400, detail="Invalid CMU email")

    supabase = get_supabase()

    # สร้าง OTP 6 หลัก
    otp_code = str(random.randint(100000, 999999))

    expires_at = datetime.utcnow() + timedelta(minutes=5)

    # บันทึก OTP ลง DB
    supabase.table("email_otps").insert({
        "user_id": current_user.id,
        "email": data.email,
        "otp_code": otp_code,
        "expires_at": expires_at.isoformat()
    }).execute()

    # ส่งเมล
    try:
        send_otp_email(data.email, otp_code)
    except Exception as e:
        print("EMAIL ERROR:", str(e))
        raise HTTPException(status_code=500, detail="Failed to send email")

    return {"success": True, "message": "OTP sent"}




import os
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from supabase import create_client, Client
# อย่าลืม import pydantic models และ dependency อื่นๆ ด้วยนะครับ

# 1. Setup Admin Client (ไว้นอกฟังก์ชัน หรือไฟล์ config แยก)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") # ย้ำ: ต้องใช้ Service Role Key

# สร้าง Client สำหรับ Admin โดยเฉพาะ
supabase_admin: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

@router.post("/verify-otp")
async def verify_otp(
    data: VerifyOtpRequest,
    current_user = Depends(get_current_user)
):
    # ใช้ client ปกติ (ของ user) เพื่อดึงข้อมูล OTP (User อ่าน OTP ตัวเองได้อยู่แล้ว)
    supabase = get_supabase()

    # --- ส่วนที่หายไปคือตรงนี้ครับ (การค้นหา OTP) ---
    result = supabase.table("email_otps") \
        .select("*") \
        .eq("user_id", current_user.id) \
        .eq("email", data.email) \
        .eq("otp_code", data.code) \
        .eq("is_used", False) \
        .execute()

    # ถ้าไม่เจอข้อมูล หรือ OTP ถูกใช้ไปแล้ว
    if not result.data:
        raise HTTPException(status_code=400, detail="Invalid OTP or already used")

    # ประกาศตัวแปร otp_record ตรงนี้
    otp_record = result.data[0]
    # ---------------------------------------------

    # ตรวจสอบวันหมดอายุ
    # หมายเหตุ: แปลง string ISO เป็น datetime object
    expires_at = datetime.fromisoformat(otp_record["expires_at"].replace('Z', '+00:00'))
    if expires_at < datetime.utcnow().replace(tzinfo=expires_at.tzinfo):
        raise HTTPException(status_code=400, detail="OTP expired")

    # 2. Mark OTP as used (ใช้ client ปกติ update OTP ตัวเองได้)
    supabase.table("email_otps") \
        .update({"is_used": True}) \
        .eq("id", otp_record["id"]) \
        .execute()

    # 3. Update Profile Status
    # *** ไฮไลท์: ใช้ supabase_admin เพื่อข้าม RLS Policy ***
    try:
        update_response = supabase_admin.table("profiles") \
            .update({"cmu_verified": True,"cmu_mail": data.email}) \
            .eq("id", current_user.id) \
            .execute()
            
        # เช็คสักหน่อยว่า update เจอไหม
        if not update_response.data:
             print("Warning: Profile update returned no data. Check if User ID matches.")

    except Exception as e:
        print(f"Error updating profile with admin client: {e}")
        raise HTTPException(status_code=500, detail="Failed to update verification status")

    return {"success": True, "message": "Email verified successfully"}

