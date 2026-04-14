"""Config -- environment variables and app-wide settings."""
import os
import logging

log = logging.getLogger("seedledger")

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./seedledger.db")
ADMIN_KEY = os.getenv("ADMIN_KEY", "dev-admin-key")
SITE_URL = os.getenv("SITE_URL", "http://localhost:8000")
EMAIL_FROM = os.getenv("EMAIL_FROM", "onboarding@resend.dev")
INQUIRY_SECRET = os.getenv("INQUIRY_SECRET", "dev-inquiry-secret-change-in-prod")

MAX_PENDING_PER_EMAIL = 5
