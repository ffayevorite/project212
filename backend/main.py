from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from routers import auth

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Project 212 API with Supabase",
    description="Backend API for Project 212 using Supabase as database",
    version="1.0.0"
)

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://yourapp.vercel.app",  # Production frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])

# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {
        "status": "OK",
        "message": "Server is running with Supabase",
        "database": "Supabase"
    }

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to Project 212 API with Supabase",
        "docs": "/docs",
        "health": "/api/health",
        "database": "Supabase"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)