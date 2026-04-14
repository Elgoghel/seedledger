"""Seed Ledger -- compatibility shim for the original entry point.

The real application lives in the `app/` package. This file just re-exports
the FastAPI `app` object so existing run commands keep working:

    uvicorn seedledger_app:app --host 0.0.0.0 --port 8000

New command (also supported):

    uvicorn app.main:app --host 0.0.0.0 --port 8000
"""
from app.main import app  # noqa: F401

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
