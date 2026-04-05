from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session, joinedload
from shared.models.role import Role, RolePermission
from shared.models.permission import Permission

def list_roles(db: Session) -> List[Role]:
    return db.query(Role).options(joinedload(Role.permissions)).order_by(Role.name.asc()).all()

def get_role_by_id(db: Session, role_id: UUID) -> Optional[Role]:
    return db.query(Role).options(joinedload(Role.permissions)).filter(Role.id == role_id).first()

def list_permissions(db: Session) -> List[Permission]:
    return db.query(Permission).order_by(Permission.name.asc()).all()

def assign_permissions(db: Session, role_id: UUID, grant_ids: List[UUID], revoke_ids: List[UUID]) -> Role:
    if grant_ids:
        existing_grants = {
            rp.permission_id for rp in 
            db.query(RolePermission).filter(RolePermission.role_id == role_id, RolePermission.permission_id.in_(grant_ids)).all()
        }
        for g_id in set(grant_ids):
            if g_id not in existing_grants:
                db.add(RolePermission(role_id=role_id, permission_id=g_id))
                
    if revoke_ids:
        db.query(RolePermission).filter(
            RolePermission.role_id == role_id,
            RolePermission.permission_id.in_(revoke_ids)
        ).delete(synchronize_session=False)
            
    db.commit()
    return get_role_by_id(db, role_id)
