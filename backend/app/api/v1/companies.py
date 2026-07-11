"""Company management endpoints."""

from __future__ import annotations

import structlog
from fastapi import APIRouter
from pydantic import BaseModel, Field

from backend.app.api.schemas.common import PaginatedResponse

logger = structlog.stdlib.get_logger(__name__)

router = APIRouter(prefix="/companies", tags=["companies"])


class CompanyResponse(BaseModel):
    """Company detail response schema."""

    id: str = Field(..., description="Company UUID.")
    name: str = Field(...)
    ticker: str | None = Field(default=None)
    sector: str | None = Field(default=None)
    industry: str | None = Field(default=None)
    country: str | None = Field(default=None)
    exchange: str | None = Field(default=None)
    description: str | None = Field(default=None)
    employee_count: int | None = Field(default=None)
    website: str | None = Field(default=None)

    model_config = {"from_attributes": True}


class CompanyCreate(BaseModel):
    """Request body to create a new company."""

    name: str = Field(..., min_length=1, max_length=512)
    ticker: str | None = Field(default=None, max_length=20)
    sector: str | None = Field(default=None)
    industry: str | None = Field(default=None)
    country: str | None = Field(default=None)


@router.get("", response_model=PaginatedResponse[CompanyResponse])
async def list_companies(page: int = 1, page_size: int = 20) -> PaginatedResponse[CompanyResponse]:
    """List companies with pagination.

    Args:
        page: Page number.
        page_size: Items per page.

    Returns:
        Paginated list of companies.
    """
    mock = CompanyResponse(
        id="00000000-0000-0000-0000-000000000040",
        name="PT Example Technology Tbk",
        ticker="EXMP",
        sector="Technology",
        industry="Software",
        country="Indonesia",
        exchange="IDX",
        description="A leading Indonesian tech company.",
        employee_count=500,
        website="https://example.co.id",
    )
    return PaginatedResponse[CompanyResponse](
        items=[mock],
        total=1,
        page=page,
        page_size=page_size,
        pages=1,
    )


@router.get("/{company_id}", response_model=CompanyResponse)
async def get_company(company_id: str) -> CompanyResponse:
    """Get company detail by ID.

    Args:
        company_id: Company UUID.

    Returns:
        Company detail.
    """
    return CompanyResponse(
        id=company_id,
        name="PT Example Technology Tbk",
        ticker="EXMP",
        sector="Technology",
        industry="Software",
        country="Indonesia",
        exchange="IDX",
        description="A leading Indonesian tech company.",
        employee_count=500,
        website="https://example.co.id",
    )


@router.post("", response_model=CompanyResponse, status_code=201)
async def create_company(body: CompanyCreate) -> CompanyResponse:
    """Create a new company entry.

    Args:
        body: Company data.

    Returns:
        The newly created company.
    """
    logger.info("company_created", name=body.name)
    return CompanyResponse(
        id="00000000-0000-0000-0000-000000000041",
        name=body.name,
        ticker=body.ticker,
        sector=body.sector,
        industry=body.industry,
        country=body.country,
        exchange=None,
        description=None,
        employee_count=None,
        website=None,
    )
