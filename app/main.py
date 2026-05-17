"""Seed Ledger -- FastAPI application entry point.

Architecture:
    app/
      config.py     -- environment variables, constants
      database.py   -- SQLAlchemy engine, session, get_db dependency
      models.py     -- ORM models (User, StorySection, ExperimentRun, Inquiry, FAQ)
      schemas.py    -- Pydantic schemas (validation + response shapes)
      auth.py       -- admin key check + SHA-256 keyed hash
      emails.py     -- Resend transactional email helpers
      seed.py       -- demo data population
      routes/
        public.py   -- public endpoints (story, runs, faq, inquiries, my-inquiries)
        admin.py    -- admin endpoints (reply, delete, seed)
      main.py       -- this file: FastAPI app, middleware, routers, static serving
"""
import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .database import Base, SessionLocal, engine
from .models import StorySection  # noqa: F401 -- needed for metadata.create_all
from .routes import admin as admin_routes
from .routes import public as public_routes
from .seed import seed_demo

log = logging.getLogger("seedledger")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: create tables + auto-seed if empty. Shutdown: nothing special."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(StorySection).count() == 0:
            log.info("Empty database detected -- auto-seeding demo data")
            seed_demo(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Seed Ledger",
    version="0.1.0",
    lifespan=lifespan,
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)

# CORS: allow any origin (public API), no credentials -- the admin key goes in a custom
# header, not a cookie, so credentialed CORS is not needed. Combining "*" origins with
# credentials=True is invalid per the CORS spec and browsers will reject it.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include route modules
app.include_router(public_routes.router)
app.include_router(admin_routes.router)


# Static frontend (serves React build)
FRONTEND_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dist"
)
if os.path.isdir(FRONTEND_DIR):
    app.mount(
        "/assets",
        StaticFiles(directory=os.path.join(FRONTEND_DIR, "assets")),
        name="assets",
    )

    _BASE = os.path.realpath(FRONTEND_DIR)
    _INDEX = os.path.join(_BASE, "index.html")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        # Resolve and confine to FRONTEND_DIR. Blocks Windows absolute-path injection
        # (os.path.join discards left arg if right is absolute) and .. traversal.
        candidate = os.path.realpath(os.path.join(_BASE, full_path))
        try:
            if os.path.commonpath([_BASE, candidate]) != _BASE:
                return FileResponse(_INDEX)
        except ValueError:
            return FileResponse(_INDEX)
        if os.path.isfile(candidate):
            return FileResponse(candidate)
        return FileResponse(_INDEX)
