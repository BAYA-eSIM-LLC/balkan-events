from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, events, admin, profile
from app.routers.locations import router as locations_router, categories_router, admin_router as locations_admin_router

app = FastAPI(title="Balkan Events API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(events.router)
app.include_router(admin.router)
app.include_router(profile.router)
app.include_router(locations_router)
app.include_router(categories_router)
app.include_router(locations_admin_router)

@app.get("/")
def root():
    return {"status": "ok", "message": "Balkan Events API"}

@app.get("/health")
def health():
    return {"status": "healthy"}
