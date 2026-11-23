from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from pydantic import BaseModel
from typing import Optional, List
from app.database import get_db
from app.models.user import User
from app.models.discovery import UserPreference, SearchHistory
from app.deps import get_current_user

router = APIRouter(prefix="/me", tags=["preferences"])

MAX_HISTORY = 50


class PrefsIn(BaseModel):
    favorite_categories: Optional[List[int]] = None
    favorite_cities: Optional[List[str]] = None
    followed_organizers: Optional[List[int]] = None


class SearchIn(BaseModel):
    query: str
    filters: Optional[dict] = None


@router.get("/preferences")
async def get_prefs(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    pref = (await db.execute(select(UserPreference).where(UserPreference.user_id == user.id))).scalar_one_or_none()
    if not pref:
        return {"favorite_categories": [], "favorite_cities": [], "followed_organizers": []}
    return {
        "favorite_categories": pref.favorite_categories or [],
        "favorite_cities": pref.favorite_cities or [],
        "followed_organizers": pref.followed_organizers or [],
    }


@router.put("/preferences")
async def set_prefs(data: PrefsIn, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    pref = (await db.execute(select(UserPreference).where(UserPreference.user_id == user.id))).scalar_one_or_none()
    if not pref:
        pref = UserPreference(user_id=user.id)
        db.add(pref)
    if data.favorite_categories is not None:
        pref.favorite_categories = data.favorite_categories
    if data.favorite_cities is not None:
        pref.favorite_cities = data.favorite_cities
    if data.followed_organizers is not None:
        pref.followed_organizers = data.followed_organizers
    await db.commit()
    return await get_prefs(user, db)


@router.post("/searches")
async def record_search(data: SearchIn, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    db.add(SearchHistory(user_id=user.id, query=data.query[:255], filters=data.filters))
    await db.flush()
    # Trim to MAX_HISTORY
    count = await db.scalar(select(func.count(SearchHistory.id)).where(SearchHistory.user_id == user.id))
    if count and count > MAX_HISTORY:
        old = (await db.execute(
            select(SearchHistory.id).where(SearchHistory.user_id == user.id).order_by(SearchHistory.created_at).limit(count - MAX_HISTORY)
        )).scalars().all()
        if old:
            await db.execute(delete(SearchHistory).where(SearchHistory.id.in_(old)))
    await db.commit()
    return {"status": "recorded"}


@router.get("/searches")
async def my_searches(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(SearchHistory).where(SearchHistory.user_id == user.id).order_by(SearchHistory.created_at.desc()).limit(20)
    )
    return [{"id": s.id, "query": s.query, "filters": s.filters, "created_at": s.created_at.isoformat() if s.created_at else None} for s in result.scalars()]


@router.delete("/searches")
async def clear_searches(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await db.execute(delete(SearchHistory).where(SearchHistory.user_id == user.id))
    await db.commit()
    return {"status": "cleared"}
