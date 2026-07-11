# IPO Research Intelligence Platform

[![Python 3.12](https://img.shields.io/badge/python-3.12-blue.svg)](https://www.python.org/downloads/release/python-3120/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg)](https://fastapi.tiangolo.com)
[![SQLAlchemy 2](https://img.shields.io/badge/SQLAlchemy-2.0-red.svg)](https://www.sqlalchemy.org/)
[![Pydantic v2](https://img.shields.io/badge/Pydantic-v2-e92063.svg)](https://docs.pydantic.dev/)
[![Docker](https://img.shields.io/badge/Docker-compose-2496ED.svg)](https://docs.docker.com/compose/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **AI-powered platform for automated IPO prospectus analysis, financial modeling, risk assessment, and investment report generation.**

---

## 📖 Overview

The **IPO Research Intelligence Platform** automates the end-to-end workflow of analyzing Initial Public Offering (IPO) prospectuses. It ingests raw prospectus documents, extracts structured financial data, performs valuation modeling, assesses risk factors, and generates professional-grade investment research reports — all powered by large language models and a multi-agent AI architecture.

### Key Capabilities

| Capability | Description |
|---|---|
| **Document Ingestion** | Upload and parse PDF/DOCX prospectus filings with OCR support |
| **Financial Extraction** | Automated extraction of income statements, balance sheets, cash flow statements |
| **Valuation Modeling** | DCF analysis, comparable company analysis, and implied pricing |
| **Risk Assessment** | Identification and scoring of risk factors and red flags |
| **Report Generation** | AI-generated investment reports with citations and groundedness scoring |
| **Evaluation Pipeline** | Automated quality scoring for completeness, consistency, and readability |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│                         localhost:3000                        │
└──────────────────────┬───────────────────────────────────────┘
                       │ REST API
┌──────────────────────▼───────────────────────────────────────┐
│                    FastAPI Backend                            │
│                     localhost:8000                            │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐   │
│  │  Auth   │ │  Upload  │ │ Analysis │ │    Reports     │   │
│  │ Module  │ │  Module  │ │  Module  │ │    Module      │   │
│  └─────────┘ └──────────┘ └──────────┘ └────────────────┘   │
│  ┌───────────────────────────────────────────────────────┐   │
│  │              Multi-Agent AI Pipeline                   │   │
│  │   (LangGraph • OpenAI • Anthropic)                    │   │
│  └───────────────────────────────────────────────────────┘   │
└──┬───────────┬───────────┬───────────┬───────────────────────┘
   │           │           │           │
┌──▼──┐    ┌───▼──┐   ┌────▼──┐   ┌────▼───┐
│ PG  │    │Redis │   │Qdrant │   │ MinIO  │
│ :5432│   │:6379 │   │:6333  │   │:9000   │
└─────┘    └──────┘   └───────┘   └────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **API Framework** | FastAPI 0.115, Pydantic v2, Uvicorn |
| **Database** | PostgreSQL 16, SQLAlchemy 2.0 (async), Alembic |
| **Cache / Queue** | Redis 7, Celery 5.5 |
| **Vector Store** | Qdrant |
| **Object Storage** | MinIO (S3-compatible) |
| **AI / ML** | LangChain, LangGraph, OpenAI, Anthropic |
| **Auth** | JWT (python-jose), Passlib (bcrypt) |
| **Monitoring** | Prometheus, structlog |
| **Containerisation** | Docker, Docker Compose |

---

## 🚀 Quick Start

### Prerequisites

- **Docker** ≥ 24.0 and **Docker Compose** ≥ 2.20
- **Python** ≥ 3.12 (for local development)
- **Node.js** ≥ 20 (for frontend development)

### 1. Clone & Configure

```bash
git clone <repository-url>
cd IPO

# Copy environment template
cp .env.example .env
# Edit .env with your API keys and secrets
```

### 2. Start with Docker Compose

```bash
# Start all services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f backend
```

The API will be available at **http://localhost:8000** and the interactive docs at **http://localhost:8000/docs**.

### 3. Local Development (without Docker)

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Run database migrations
cd backend
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Run Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=backend/app --cov-report=html

# Run only unit tests
pytest -m unit
```

---

## 📁 Project Structure

```
IPO/
├── backend/
│   ├── app/
│   │   ├── api/             # API routes & schemas
│   │   │   ├── schemas/     # Pydantic request/response models
│   │   │   └── v1/          # Versioned endpoints
│   │   ├── core/            # Security, events, shared logic
│   │   ├── database/        # SQLAlchemy engine, session, base, repository
│   │   ├── models/          # ORM models (User, Company, Prospectus, …)
│   │   ├── config.py        # Pydantic Settings
│   │   ├── dependencies.py  # FastAPI DI
│   │   ├── exceptions.py    # Custom exceptions & handlers
│   │   ├── lifespan.py      # Startup / shutdown lifecycle
│   │   ├── logging_config.py
│   │   ├── main.py          # FastAPI application entry point
│   │   └── middleware.py    # Request ID, logging, timing
│   ├── alembic/             # Database migrations
│   ├── tests/               # pytest test suite
│   └── Dockerfile
├── frontend/                # React frontend (separate)
├── scripts/                 # Dev & seed scripts
├── docker-compose.yml
├── pyproject.toml
├── requirements.txt
└── README.md
```

---

## 📝 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Health check with service statuses |
| `POST` | `/api/v1/auth/login` | User authentication |
| `POST` | `/api/v1/auth/register` | User registration |
| `POST` | `/api/v1/upload/prospectus` | Upload a prospectus document |
| `POST` | `/api/v1/analysis/start` | Start analysis job |
| `GET` | `/api/v1/analysis/{job_id}` | Get analysis results |
| `GET` | `/api/v1/reports` | List generated reports |
| `GET` | `/api/v1/reports/{id}/download` | Download a report |
| `GET` | `/api/v1/jobs` | List processing jobs |
| `GET` | `/api/v1/companies` | List tracked companies |

Full interactive documentation is available at `/docs` (Swagger UI) and `/redoc` (ReDoc).

---

## 🔒 Environment Variables

See [`.env.example`](.env.example) for all required environment variables. At minimum you must set:

- `APP_SECRET_KEY` — application secret
- `JWT_SECRET_KEY` — JWT signing secret
- `DATABASE_URL` — PostgreSQL connection string
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` — LLM provider key

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
