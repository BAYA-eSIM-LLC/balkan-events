from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.database import get_db
from app.models.event import Event

router = APIRouter(prefix="/events", tags=["events"])

class EventResponse(BaseModel):
    id: int
    title: str
    slug: str
    city: Optional[str]
    start_at: datetime
    image_url: Optional[str]
    class Config:
        from_attributes = True

@router.get("/", response_model=List[EventResponse])
async def list_events(city: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    query = select(Event).where(Event.is_published == True)
    if city:
        query = query.where(Event.city == city)
    result = await db.execute(query.order_by(Event.start_at))
    return result.scalars().all()

@router.get("/{slug}", response_model=EventResponse)
async def get_event(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Event).where(Event.slug == slug))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event
