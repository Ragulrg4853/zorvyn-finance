"""
Auth router — HTTP contract only.

Response shape: {"data":..., "meta":{"correlation_id":...}, "error": null} on ALL routes.
"""
from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from shared.database import get_db
from shared.middleware.rbac import get_current_user, block_token, oauth2_scheme, get_cached_permissions
from shared.middleware.correlation_id import get_correlation_id
from shared.models.user import User
from micro_apps.auth import service as auth_service
from micro_apps.auth.schemas import RegisterRequest, UserReadPublic

router = APIRouter()


@router.post("/register", status_code=status.HTTP_201_CREATED,
             summary="Register new account — viewer role by default")
def register(
    payload: RegisterRequest,
    db: Session = Depends(get_db),
    correlation_id: str = Depends(get_correlation_id),
):
    """Creates account, returns JWT. Default role: viewer."""
    user, token = auth_service.register_user(
        db=db, username=payload.username,
        email=payload.email, password=payload.password,
    )
    return {
        "data":  {"user": UserReadPublic.model_validate(user).model_dump(),
                  "access_token": token, "token_type": "bearer"},
        "meta":  {"correlation_id": correlation_id},
        "error": None,
    }


from shared.middleware.audit_logger import log_audit_event

@router.post("/login", summary="Login and receive JWT")
def login(
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
    correlation_id: str = Depends(get_correlation_id),
):
    """Validates credentials, returns access token."""
    user, token = auth_service.authenticate_user(
        db=db, username=form.username, password=form.password,
    )
    
    log_audit_event(
        db=db,
        user_id=user.id,
        action="auth.login",
        resource_type="auth",
        resource_id=str(user.id),
        correlation_id=correlation_id,
    )
    
    return {
        "data":  {"access_token": token, "token_type": "bearer"},
        "meta":  {"correlation_id": correlation_id},
        "error": None,
    }


@router.get("/me", summary="Get current user profile")
def get_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    correlation_id: str = Depends(get_correlation_id),
):
    """Returns authenticated user profile."""
    role_name = current_user.role.value if hasattr(current_user.role, "value") else current_user.role
    perms = get_cached_permissions(str(current_user.id), role_name, db)
    user_data = UserReadPublic.model_validate(current_user).model_dump()
    user_data["permissions"] = list(perms)
    return {
        "data":  user_data,
        "meta":  {"correlation_id": correlation_id},
        "error": None,
    }


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT,
             summary="Logout — add token to blocklist")
def logout(
    token: str = Depends(oauth2_scheme),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    correlation_id: str = Depends(get_correlation_id),
):
    """Client discards token. Blocklist prevents replay."""
    block_token(token)
    log_audit_event(
        db=db,
        user_id=current_user.id,
        action="auth.logout",
        resource_type="auth",
        resource_id=str(current_user.id),
        correlation_id=correlation_id,
    )
    return None
