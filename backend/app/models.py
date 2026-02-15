"""
Pydantic models for API request/response validation

This module contains all the data models used in the application:
- User models for registration, login, and responses
- Token models for JWT authentication
- Generic response models for API responses
"""

from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime


# ============================================================================
# User Models
# ============================================================================

class UserBase(BaseModel):
    """Base user model with common fields"""
    email: EmailStr = Field(..., description="User email address")
    name: str = Field(..., min_length=2, max_length=100, description="User full name")


class UserCreate(BaseModel):
    """User registration model
    
    Used when creating a new user account.
    """
    name: str = Field(..., min_length=2, max_length=100, description="Full name")
    email: EmailStr = Field(..., description="Email address")
    password: str = Field(..., min_length=8, max_length=100, description="Password (min 8 characters)")
    
    @validator('password')
    def validate_password(cls, v):
        """Validate password strength"""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "john@example.com",
                "password": "securePassword123"
            }
        }


class UserLogin(BaseModel):
    """User login model
    
    Used when authenticating a user.
    """
    email: EmailStr = Field(..., description="Email address")
    password: str = Field(..., description="Password")
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "john@example.com",
                "password": "securePassword123"
            }
        }


class UserResponse(BaseModel):
    """User response model
    
    Returned when fetching user information.
    Does NOT include password for security.
    """
    id: str = Field(..., description="User unique identifier (UUID)")
    email: str = Field(..., description="User email address")
    name: str = Field(..., description="User full name")
    created_at: Optional[datetime] = Field(None, description="Account creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")
    provider: str = Field(..., description="Login provider (email/google)")
    is_verified: bool = Field(..., description="Email verification status")
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
                "email": "john@example.com",
                "name": "John Doe",
                "created_at": "2024-01-15T10:30:00.000Z",
                "updated_at": "2024-01-15T10:30:00.000Z",
                "provider": "email",
                "is_verified": True
            }
        }


class UserUpdate(BaseModel):
    """User update model
    
    Used when updating user information.
    All fields are optional.
    """
    name: Optional[str] = Field(None, min_length=2, max_length=100, description="Full name")
    email: Optional[EmailStr] = Field(None, description="Email address")
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "Jane Doe",
                "email": "jane@example.com"
            }
        }


class UserInDB(UserBase):
    """User model as stored in database
    
    Internal model - not exposed via API.
    Includes hashed password.
    """
    id: str
    password: str  # This is the hashed password
    created_at: datetime
    updated_at: Optional[datetime] = None


# ============================================================================
# Token Models
# ============================================================================

class Token(BaseModel):
    """JWT Token response model
    
    Returned after successful login/registration.
    """
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type (always 'bearer')")
    
    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer"
            }
        }


class TokenData(BaseModel):
    """Token payload data
    
    Internal model for JWT token contents.
    """
    user_id: Optional[str] = Field(None, description="User ID from token")
    exp: Optional[datetime] = Field(None, description="Token expiration time")


# ============================================================================
# Authentication Response Models
# ============================================================================

class AuthResponse(BaseModel):
    """Authentication response model
    
    Returned after successful login/registration.
    Includes token and user info.
    """
    success: bool = Field(default=True, description="Operation success status")
    token: str = Field(..., description="JWT access token")
    user: UserResponse = Field(..., description="User information")
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "user": {
                    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
                    "email": "john@example.com",
                    "name": "John Doe",
                    "created_at": "2024-01-15T10:30:00.000Z"
                }
            }
        }


# ============================================================================
# Generic Response Models
# ============================================================================

class MessageResponse(BaseModel):
    """Generic message response
    
    Used for simple success/error messages.
    """
    success: bool = Field(..., description="Operation success status")
    message: str = Field(..., description="Response message")
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "Operation completed successfully"
            }
        }


class ErrorResponse(BaseModel):
    """Error response model
    
    Used for error responses.
    """
    success: bool = Field(default=False, description="Always False for errors")
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Detailed error information")
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": False,
                "error": "Invalid credentials",
                "detail": "Email or password is incorrect"
            }
        }


class UsersListResponse(BaseModel):
    """Users list response model
    
    Returned when fetching multiple users.
    """
    success: bool = Field(default=True, description="Operation success status")
    users: List[UserResponse] = Field(..., description="List of users")
    total: Optional[int] = Field(None, description="Total number of users")
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "users": [
                    {
                        "id": "uuid-1",
                        "email": "user1@example.com",
                        "name": "User One",
                        "created_at": "2024-01-15T10:30:00.000Z"
                    },
                    {
                        "id": "uuid-2",
                        "email": "user2@example.com",
                        "name": "User Two",
                        "created_at": "2024-01-15T11:00:00.000Z"
                    }
                ],
                "total": 2
            }
        }


# ============================================================================
# Password Reset Models (for future use)
# ============================================================================

class PasswordResetRequest(BaseModel):
    """Password reset request model"""
    email: EmailStr = Field(..., description="Email address to send reset link")
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "john@example.com"
            }
        }


class PasswordResetConfirm(BaseModel):
    """Password reset confirmation model"""
    token: str = Field(..., description="Password reset token")
    new_password: str = Field(..., min_length=8, description="New password")
    
    class Config:
        json_schema_extra = {
            "example": {
                "token": "reset-token-here",
                "new_password": "newSecurePassword123"
            }
        }


class PasswordChange(BaseModel):
    """Password change model (for logged-in users)"""
    old_password: str = Field(..., description="Current password")
    new_password: str = Field(..., min_length=8, description="New password")
    
    @validator('new_password')
    def validate_new_password(cls, v, values):
        """Ensure new password is different from old"""
        if 'old_password' in values and v == values['old_password']:
            raise ValueError('New password must be different from old password')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "old_password": "oldPassword123",
                "new_password": "newSecurePassword456"
            }
        }

from pydantic import BaseModel, EmailStr

class SendOtpRequest(BaseModel):
    email: EmailStr

class VerifyOtpRequest(BaseModel):
    email: EmailStr
    code: str
