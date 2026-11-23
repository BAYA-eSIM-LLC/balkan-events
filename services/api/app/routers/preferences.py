from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional, List
from app.database import get_db
from app.models.user import User
from app.deps import get_current_user

router = APIRouter(prefix="/me/preferences", tags=["preferences"])

# In-memory per process for this phase; persisted preference table can follow.
_prefs = {}


class PrefsIn(BaseModel):
    favorite_categories: Optional[List[int]] = None
    favorite_cities: Optional[List[str]] = None
    followed_organizers: Optional[List[int]] = None


@router.get("")
async def get_prefs(user: User = Depends(get_current_user)):
    return _prefs.get(user.id, {"favorite_categories": [], "favorite_cities": [], "followed_organizers": []})


@router.put("")
async def set_prefs(data: PrefsIn, user: User = Depends(get_current_user)):
    current = _prefs.get(user.id, {})
    current.update({k: v for k, v in data.model_dump().items() if v is not None})
    _prefs[user.id] = current
    return current
