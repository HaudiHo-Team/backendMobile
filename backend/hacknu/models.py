from typing import Any, Dict, Optional
from pydantic import BaseModel

class UserMessage(BaseModel):
    message: str
    message_type: str
    request_id: int
    callback_url: int

class Response(BaseModel):
    status: str
    result: str