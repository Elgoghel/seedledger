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

app = FastAPI(title="Seed Ledger", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include route modules
app.include_router(public_routes.router)
app.include_router(admin_routes.router)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(StorySection).count() == 0:
            log.info("Empty database detected -- auto-seeding demo data")
            seed_demo(db)
    finally:
        db.close()


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

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        """Serve React SPA -- all non-API routes fall through to index.html."""
        file_path = os.path.join(FRONTEND_DIR, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))
