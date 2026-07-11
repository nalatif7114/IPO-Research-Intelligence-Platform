# ============================================
# Stage 1: Builder
# ============================================
FROM python:3.12-slim AS builder

WORKDIR /build

RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ============================================
# Stage 2: Runtime
# ============================================
FROM python:3.12-slim AS runtime

LABEL maintainer="IPO Research Team"
LABEL description="IPO Research Intelligence Platform — Backend API"

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends libpq5 curl && \
    rm -rf /var/lib/apt/lists/* && \
    groupadd --gid 1000 appuser && \
    useradd --uid 1000 --gid appuser --shell /bin/bash --create-home appuser

COPY --from=builder /install /usr/local

COPY . .

RUN chown -R appuser:appuser /app

USER appuser

EXPOSE 8000

ENV PYTHONPATH=/app
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
