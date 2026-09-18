from pydantic import BaseModel
from typing import Optional

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    merchant_id: str
    name: str
    role: str

class TokenData(BaseModel):
    merchant_id: Optional[str] = None
    role: Optional[str] = "MERCHANT"

class LoginRequest(BaseModel):
    phone: str
    password: str

class MerchantResponse(BaseModel):
    id: str
    name: str
    phone: str
    role: str
    category: str
    city: str
    cluster_id: str
