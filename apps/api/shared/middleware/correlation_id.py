"""
Correlation ID middleware.
Constitution: CLAUDE.md #22 (distributed tracing), API_CONSTITUTIONS.md #19
Injects X-Correlation-ID on every request for end-to-end tracing.
"""
import uuid
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware


class CorrelationIdMiddleware(BaseHTTPMiddleware):
    """Assigns a unique correlation ID to every request."""

    async def dispatch(self, request: Request, call_next):
        correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
        request.state.correlation_id = correlation_id
        response = await call_next(request)
        response.headers["X-Correlation-ID"] = correlation_id
        return response


def get_correlation_id(request: Request) -> str:
    """FastAPI dependency: extracts correlation ID from request state."""
    return getattr(request.state, "correlation_id", str(uuid.uuid4()))
