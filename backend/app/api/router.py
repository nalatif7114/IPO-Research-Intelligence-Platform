"""Main API router aggregating all v1 endpoints."""
from __future__ import annotations

from fastapi import APIRouter

from backend.app.api.v1 import (
    analysis,
    auth,
    companies,
    evaluation,
    health,
    jobs,
    reports,
    upload,
    users,
)

api_router = APIRouter()

# The individual v1 routers already have their own prefixes (e.g. /auth, /users)
# So we only prefix with /v1 here to avoid double prefixing
api_router.include_router(health.router, prefix="/v1", tags=["Health"])
api_router.include_router(auth.router, prefix="/v1", tags=["Authentication"])
api_router.include_router(users.router, prefix="/v1", tags=["Users"])
api_router.include_router(upload.router, prefix="/v1", tags=["Upload"])
api_router.include_router(analysis.router, prefix="/v1", tags=["Analysis"])
api_router.include_router(reports.router, prefix="/v1", tags=["Reports"])
api_router.include_router(jobs.router, prefix="/v1", tags=["Jobs"])
api_router.include_router(evaluation.router, prefix="/v1", tags=["Evaluation"])
api_router.include_router(companies.router, prefix="/v1", tags=["Companies"])
