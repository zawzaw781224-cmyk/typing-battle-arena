import random
import string

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_user
from app.models import GameRoom, User


router =APIRouter(
    prefix="/rooms",
    tags=["Game Rooms"]
)


def generate_room_code():
    characters = string.ascii_uppercase + string.digits
    return "ROOM-" + "".join(
        random.choices(characters, k=6)
    )


@router.post(
    "/create",
    response_model=schemas.GameRoomResponse
)
def create_room(
    data: schemas.GameRoomCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if data.game_type not in ["fight", "race"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid game type"
        )

    room_code = generate_room_code()

    room = models.GameRoom(
        room_code=room_code,
        host_id=current_user.id,
        game_type=data.game_type,
        status="waiting"
    )

    db.add(room)
    db.commit()
    db.refresh(room)

    return room

@router.post("/join")
def join_room(
    data: schemas.JoinRoomRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    room = db.query(models.GameRoom).filter(
        models.GameRoom.room_code == data.room_code
    ).first()

    if not room:
        raise HTTPException(
            status_code=404,
            detail="Room not found"
        )

    if room.host_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot join your own room"
        )

    if room.guest_id is not None:
        raise HTTPException(
            status_code=400,
            detail="Room is already full"
        )

    if room.status != "waiting":
        raise HTTPException(
            status_code=400,
            detail="Game has already started"
        )

    room.guest_id = current_user.id

    db.commit()
    db.refresh(room)

    return {
        "message": "Joined room successfully",
        "room_code": room.room_code,
        "game_type": room.game_type,
        "status": room.status
    }




@router.post("/{room_code}/ready")
def ready_game(
    room_code: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    room = db.query(GameRoom).filter(
        GameRoom.room_code == room_code
    ).first()

    if not room:
        raise HTTPException(
            status_code=404,
            detail="Room not found"
        )

    if current_user.id == room.host_id:
        room.host_ready = True

    elif current_user.id == room.guest_id:
        room.guest_ready = True

    else:
        raise HTTPException(
            status_code=403,
            detail="You are not in this room"
        )

    # Both players are ready
    if room.host_ready and room.guest_ready:
        room.status = "ready"

    db.commit()
    db.refresh(room)

    return {
        "message": "Player is ready",
        "room_code": room.room_code,
        "host_ready": room.host_ready,
        "guest_ready": room.guest_ready,
        "status": room.status
    }

@router.post("/{room_code}/start")
def start_game(
    room_code: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    room = db.query(models.GameRoom).filter(
        models.GameRoom.room_code == room_code
    ).first()

    if not room:
        raise HTTPException(
            status_code=404,
            detail="Room not found"
        )

    if room.host_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Only the host can start the game"
        )

    if room.guest_id is None:
        raise HTTPException(
            status_code=400,
            detail="Waiting for another player"
        )

    if not room.host_ready or not room.guest_ready:
        raise HTTPException(
            status_code=400,
            detail="Both players must be ready"
        )

    if room.status != "ready":
        raise HTTPException(
            status_code=400,
            detail="Game is not ready to start"
        )

    # Create GameSession
    passages = db.query(models.TypingPassage).all()

    if not passages:
        raise HTTPException(
            status_code=404,
            detail="No typing passages available"
        )

    selected_passage = random.choice(passages)

    game_session = models.GameSession(
        room_id=room.id,
        target_text=selected_passage.text
    )

    db.add(game_session)

    # Start game
    room.status = "playing"

    db.commit()
    db.refresh(room)
    db.refresh(game_session)

    return {
        "message": "Game started",
        "room_code": room.room_code,
        "game_type": room.game_type,
        "status": room.status,
        "session_id": game_session.id
    }
@router.get("/sessions/{session_id}")
def get_game_session(
    session_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    session = db.query(
        models.GameSession
    ).filter(
        models.GameSession.id == session_id
    ).first()

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Game session not found"
        )

    room = db.query(
        models.GameRoom
    ).filter(
        models.GameRoom.id == session.room_id
    ).first()

    if not room:
        raise HTTPException(
            status_code=404,
            detail="Game room not found"
        )

    # Check player is inside this room
    if current_user.id not in [
        room.host_id,
        room.guest_id
    ]:
        raise HTTPException(
            status_code=403,
            detail="You are not in this game"
        )

    return {
        "session_id": session.id,
        "room_code": room.room_code,
        "game_type": room.game_type,
        "status": room.status,
        "host_id": room.host_id,
        "guest_id": room.guest_id,
        "target_text": session.target_text
    }

@router.get("/{room_code}")
def get_room(
    room_code: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    room = db.query(
        models.GameRoom
    ).filter(
        models.GameRoom.room_code == room_code
    ).first()


    if not room:

        raise HTTPException(
            status_code=404,
            detail="Room not found"
        )


    # Only players inside this room can access it

    if current_user.id not in [
        room.host_id,
        room.guest_id
    ]:

        raise HTTPException(
            status_code=403,
            detail="You are not in this room"
        )


    # Find game session if it exists

    game_session = db.query(
        models.GameSession
    ).filter(
        models.GameSession.room_id == room.id
    ).order_by(
        models.GameSession.id.desc()
    ).first()


    return {

        "room_code":
            room.room_code,

        "game_type":
            room.game_type,

        "status":
            room.status,

        "host_id":
            room.host_id,

        "guest_id":
            room.guest_id,

        "host_ready":
            room.host_ready,

        "guest_ready":
            room.guest_ready,

        "session_id":
            game_session.id
            if game_session
            else None

    }

@router.post("/{room_code}/finish")
def finish_game(
    room_code: str,
    winner_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    room = db.query(models.GameRoom).filter(
        models.GameRoom.room_code == room_code
    ).first()

    if not room:
        raise HTTPException(
            status_code=404,
            detail="Room not found"
        )

    if current_user.id not in [room.host_id, room.guest_id]:
        raise HTTPException(
            status_code=403,
            detail="You are not in this room"
        )

    if room.status != "playing":
        raise HTTPException(
            status_code=400,
            detail="Game is not currently playing"
        )

    if winner_id not in [room.host_id, room.guest_id]:
        raise HTTPException(
            status_code=400,
            detail="Invalid winner"
        )

    room.winner_id = winner_id
    room.status = "finished"
    room.finished_at = datetime.utcnow()

    db.commit()
    db.refresh(room)

    return {
        "message": "Game finished",
        "room_code": room.room_code,
        "winner_id": room.winner_id,
        "status": room.status,
        "finished_at": room.finished_at
    }


@router.get("/history")
def get_game_history(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    rooms = db.query(models.GameRoom).filter(
        (models.GameRoom.host_id == current_user.id) |
        (models.GameRoom.guest_id == current_user.id)
    ).filter(
        models.GameRoom.status == "finished"
    ).order_by(
        models.GameRoom.finished_at.desc()
    ).all()

    return [
        {
            "room_code": room.room_code,
            "game_type": room.game_type,
            "host_id": room.host_id,
            "guest_id": room.guest_id,
            "winner_id": room.winner_id,
            "status": room.status,
            "finished_at": room.finished_at
        }
        for room in rooms
    ]

@router.get("/{room_code}/result")
def get_game_result(
    room_code: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    room = db.query(models.GameRoom).filter(
        models.GameRoom.room_code == room_code
    ).first()

    if not room:
        raise HTTPException(
            status_code=404,
            detail="Room not found"
        )

    # User must be a player in this room
    if current_user.id not in [room.host_id, room.guest_id]:
        raise HTTPException(
            status_code=403,
            detail="You are not in this room"
        )

    # Game must be finished
    if room.status != "finished":
        raise HTTPException(
            status_code=400,
            detail="Game is not finished yet"
        )

    session = db.query(models.GameSession).filter(
        models.GameSession.room_id == room.id
    ).first()

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Game session not found"
        )

    return {
        "room_code": room.room_code,
        "game_type": room.game_type,
        "status": room.status,

        "host_id": room.host_id,
        "guest_id": room.guest_id,

        "winner_id": room.winner_id,

        "player1_progress": session.player1_progress,
        "player2_progress": session.player2_progress,

        "player1_hp": session.player1_hp,
        "player2_hp": session.player2_hp,

        "finished_at": room.finished_at
    }