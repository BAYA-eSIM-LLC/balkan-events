from fastapi import APIRouter, Depends
from app.deps import require_role
from app.models.user import User, UserRole

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/me")
async def me(user: User = Depends(require_role(UserRole.ADMIN, UserRole.SUPERADMIN))):
    return {"id": user.id, "email": user.email, "role": user.role}
