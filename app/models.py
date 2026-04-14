"""SQLAlchemy ORM models -- the database tables."""
import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Index, Integer, String, Text, Boolean, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="user")
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )


class StorySection(Base):
    __tablename__ = "story_sections"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    plain_text: Mapped[str] = mapped_column(Text, default="")
    technical_text: Mapped[str] = mapped_column(Text, default="")
    figure_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True, default=None)
    figure_caption: Mapped[Optional[str]] = mapped_column(String(500), nullable=True, default=None)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    published: Mapped[bool] = mapped_column(Boolean, default=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class ExperimentRun(Base):
    __tablename__ = "experiment_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    config: Mapped[str] = mapped_column(String(255), default="", index=True)
    seed: Mapped[int] = mapped_column(Integer, default=0)
    period: Mapped[str] = mapped_column(String(100), default="", index=True)
    metrics: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), index=True
    )


class Inquiry(Base):
    __tablename__ = "inquiries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tracking_token: Mapped[str] = mapped_column(
        String(36), unique=True, default=lambda: str(uuid.uuid4()), index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(100), default="general")
    message: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="new", index=True)
    access_key: Mapped[Optional[str]] = mapped_column(String(16), nullable=True, index=True)
    admin_reply: Mapped[Optional[str]] = mapped_column(Text, nullable=True, default=None)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), index=True
    )

    # Composite index for the rate-limit query: count inquiries WHERE email=? AND status='new'
    __table_args__ = (
        Index("ix_inquiries_email_status", "email", "status"),
    )


class FAQ(Base):
    __tablename__ = "faqs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    question: Mapped[str] = mapped_column(Text, nullable=False)
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    published: Mapped[bool] = mapped_column(Boolean, default=False)
