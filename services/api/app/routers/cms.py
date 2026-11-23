from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.database import get_db
from app.models.cms import HeroSlide, HomepageSection
from app.models.user import User, UserRole, ADMIN_ROLES
from app.deps import get_current_user
from app.routers.admin_system import log_audit

router = APIRouter(prefix="/admin/cms", tags=["cms"])
public_router = APIRouter(prefix="/public", tags=["public-cms"])

class HeroSlideIn(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    image_url: str
    mobile_image_url: Optional[str] = None
    video_url: Optional[str] = None
    category: Optional[str] = None
    sort_order: int = 0
    duration_seconds: int = 6
    is_active: bool = True

class HeroSlideOut(HeroSlideIn):
    id: int
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class SectionIn(BaseModel):
    key: str
    title: Optional[str] = None
    content: Optional[dict] = None
    is_active: bool = True
    sort_order: int = 0

class SectionOut(SectionIn):
    id: int
    updated_at: datetime
    class Config:
        from_attributes = True

def require_cms_admin(user: User = Depends(get_current_user)):
    if user.role not in ADMIN_ROLES:
        raise HTTPException(403, "Insufficient permissions for CMS")
    return user

# --- Hero Slides CRUD ---
@router.get("/hero", response_model=List[HeroSlideOut])
async def list_hero(user: User = Depends(require_cms_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(HeroSlide).order_by(HeroSlide.sort_order))
    return result.scalars().all()

@router.post("/hero", response_model=HeroSlideOut)
async def create_hero(data: HeroSlideIn, user: User = Depends(require_cms_admin), db: AsyncSession = Depends(get_db)):
    slide = HeroSlide(**data.dict())
    db.add(slide)
    await db.commit()
    await db.refresh(slide)
    await log_audit(db, user.id, "cms.hero.create", "HeroSlide", slide.id, {"title": slide.title})
    return slide

@router.patch("/hero/{slide_id}", response_model=HeroSlideOut)
async def update_hero(slide_id: int, data: HeroSlideIn, user: User = Depends(require_cms_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(HeroSlide).where(HeroSlide.id == slide_id))
    slide = result.scalar_one_or_none()
    if not slide:
        raise HTTPException(404, "Slide not found")
    for k, v in data.dict().items():
        setattr(slide, k, v)
    slide.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(slide)
    await log_audit(db, user.id, "cms.hero.update", "HeroSlide", slide.id)
    return slide

@router.delete("/hero/{slide_id}")
async def delete_hero(slide_id: int, user: User = Depends(require_cms_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(HeroSlide).where(HeroSlide.id == slide_id))
    slide = result.scalar_one_or_none()
    if not slide:
        raise HTTPException(404)
    await db.delete(slide)
    await db.commit()
    await log_audit(db, user.id, "cms.hero.delete", "HeroSlide", slide_id)
    return {"ok": True}

@router.post("/hero/{slide_id}/toggle")
async def toggle_hero(slide_id: int, user: User = Depends(require_cms_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(HeroSlide).where(HeroSlide.id == slide_id))
    slide = result.scalar_one_or_none()
    if not slide:
        raise HTTPException(404)
    slide.is_active = not slide.is_active
    await db.commit()
    await log_audit(db, user.id, "cms.hero.toggle", "HeroSlide", slide_id, {"active": slide.is_active})
    return {"id": slide_id, "is_active": slide.is_active}

# --- Homepage Sections ---
@router.get("/sections", response_model=List[SectionOut])
async def list_sections(user: User = Depends(require_cms_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(HomepageSection).order_by(HomepageSection.sort_order))
    return result.scalars().all()

@router.post("/sections", response_model=SectionOut)
async def create_section(data: SectionIn, user: User = Depends(require_cms_admin), db: AsyncSession = Depends(get_db)):
    sec = HomepageSection(**data.dict())
    db.add(sec)
    await db.commit()
    await db.refresh(sec)
    await log_audit(db, user.id, "cms.section.create", "HomepageSection", sec.id)
    return sec

@router.patch("/sections/{sec_id}", response_model=SectionOut)
async def update_section(sec_id: int, data: SectionIn, user: User = Depends(require_cms_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(HomepageSection).where(HomepageSection.id == sec_id))
    sec = result.scalar_one_or_none()
    if not sec:
        raise HTTPException(404)
    for k, v in data.dict().items():
        setattr(sec, k, v)
    sec.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(sec)
    await log_audit(db, user.id, "cms.section.update", "HomepageSection", sec.id)
    return sec

@router.delete("/sections/{sec_id}")
async def delete_section(sec_id: int, user: User = Depends(require_cms_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(HomepageSection).where(HomepageSection.id == sec_id))
    sec = result.scalar_one_or_none()
    if not sec:
        raise HTTPException(404)
    await db.delete(sec)
    await db.commit()
    await log_audit(db, user.id, "cms.section.delete", "HomepageSection", sec_id)
    return {"ok": True}

# --- Public (for web + future mobile) ---
@public_router.get("/homepage")
async def public_homepage(db: AsyncSession = Depends(get_db)):
    slides = await db.execute(select(HeroSlide).where(HeroSlide.is_active == True).order_by(HeroSlide.sort_order))
    sections = await db.execute(select(HomepageSection).where(HomepageSection.is_active == True).order_by(HomepageSection.sort_order))
    return {
        "hero": [HeroSlideOut.from_orm(s) for s in slides.scalars()],
        "sections": [SectionOut.from_orm(s) for s in sections.scalars()],
    }
