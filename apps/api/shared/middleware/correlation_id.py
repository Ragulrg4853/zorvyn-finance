"""
Correlation ID middleware.
Constitution: CLAUDE.md #22 (distributed tracing), API_CONSTITUTIONS.md #19
Injects X-Correlation-ID on every request for end-to-end tracing.
"""
import time
import uuid
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from shared.utils.logger import get_logger

logger = get_logger(__name__)

class CorrelationIdMiddleware(BaseHTTPMiddleware):
    """Assigns a unique correlation ID to every request."""

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
        request.state.correlation_id = correlation_id
        
        # We don't log the user_id here directly yet because it requires auth decoding
        # but we log the basic incoming request info.
        try:
            response = await call_next(request)
            duration_ms = round((time.time() - start_time) * 1000, 2)
            
            logger.info(
                f"HTTP {request.method} {request.url.path} {response.status_code} - {duration_ms}ms",
                extra={
                    "action": "http_request",
                    "method": request.method,
                    "path": request.url.path,
                    "status_code": response.status_code,
                    "duration_ms": duration_ms,
                    "correlation_id": correlation_id
                }
            )
            
            response.headers["X-Correlation-ID"] = correlation_id
            return response
        except Exception as exc:
            duration_ms = round((time.time() - start_time) * 1000, 2)
            logger.error(
                f"HTTP {request.method} {request.url.path} 500 - {duration_ms}ms",
                extra={
                    "action": "http_request_error",
                    "method": request.method,
                    "path": request.url.path,
                    "status_code": 500,
                    "duration_ms": duration_ms,
                    "correlation_id": correlation_id
                }
            )
            raise exc


def get_correlation_id(request: Request) -> str:
    """FastAPI dependency: extracts correlation ID from request state."""
    return getattr(request.state, "correlation_id", str(uuid.uuid4()))
