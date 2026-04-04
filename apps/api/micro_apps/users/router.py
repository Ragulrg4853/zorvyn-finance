"""
Users router — HTTP contract only. All endpoints require users:manage.
Constitution: CLAUDE.md #26, API_CONSTITUTIONS.md #7

Copilot direction — implement in Session 4:
  GET    /            Query: role, is_active, page, page_size
  POST   /            Body: UserCreate -> 201 UserRead
  GET    /{user_id}   -> UserRead or 404
  PATCH  /{user_id}   Body: UserUpdate -> UserRead
  DELETE /{user_id}   Effect: is_active=False -> 204

Every endpoint: correlation_id = Depends(get_correlation_id)
Response shape: {"data":..., "meta":{"correlation_id":...}, "error": null}
"""
from fastapi import APIRouter
router = APIRouter()
# TODO(session-4): Implement all 5 endpoints per direction above.
