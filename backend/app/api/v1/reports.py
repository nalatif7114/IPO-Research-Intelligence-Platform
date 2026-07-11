"""Report endpoints — list, detail, download, and delete."""

from __future__ import annotations

from datetime import datetime, timezone

import structlog
from fastapi import APIRouter
from fastapi.responses import JSONResponse

from backend.app.api.schemas.common import MessageResponse, PaginatedResponse
from backend.app.api.schemas.report import ReportListResponse, ReportResponse

logger = structlog.stdlib.get_logger(__name__)

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("", response_model=PaginatedResponse[ReportListResponse])
async def list_reports(page: int = 1, page_size: int = 20) -> PaginatedResponse[ReportListResponse]:
    """List generated reports with pagination.

    Args:
        page: Page number.
        page_size: Items per page.

    Returns:
        Paginated list of report summaries.
    """
    now = datetime.now(tz=timezone.utc)
    mock = ReportListResponse(
        id="00000000-0000-0000-0000-000000000030",
        title="PT Example Tbk — Full IPO Analysis",
        report_type="full_analysis",
        report_format="markdown",
        created_at=now,
    )
    return PaginatedResponse[ReportListResponse](
        items=[mock],
        total=1,
        page=page,
        page_size=page_size,
        pages=1,
    )


@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(report_id: str) -> ReportResponse:
    """Get full report detail including citations.

    Args:
        report_id: Report UUID.

    Returns:
        Complete report with content and citations.
    """
    now = datetime.now(tz=timezone.utc)
    return ReportResponse(
        id=report_id,
        prospectus_id="00000000-0000-0000-0000-000000000005",
        report_type="full_analysis",
        report_format="markdown",
        title="PT Example Tbk — Full IPO Analysis",
        content="# Executive Summary\n\nPlaceholder report content…",
        file_path=None,
        created_at=now,
        citations=[],
    )


@router.get("/{report_id}/download")
async def download_report(report_id: str) -> JSONResponse:
    """Download a generated report file.

    Args:
        report_id: Report UUID.

    Returns:
        Placeholder download response.
    """
    return JSONResponse(
        content={"message": f"Download for report {report_id} would stream the file."},
    )


@router.delete("/{report_id}", response_model=MessageResponse)
async def delete_report(report_id: str) -> MessageResponse:
    """Delete a report.

    Args:
        report_id: Report UUID.

    Returns:
        Deletion confirmation.
    """
    logger.info("report_deleted", report_id=report_id)
    return MessageResponse(message=f"Report {report_id} deleted successfully.")
