"""Admin API endpoints -- require X-Admin-Key header."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..auth import require_admin
from ..database import get_db
from ..emails import send_first_reply_notification
from ..models import ExperimentRun, Inquiry, StorySection
from ..schemas import (
    ExperimentRunCreate,
    ExperimentRunOut,
    InquiryOut,
    InquiryStatusUpdate,
    StorySectionCreate,
    StorySectionOut,
)
from ..seed import seed_demo

router = APIRouter(prefix="/admin")


@router.post("/story", response_model=StorySectionOut, status_code=201)
def create_story(
    data: StorySectionCreate,
    db: Session = Depends(get_db),
    _admin: bool = Depends(require_admin),
):
    section = StorySection(**data.model_dump())
    db.add(section)
    db.commit()
    db.refresh(section)
    return section


@router.post("/runs", response_model=ExperimentRunOut, status_code=201)
def create_run(
    data: ExperimentRunCreate,
    db: Session = Depends(get_db),
    _admin: bool = Depends(require_admin),
):
    run = ExperimentRun(**data.model_dump())
    db.add(run)
    db.commit()
    db.refresh(run)
    return run


@router.get("/inquiries", response_model=list[InquiryOut])
def list_inquiries(
    limit: int = Query(default=200, le=500),
    db: Session = Depends(get_db),
    _admin: bool = Depends(require_admin),
):
    return db.query(Inquiry).order_by(Inquiry.created_at.desc()).limit(limit).all()


@router.patch("/inquiries/{inquiry_id}", response_model=InquiryOut)
def update_inquiry_status(
    inquiry_id: int,
    data: InquiryStatusUpdate,
    db: Session = Depends(get_db),
    _admin: bool = Depends(require_admin),
):
    inquiry = db.query(Inquiry).filter(Inquiry.id == inquiry_id).first()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    was_new = inquiry.status == "new"
    inquiry.status = data.status
    if data.admin_reply is not None:
        inquiry.admin_reply = data.admin_reply
    db.commit()
    db.refresh(inquiry)
    # Only send reply notification if this is the FIRST inquiry answered for this email
    if was_new and data.status == "answered":
        previously_answered = (
            db.query(Inquiry)
            .filter(
                Inquiry.email == inquiry.email,
                Inquiry.status == "answered",
                Inquiry.id != inquiry.id,
            )
            .count()
        )
        if previously_answered == 0:
            send_first_reply_notification(inquiry.email, inquiry.name)
    return inquiry


@router.delete("/inquiries/{inquiry_id}", status_code=204)
def delete_inquiry(
    inquiry_id: int,
    db: Session = Depends(get_db),
    _admin: bool = Depends(require_admin),
):
    inquiry = db.query(Inquiry).filter(Inquiry.id == inquiry_id).first()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    db.delete(inquiry)
    db.commit()


@router.post("/dev/seed", status_code=201)
def seed_demo_data(
    db: Session = Depends(get_db),
    _admin: bool = Depends(require_admin),
):
    """Seed the database with demo data for development."""
    return seed_demo(db)
