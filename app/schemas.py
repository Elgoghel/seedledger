"""Pydantic schemas -- request validation and response shaping."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class StorySectionCreate(BaseModel):
    title: str
    slug: str
    plain_text: str = ""
    technical_text: str = ""
    figure_url: Optional[str] = None
    figure_caption: Optional[str] = None
    sort_order: int = 0
    published: bool = False


class StorySectionOut(BaseModel):
    id: int
    title: str
    slug: str
    plain_text: str
    technical_text: str
    figure_url: Optional[str] = None
    figure_caption: Optional[str] = None
    sort_order: int
    published: bool
    updated_at: datetime

    model_config = {"from_attributes": True}


class ExperimentRunCreate(BaseModel):
    config: str = ""
    seed: int = 0
    period: str = ""
    metrics: Optional[dict] = None
    notes: str = ""


class ExperimentRunOut(BaseModel):
    id: int
    config: str
    seed: int
    period: str
    metrics: Optional[dict]
    notes: str
    created_at: datetime

    model_config = {"from_attributes": True}


class InquiryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    category: str = "general"
    message: str = Field(..., min_length=1)


class InquiryOut(BaseModel):
    id: int
    tracking_token: str
    access_key: Optional[str] = None
    name: str
    email: str
    category: str
    message: str
    status: str
    admin_reply: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class InquiryPublicOut(BaseModel):
    """Public view -- no email exposed."""
    tracking_token: str
    name: str
    category: str
    message: str
    status: str
    admin_reply: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class InquiryStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(new|answered|archived)$")
    admin_reply: Optional[str] = None


class FAQOut(BaseModel):
    id: int
    question: str
    answer: str
    sort_order: int
    published: bool

    model_config = {"from_attributes": True}
