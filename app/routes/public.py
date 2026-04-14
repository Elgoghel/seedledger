"""Public API endpoints -- no authentication required."""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..auth import make_access_key
from ..config import MAX_PENDING_PER_EMAIL
from ..database import get_db
from ..emails import send_welcome_email
from ..models import ExperimentRun, FAQ, Inquiry, StorySection
from ..schemas import (
    ExperimentRunOut,
    FAQOut,
    InquiryCreate,
    InquiryOut,
    InquiryPublicOut,
    StorySectionOut,
)

router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok", "app": "Seed Ledger", "version": "0.1.0"}


@router.get("/api/story", response_model=list[StorySectionOut])
def get_story(db: Session = Depends(get_db)):
    return (
        db.query(StorySection)
        .filter(StorySection.published == True)
        .order_by(StorySection.sort_order)
        .all()
    )


@router.get("/api/runs", response_model=list[ExperimentRunOut])
def get_runs(
    config: Optional[str] = None,
    seed: Optional[int] = None,
    period: Optional[str] = None,
    limit: int = Query(default=50, le=500),
    db: Session = Depends(get_db),
):
    q = db.query(ExperimentRun)
    if config:
        q = q.filter(ExperimentRun.config == config)
    if seed is not None:
        q = q.filter(ExperimentRun.seed == seed)
    if period:
        q = q.filter(ExperimentRun.period == period)
    return q.order_by(ExperimentRun.created_at.desc()).limit(limit).all()


@router.post("/api/inquiries", response_model=InquiryOut, status_code=201)
def submit_inquiry(data: InquiryCreate, db: Session = Depends(get_db)):
    # Rate limit: max 5 unanswered inquiries per email
    pending = (
        db.query(Inquiry)
        .filter(Inquiry.email == data.email, Inquiry.status == "new")
        .count()
    )
    if pending >= MAX_PENDING_PER_EMAIL:
        raise HTTPException(
            status_code=429,
            detail=(
                f"You already have {pending} unanswered inquiries. "
                f"Please wait for a reply before submitting more."
            ),
        )
    existing_count = db.query(Inquiry).filter(Inquiry.email == data.email).count()
    inquiry = Inquiry(**data.model_dump(), access_key=make_access_key(data.email))
    db.add(inquiry)
    db.commit()
    db.refresh(inquiry)
    # Only email on first inquiry -- they already have the dashboard link after that
    if existing_count == 0:
        send_welcome_email(inquiry.email, inquiry.name, inquiry.tracking_token)
    return inquiry


@router.get("/inquiry/{token}", response_model=InquiryPublicOut)
def track_inquiry(token: str, db: Session = Depends(get_db)):
    inquiry = db.query(Inquiry).filter(Inquiry.tracking_token == token).first()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return inquiry


@router.get("/api/my-inquiries", response_model=list[InquiryPublicOut])
def my_inquiries_by_key(
    key: str = Query(..., min_length=16, max_length=16),
    db: Session = Depends(get_db),
):
    """Look up all inquiries by access key (SHA-256 keyed hash of email + server secret)."""
    return (
        db.query(Inquiry)
        .filter(Inquiry.access_key == key)
        .order_by(Inquiry.created_at.desc())
        .all()
    )


@router.get("/api/faq", response_model=list[FAQOut])
def get_faq(db: Session = Depends(get_db)):
    return (
        db.query(FAQ)
        .filter(FAQ.published == True)
        .order_by(FAQ.sort_order)
        .all()
    )
