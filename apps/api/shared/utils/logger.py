"""
Structured JSON logger.
Constitution: CLAUDE.md #36 (intentional logging), #37 (no sensitive data)
Every log entry includes correlation_id for end-to-end traceability.
"""
import json
import logging
from datetime import datetime, timezone


class StructuredJsonFormatter(logging.Formatter):
    """Formats log records as JSON for log aggregation tools."""

    def format(self, record: logging.LogRecord) -> str:
        entry = {
            "timestamp":      datetime.now(timezone.utc).isoformat(),
            "level":          record.levelname,
            "logger":         record.name,
            "message":        record.getMessage(),
            "correlation_id": getattr(record, "correlation_id", None),
            "user_id":        getattr(record, "user_id", None),
            "action":         getattr(record, "action", None),
            "duration_ms":    getattr(record, "duration_ms", None),
        }
        return json.dumps({k: v for k, v in entry.items() if v is not None})


def get_logger(name: str) -> logging.Logger:
    """Returns a structured logger. Call once per module: logger = get_logger(__name__)"""
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(StructuredJsonFormatter())
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    return logger
