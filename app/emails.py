"""Transactional email helpers -- Resend API integration.

Fire-and-forget: email failures never block the request. Max 2 emails per user, ever.
"""
import logging
import os

from .auth import make_access_key
from .config import EMAIL_FROM, SITE_URL

log = logging.getLogger("seedledger")

try:
    import resend
    resend.api_key = os.getenv("RESEND_API_KEY", "")
    HAS_RESEND = bool(resend.api_key)
except ImportError:
    HAS_RESEND = False
    resend = None


def send_welcome_email(email: str, name: str, token: str):
    """Sent once on first-ever inquiry from this email. Dashboard link + inquiry link."""
    if not HAS_RESEND:
        log.info("Email skipped (no RESEND_API_KEY): welcome to %s", email)
        return
    access_key = make_access_key(email)
    try:
        resend.Emails.send({
            "from": EMAIL_FROM,
            "to": email,
            "subject": "Seed Ledger -- Your Inquiry Dashboard",
            "html": (
                f"<h2>Hi {name},</h2>"
                f"<p>Your inquiry has been received.</p>"
                f"<p><strong>Your inquiry:</strong> "
                f'<a href="{SITE_URL}/inquiry/{token}">{SITE_URL}/inquiry/{token}</a></p>'
                f"<p><strong>All your inquiries:</strong> "
                f'<a href="{SITE_URL}/my-inquiries?key={access_key}">{SITE_URL}/my-inquiries?key={access_key}</a></p>'
                f"<p>Bookmark the dashboard link -- any future questions will appear there too. "
                f"We'll send one more email when your first reply is ready.</p>"
                f"<br><p style='color:#888'>-- Seed Ledger</p>"
            ),
        })
        log.info("Welcome email sent to %s", email)
    except Exception as exc:
        log.warning("Failed to send welcome email: %s", exc)


def send_first_reply_notification(email: str, name: str):
    """Sent once when the first of a user's inquiries gets answered. Points to dashboard."""
    if not HAS_RESEND:
        log.info("Email skipped (no RESEND_API_KEY): first reply notification to %s", email)
        return
    access_key = make_access_key(email)
    try:
        resend.Emails.send({
            "from": EMAIL_FROM,
            "to": email,
            "subject": "Seed Ledger -- You Have a Reply",
            "html": (
                f"<h2>Hi {name},</h2>"
                f"<p>One of your inquiries has been answered.</p>"
                f"<p>Check your dashboard for the reply:</p>"
                f'<p><a href="{SITE_URL}/my-inquiries?key={access_key}">{SITE_URL}/my-inquiries?key={access_key}</a></p>'
                f"<p>Future replies will also appear there -- no more emails from us.</p>"
                f"<br><p style='color:#888'>-- Seed Ledger</p>"
            ),
        })
        log.info("First reply notification sent to %s", email)
    except Exception as exc:
        log.warning("Failed to send first reply notification: %s", exc)
