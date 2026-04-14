"""Authentication helpers -- admin key check + keyed hash for inquiry access."""
import hashlib

from fastapi import Header, HTTPException

from .config import ADMIN_KEY, INQUIRY_SECRET


def require_admin(x_admin_key: str = Header(...)):
    """FastAPI dependency -- rejects if X-Admin-Key header is missing or wrong."""
    if x_admin_key != ADMIN_KEY:
        raise HTTPException(status_code=403, detail="Invalid admin key")
    return True


def make_access_key(email: str) -> str:
    """SHA-256(email + secret) -> 16-char hex access key. Deterministic per email.

    Used for passwordless inquiry lookup. Same email always produces the same key.
    An attacker who knows the email still cannot compute the key without the secret.
    Same HMAC pattern used in password reset links, JWT signatures, webhook verification.
    """
    return hashlib.sha256(f"{email}:{INQUIRY_SECRET}".encode()).hexdigest()[:16]
