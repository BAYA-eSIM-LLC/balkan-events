from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, events, admin, profile
from app.routers.locations import router as locations_router, categories_router, admin_router as locations_admin_router
from app.routers.events_engine import public as events_public, organizer as events_organizer, admin as events_admin, venues_public
from app.routers.search import router as search_router
from app.routers.admin_catalog import venues as admin_venues, performers as admin_performers, public_performers
from app.routers.organizer import router as organizer_router, admin_org as admin_org_router
from app.routers.admin_system import router as admin_system_router

app = FastAPI(title="Balkan Events API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(search_router)
app.include_router(events_public)
app.include_router(events_organizer)
app.include_router(events_admin)
app.include_router(venues_public)
app.include_router(admin_venues)
app.include_router(admin_performers)
app.include_router(public_performers)
app.include_router(organizer_router)
app.include_router(admin_org_router)
app.include_router(events.router)
app.include_router(admin.router)
app.include_router(admin_system_router)
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
