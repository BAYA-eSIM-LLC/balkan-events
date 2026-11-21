from fastapi import APIRouter, Depends
from app.deps import get_current_user, require_role
from app.models.user import User, UserRole

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/me")
async def me(user: User = Depends(get_current_user)):
    return {"id": user.id, "email": user.email, "role": user.role}

@router.get("/users")
async def list_users(user: User = Depends(require_role(UserRole.ADMIN, UserRole.SUPERADMIN))):
    return {"message": "admin only", "role": user.role}
