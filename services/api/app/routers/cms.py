from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid, os, aiofiles
from app.database import get_db
from app.models.cms import HeroSlide, HomepageSection, MediaAsset
from app.models.user import User, ADMIN_ROLES
from app.deps import get_current_user
from app.routers.admin_system import log_audit

router = APIRouter(prefix="/admin/cms", tags=["cms"])
public_router = APIRouter(prefix="/public", tags=["public-cms"])

UPLOAD_DIR = "/tmp/balkan-media"
os.makedirs(UPLOAD_DIR, exist_ok=True)
ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"}
MAX_SIZE = 50 * 1024 * 1024  # 50 MB

class HeroSlideIn(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    image_url: str
    mobile_image_url: Optional[str] = None
    video_url: Optional[str] = None
    poster_url: Optional[str] = None
    category: Optional[str] = None
    sort_order: int = 0
    duration_seconds: int = 6
    is_active: bool = True
    is_published: bool = False
    publish_at: Optional[datetime] = None

class HeroSlideOut(HeroSlideIn):
    id: int
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class SectionIn(BaseModel):
    key: str
    title: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    category: Optional[str] = None
    content: Optional[dict] = None
    platforms: str = "web,ios,android"
    is_active: bool = True
    is_published: bool = False
    publish_at: Optional[datetime] = None
    sort_order: int = 0

class SectionOut(SectionIn):
    id: int
    updated_at: datetime
    class Config:
        from_attributes = True

class MediaOut(BaseModel):
    id: int
    filename: str
    original_name: Optional[str]
    mime_type: Optional[str]
    size_bytes: Optional[int]
    url: str
    category: Optional[str]
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

def require_cms_admin(user: User = Depends(get_current_user)):
    if user.role not in ADMIN_ROLES:
        raise HTTPException(403, "Insufficient permissions for CMS")
    return user

# --- Media Library ---
@router.post("/media/upload", response_model=MediaOut)
async def upload_media(
    file: UploadFile = File(...),
    category: Optional[str] = Form(None),
    user: User = Depends(require_cms_admin),
    db: AsyncSession = Depends(get_db)
):
    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(400, "Unsupported file type")
    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(400, "File too large (max 50 MB)")
    ext = os.path.splitext(file.filename or "")[1] or ".bin"
    fname = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(UPLOAD_DIR, fname)
    async with aiofiles.open(path, "wb") as f:
        await f.write(content)
    url = f"/media/{fname}"
    asset = MediaAsset(
        filename=fname,
        original_name=file.filename,
        mime_type=file.content_type,
        size_bytes=len(content),
        url=url,
        category=category,
        uploaded_by=user.id,
    )
    db.add(asset)
    await db.commit()
    await db.refresh(asset)
    await log_audit(db, user.id, "cms.media.upload", "MediaAsset", asset.id, {"filename": fname})
    return asset

@router.get("/media", response_model=List[MediaOut])
async def list_media(user: User = Depends(require_cms_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MediaAsset).where(MediaAsset.is_active == True).order_by(MediaAsset.created_at.desc()))
    return result.scalars().all()

@router.delete("/media/{asset_id}")
async def delete_media(asset_id: int, user: User = Depends(require_cms_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MediaAsset).where(MediaAsset.id == asset_id))
    asset = result.scalar_one_or_none()
    if not asset:
        raise HTTPException(404)
    asset.is_active = False
    await db.commit()
    await log_audit(db, user.id, "cms.media.delete", "MediaAsset", asset_id)
    return {"ok": True}

# --- Hero CRUD ---
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
    await log_audit(db, user.id, "cms.hero.create", "HeroSlide", slide.id)
    return slide

@router.patch("/hero/{slide_id}", response_model=HeroSlideOut)
async def update_hero(slide_id: int, data: HeroSlideIn, user: User = Depends(require_cms_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(HeroSlide).where(HeroSlide.id == slide_id))
    slide = result.scalar_one_or_none()
    if not slide:
        raise HTTPException(404)
    for k, v in data.dict().items():
        setattr(slide, k, v)
    slide.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(slide)
    await log_audit(db, user.id, "cms.hero.update", "HeroSlide", slide.id)
    return slide

@router.post("/hero/{slide_id}/publish")
async def publish_hero(slide_id: int, user: User = Depends(require_cms_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(HeroSlide).where(HeroSlide.id == slide_id))
    slide = result.scalar_one_or_none()
    if not slide:
        raise HTTPException(404)
    slide.is_published = True
    slide.is_active = True
    slide.publish_at = None  # clear schedule on manual publish
    await db.commit()
    await log_audit(db, user.id, "cms.hero.publish", "HeroSlide", slide_id)
    return {"id": slide_id, "is_published": True}

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

# --- Sections ---
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

@router.post("/sections/{sec_id}/publish")
async def publish_section(sec_id: int, user: User = Depends(require_cms_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(HomepageSection).where(HomepageSection.id == sec_id))
    sec = result.scalar_one_or_none()
    if not sec:
        raise HTTPException(404)
    sec.is_published = True
    sec.is_active = True
    sec.publish_at = None  # clear schedule on manual publish
    await db.commit()
    await log_audit(db, user.id, "cms.section.publish", "HomepageSection", sec_id)
    return {"id": sec_id, "is_published": True}

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

# --- Preview (admin only, includes unpublished) ---
@router.get("/preview")
async def cms_preview(user: User = Depends(require_cms_admin), db: AsyncSession = Depends(get_db)):
    slides = await db.execute(select(HeroSlide).order_by(HeroSlide.sort_order))
    sections = await db.execute(select(HomepageSection).order_by(HomepageSection.sort_order))
    return {
        "hero": [HeroSlideOut.from_orm(s) for s in slides.scalars()],
        "sections": [SectionOut.from_orm(s) for s in sections.scalars()],
        "note": "Preview includes unpublished content"
    }

# --- Public (only published + active) ---

@router.post("/internal/publish-scheduled")
async def publish_scheduled(x_internal_job: Optional[str] = Header(None), db: AsyncSession = Depends(get_db)):
    """Publish hero slides and sections whose publish_at is due. Scheduler only."""
    import os
    secret = os.getenv("INTERNAL_API_SECRET", "")
    if not secret or x_internal_job != secret:
        raise HTTPException(403, "Internal job only")
    now = datetime.utcnow()
    slides = (await db.execute(
        select(HeroSlide).where(HeroSlide.is_published == False, HeroSlide.publish_at != None, HeroSlide.publish_at <= now)
    )).scalars().all()
    sections = (await db.execute(
        select(HomepageSection).where(HomepageSection.is_published == False, HomepageSection.publish_at != None, HomepageSection.publish_at <= now)
    )).scalars().all()
    for s in slides:
        s.is_published = True
        s.is_active = True
        await log_audit(db, None, "cms.hero.scheduled_publish", "HeroSlide", s.id, {"publish_at": s.publish_at.isoformat()})
    for sec in sections:
        sec.is_published = True
        sec.is_active = True
        await log_audit(db, None, "cms.section.scheduled_publish", "HomepageSection", sec.id, {"publish_at": sec.publish_at.isoformat()})
    await db.commit()
    return {"hero": len(slides), "sections": len(sections)}


@public_router.get("/homepage")
async def public_homepage(db: AsyncSession = Depends(get_db)):
    slides = await db.execute(
        select(HeroSlide).where(HeroSlide.is_active == True, HeroSlide.is_published == True).order_by(HeroSlide.sort_order)
    )
    sections = await db.execute(
        select(HomepageSection).where(HomepageSection.is_active == True, HomepageSection.is_published == True).order_by(HomepageSection.sort_order)
    )
    return {
        "hero": [HeroSlideOut.from_orm(s) for s in slides.scalars()],
        "sections": [SectionOut.from_orm(s) for s in sections.scalars()],
    }

@router.post("/hero/reorder")
async def reorder_hero(ids: List[int], user: User = Depends(require_cms_admin), db: AsyncSession = Depends(get_db)):
    for i, sid in enumerate(ids):
        await db.execute(update(HeroSlide).where(HeroSlide.id == sid).values(sort_order=i))
    await db.commit()
    await log_audit(db, user.id, "cms.hero.reorder", "HeroSlide", None, {"order": ids})
    return {"ok": True}

@router.post("/sections/reorder")
async def reorder_sections(ids: List[int], user: User = Depends(require_cms_admin), db: AsyncSession = Depends(get_db)):
    for i, sid in enumerate(ids):
        await db.execute(update(HomepageSection).where(HomepageSection.id == sid).values(sort_order=i))
    await db.commit()
    await log_audit(db, user.id, "cms.section.reorder", "HomepageSection", None, {"order": ids})
    return {"ok": True}
