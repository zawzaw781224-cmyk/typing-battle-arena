from pydantic import BaseModel
from datetime import datetime


class UserCreate(BaseModel):
    username: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    game_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token : str 
    token_type : str

class FriendSearchResponse(BaseModel):
    id: int
    username: str
    game_id: str

    class Config:
        from_attributes = True

class FriendCreate(BaseModel):
    friend_game_id :str 

class FriendResponse(BaseModel):
    id : int 
    username : str 
    game_id :str

    class Config:
        from_attributes = True
class GameRoomCreate(BaseModel):
    game_type: str


class GameRoomResponse(BaseModel):
    id: int
    room_code: str
    host_id: int
    guest_id: int | None
    game_type: str
    status: str

    class Config:
        from_attributes = True

class JoinRoomRequest(BaseModel):
    room_code :str