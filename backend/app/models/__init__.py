# Import all models to ensure SQLAlchemy mapper can find them
# Order matters: base models first, then models with foreign keys

from app.models.user import User, UserRole, AuthProvider
from app.models.pet import Pet, PetType, PetGender
from app.models.business import Business, BusinessCategory, BusinessStatus
from app.models.product import Product, ProductCategory, ProductStatus
from app.models.booking import Booking, BookingStatus
from app.models.review import Review
from app.models.chat import ChatSession, ChatMessage, ChatChannel, MessageRole
from app.models.order import Order, OrderItem, OrderStatus, PaymentMethod
from app.models.consultation import (
    Consultation,
    ConsultationStatus,
    ConsultationStep,
    MemberType,
    ConsultationCategory,
    ConsultationUrgency,
    DailyConsultationCounter,
)

__all__ = [
    # User
    "User",
    "UserRole",
    "AuthProvider",
    # Pet
    "Pet",
    "PetType",
    "PetGender",
    # Business
    "Business",
    "BusinessCategory",
    "BusinessStatus",
    # Product
    "Product",
    "ProductCategory",
    "ProductStatus",
    # Booking
    "Booking",
    "BookingStatus",
    # Review
    "Review",
    # Chat
    "ChatSession",
    "ChatMessage",
    "ChatChannel",
    "MessageRole",
    # Order
    "Order",
    "OrderItem",
    "OrderStatus",
    "PaymentMethod",
    # Consultation
    "Consultation",
    "ConsultationStatus",
    "ConsultationStep",
    "MemberType",
    "ConsultationCategory",
    "ConsultationUrgency",
    "DailyConsultationCounter",
]
