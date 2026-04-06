"""
Sliding window rate limiter — 100 requests/min per user.
Constitution: CLAUDE.md #7 (cost awareness), ARCHITECTURE.md #7
"""
import os
import time
from collections import defaultdict, deque
from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

RATE_LIMIT     = int(os.getenv("RATE_LIMIT_PER_MINUTE", "100"))
WINDOW_SECONDS = 60
_SKIP_PATHS    = {"/health", "/ready", "/docs", "/redoc", "/openapi.json"}


class RateLimiterMiddleware(BaseHTTPMiddleware):
    """Sliding window rate limiter keyed by token prefix or IP."""

    def __init__(self, app):
        super().__init__(app)
        self._requests: dict[str, deque] = defaultdict(deque)

    def _rate_key(self, request: Request) -> str:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            return f"token:{auth[7:20]}"
        # Respect reverse proxies in deployed environments
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            host = forwarded_for.split(",")[0].strip()
        else:
            host = request.client.host if request.client else "unknown"
        return f"ip:{host}"

    async def dispatch(self, request: Request, call_next):
        if request.url.path in _SKIP_PATHS:
            return await call_next(request)

        key  = self._rate_key(request)
        now  = time.time()
        wins = self._requests[key]

        while wins and wins[0] < now - WINDOW_SECONDS:
            wins.popleft()

        if not wins:
            # Clean up empty deque to avoid memory leak
            del self._requests[key]

        # Calculate remaining after cleanup (since it might be deleted)
        current_len = len(wins) if wins else 0
        remaining = RATE_LIMIT - current_len

        if remaining <= 0:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"data": None, "meta": {}, "error": {
                    "code":    "RATE_LIMIT_001",
                    "message": f"Rate limit exceeded. Max {RATE_LIMIT} requests per minute.",
                    "field":   None,
                }},
                headers={
                    "X-RateLimit-Limit":     str(RATE_LIMIT),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset":     str(int(wins[0] + WINDOW_SECONDS)),
                },
            )

        if key not in self._requests:
            # Recreate if it was deleted
            self._requests[key] = deque()
            
        self._requests[key].append(now)
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"]     = str(RATE_LIMIT)
        response.headers["X-RateLimit-Remaining"] = str(remaining - 1)
        return response
