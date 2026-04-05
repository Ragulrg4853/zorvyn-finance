from datetime import date
from typing import Optional
from fastapi import status
from shared.utils.error_taxonomy import AppError, ErrorCode

def validate_date_range(date_from: Optional[date], date_to: Optional[date]) -> None:
    if date_from and date_to and date_from > date_to:
        raise AppError(
            code=ErrorCode.VALIDATION_001,
            http_status=status.HTTP_400_BAD_REQUEST,
            field="date_range"
        )

def calculate_total_pages(total: int, page_size: int) -> int:
    """Safe ceiling division for pagination."""
    if total < 0 or page_size <= 0:
        return 0
    return -(-total // page_size)
