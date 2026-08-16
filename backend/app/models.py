from sqlalchemy import Column, Integer, String, DateTime, ForeignKey,Boolean,Text
from datetime import datetime
from sqlalchemy.sql import func

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String, unique=True, nullable=False)

    password_hash = Column(String, nullable=False)

    game_id = Column(String, unique=True, nullable=False)

    created_at = Column(DateTime(timezone=True),
                        server_default=func.now())

class Friend(Base):
    __tablename__ = "friends"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    friend_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

class GameRoom(Base):
    __tablename__ ="game_rooms"
    id=Column(Integer,primary_key=True,index=True)
    room_code=Column(String,unique=True,nullable=False,index=True)
    host_id =Column(Integer,ForeignKey("users.id"),nullable=False)
    guest_id = Column(Integer,ForeignKey("users.id"),nullable=True)
    game_type = Column(String,nullable=False)
    status =Column(String,default="waiting",nullable=False)
    created_at = Column(DateTime,default=datetime.utcnow)
    host_ready = Column(Boolean, default=False, nullable=False)
    guest_ready = Column(Boolean, default=False, nullable=False)
    winner_id = Column(Integer,ForeignKey("users.id"),nullable=True)
    finished_at = Column(DateTime,nullable=True)

class GameSession(Base):
    __tablename__ = "game_sessions"

    id = Column(Integer, primary_key=True, index=True)

    room_id = Column(
        Integer,
        ForeignKey("game_rooms.id"),
        nullable=False,
        unique=True
    )

    target_text = Column(
        String,
        nullable=False
    )

    player1_progress = Column(
        Integer,
        default=0,
        nullable=False
    )

    player2_progress = Column(
        Integer,
        default=0,
        nullable=False
    )

    player1_hp = Column(
        Integer,
        default=100,
        nullable=False
    )

    player2_hp = Column(
        Integer,
        default=100,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

class TypingPassage(Base):
    __tablename__ = "typing_passages"

    id = Column(Integer, primary_key=True, index=True)

    text = Column(
        Text,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


