from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, events, admin, profile
from app.routers.locations import router as locations_router, categories_router, admin_router as locations_admin_router
from app.routers.events_engine import public as events_public, organizer as events_organizer, admin as events_admin, venues_public
from app.routers.search import router as search_router
from app.routers.admin_catalog import venues as admin_venues, performers as admin_performers, public_performers
from app.routers.organizer import router as organizer_router, admin_org as admin_org_router
from app.routers.admin_system import router as admin_system_router, public_support
from app.routers.admin_orders_tickets import router as admin_orders_tickets_router
from app.routers.admin_settings import router as admin_settings_router
from app.routers.cms import router as cms_router, public_router as cms_public_router
from app.routers.scanner import router as scanner_router
from app.routers.seat_maps import router as seat_maps_router, admin_router as admin_seat_maps_router
from app.routers.pos import router as pos_router, admin_router as admin_pos_router
from app.routers.analytics import router as analytics_router, admin_router as admin_analytics_router
from app.routers.tickets_pdf import router as tickets_pdf_router, guest_router, admin_router as admin_guest_router
from app.routers.orders import router as orders_router
from app.routers.payments import router as payments_router

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
app.include_router(admin_orders_tickets_router)
app.include_router(admin_settings_router)
app.include_router(public_support)
app.include_router(cms_router)
app.include_router(cms_public_router)
app.include_router(scanner_router)
app.include_router(seat_maps_router)
app.include_router(admin_seat_maps_router)
app.include_router(pos_router)
app.include_router(admin_pos_router)
app.include_router(analytics_router)
app.include_router(admin_analytics_router)
app.include_router(tickets_pdf_router)
app.include_router(guest_router)
app.include_router(admin_guest_router)
app.include_router(orders_router)
app.include_router(payments_router)
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
