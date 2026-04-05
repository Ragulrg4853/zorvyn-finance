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
    for g_id in grant_ids:
        exists = db.query(RolePermission).filter_by(role_id=role_id, permission_id=g_id).first()
        if not exists:
            rp = RolePermission(role_id=role_id, permission_id=g_id)
            db.add(rp)
            
    for r_id in revoke_ids:
        exists = db.query(RolePermission).filter_by(role_id=role_id, permission_id=r_id).first()
        if exists:
            db.delete(exists)
            
    db.commit()
    return get_role_by_id(db, role_id)
