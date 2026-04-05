"""
Zorvyn Finance API — Application Entry Point
Architecture: Application -> Micro Apps -> Services -> Microservices
Constitution: CLAUDE.md #10 (linear flow), #5 (observability-first)

Startup order:
  1. Create DB tables  2. Register middleware  3. Mount routers  4. Expose health probes
"""
import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from shared.database import engine, Base
from shared.middleware.correlation_id import CorrelationIdMiddleware
from shared.middleware.rate_limiter import RateLimiterMiddleware
from shared.utils.logger import get_logger

from micro_apps.auth.router import router as auth_router
from micro_apps.users.router import router as users_router
from micro_apps.roles.router import router as roles_router
from micro_apps.transactions.router import router as transactions_router
from micro_apps.dashboard.router import router as dashboard_router
from micro_apps.audit.router import router as audit_router

logger = get_logger(__name__)
API_PREFIX = "/v1"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown hooks."""
    logger.info("Zorvyn Finance API starting up...", extra={"action": "startup", "status": "starting"})
    
    if os.getenv("ENVIRONMENT") != "production":
        # In dev, auto-create tables. In prod, rely on migrations.
        Base.metadata.create_all(bind=engine)
        logger.info("Auto-migrated database for non-production environment.", extra={"action": "startup"})
    
    logger.info("Zorvyn Finance API ready.", extra={"action": "startup", "status": "ok", "db": "connected"})
    yield
    logger.info("Zorvyn Finance API shutting down.", extra={"action": "shutdown", "status": "shutdown_complete"})


app = FastAPI(
    title="Zorvyn Finance API",
    description=(
        "Finance Data Processing and Access Control Platform.\n\n"
        "**Roles:** viewer (read-only) | analyst (read + export + insights) | admin (full)\n\n"
        "**Auth:** POST /v1/auth/login -> Bearer token -> Authorization header on all requests"
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# Middleware — outer runs first on request, last on response
app.add_middleware(CorrelationIdMiddleware)
app.add_middleware(RateLimiterMiddleware)

frontend_origins = [
    "https://zorvyn-finance.vercel.app",
    "https://zorvyn-finance-seven.vercel.app",
]

if os.getenv("ENVIRONMENT") != "production":
    frontend_origins.append("http://localhost:3000")

if os.getenv("FRONTEND_URL"):
    frontend_origins.append(os.getenv("FRONTEND_URL").rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Correlation-ID"],
)

from fastapi.exceptions import RequestValidationError
from fastapi import Request
from shared.utils.error_taxonomy import AppError, ErrorCode

@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "data": None,
            "meta": {"correlation_id": getattr(request.state, "correlation_id", "unknown")},
            "error": exc.detail
        },
    )

@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "data": None,
            "meta": {"correlation_id": getattr(request.state, "correlation_id", "unknown")},
            "error": {
                "code": ErrorCode.VALIDATION_001.value,
                "message": "Input validation failed",
                "details": exc.errors()
            }
        },
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    correlation_id = getattr(request.state, "correlation_id", "unknown")
    logger.error(
        f"Unhandled server error: {str(exc)}",
        exc_info=True,
        extra={
            "action": "unhandled_error",
            "correlation_id": correlation_id,
            "path": getattr(request.url, "path", ""),
            "method": getattr(request, "method", "")
        }
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "data": None,
            "meta": {"correlation_id": correlation_id},
            "error": {
                "code": ErrorCode.SYSTEM_001.value,
                "message": "An unexpected error occurred"
            }
        },
    )

# Routers mounted under /v1
app.include_router(auth_router,         prefix=f"{API_PREFIX}/auth",         tags=["Auth"])
app.include_router(users_router,        prefix=f"{API_PREFIX}/users",        tags=["Users"])
app.include_router(roles_router,        prefix=f"{API_PREFIX}",              tags=["Roles"])
app.include_router(transactions_router, prefix=f"{API_PREFIX}/transactions", tags=["Transactions"])
app.include_router(dashboard_router,    prefix=f"{API_PREFIX}/dashboard",    tags=["Dashboard"])
app.include_router(audit_router,        prefix=f"{API_PREFIX}/audit",        tags=["Audit"])


@app.get("/health", tags=["System"], summary="Liveness probe")
def health_check():
    """Returns 200 when the process is alive."""
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}


@app.get("/ready", tags=["System"], summary="Readiness probe")
def readiness_check():
    """Returns 200 when DB is reachable, 503 otherwise."""
    from sqlalchemy import text
    from shared.database import SessionLocal
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        return {"status": "ok", "db": "connected"}
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "error", "db": "unreachable"},
        )
