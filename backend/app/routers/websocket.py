from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from jose import jwt, JWTError
from datetime import datetime

from app.database import SessionLocal
from app import models
from app.security import SECRET_KEY, ALGORITHM


router = APIRouter(
    tags=["WebSocket"]
)


active_connections = {}


@router.websocket("/ws/{room_code}")
async def websocket_endpoint(
    websocket: WebSocket,
    room_code: str,
    token: str
):
    await websocket.accept()

    db = SessionLocal()

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = int(payload.get("user_id"))

        user = db.query(models.User).filter(
            models.User.id == user_id
        ).first()

        if not user:
            await websocket.close()
            return

        room = db.query(models.GameRoom).filter(
            models.GameRoom.room_code == room_code
        ).first()
        host = db.query(models.User).filter(
            models.User.id == room.host_id
        ).first()

        guest = db.query(models.User).filter(
            models.User.id == room.guest_id
        ).first()

        if not room:
            await websocket.close()
            return

        if user.id not in [room.host_id, room.guest_id]:
            await websocket.close()
            return

        if room.status != "playing":
            await websocket.close()
            return 

        if room_code not in active_connections:
            active_connections[room_code] = {}

        session = db.query(models.GameSession).filter(
        models.GameSession.room_id == room.id
        ).first()

        if not session:
            await websocket.close()
            return

        active_connections[room_code][user.id] = websocket

        await websocket.send_json({
            "type": "connected",
            "user_id": user.id,
            "room_code": room_code,
            "host_id": room.host_id,
            "guest_id": room.guest_id,
            "host_username": host.username,
            "guest_username": guest.username,
            "target_text": session.target_text
        })
        # Both players connected
        if len(active_connections[room_code]) == 2:

            for connection in active_connections[room_code].values():

                await connection.send_json({
                    "type": "countdown_start"
                })
        while True:

            message = await websocket.receive_json()

            if message.get("type") != "typing":
                continue

            char = message.get("char")

            if not char:
                continue

            winner_id = None

            # Get player's current progress
            if user.id == room.host_id:
                progress = session.player1_progress
            else:
                progress = session.player2_progress

            # Game already finished typing
            if progress >= len(session.target_text):
                continue

            # Character expected by the server
            expected_char = session.target_text[progress]

            if char == expected_char:

                progress += 1

                if user.id == room.host_id:

                    session.player1_progress = progress

                else:

                    session.player2_progress = progress


                # Fight game မှာပဲ damage ပေးမယ်

                if room.game_type == "fight":

                    if user.id == room.host_id:

                        session.player2_hp -= 1

                    else:

                        session.player1_hp -= 1
                db.commit()
                db.refresh(session)

                

                if room.game_type == "race":

                    if progress >= len(session.target_text):

                        winner_id = user.id


                elif room.game_type == "fight":

                    if session.player1_hp <= 0:

                        session.player1_hp = 0
                        winner_id = room.guest_id

                    elif session.player2_hp <= 0:

                        session.player2_hp = 0
                        winner_id = room.host_id

                if winner_id is not None:

                    room.winner_id = winner_id
                    room.status = "finished"
                    room.finished_at = datetime.utcnow()

                    db.commit()
                    db.refresh(room)
                    db.refresh(session)

                result = {
                    "type": "typing_result",
                    "correct": True,
                    "progress": progress,
                    "player1_progress": session.player1_progress,
                    "player2_progress": session.player2_progress,
                    "player1_hp": session.player1_hp,
                    "player2_hp": session.player2_hp
                }

            else:

                result = {
                    "type": "typing_result",
                    "correct": False,
                    "progress": progress,
                    "player1_progress": session.player1_progress,
                    "player2_progress": session.player2_progress,
                    "player1_hp": session.player1_hp,
                    "player2_hp": session.player2_hp
                }
            # Broadcast typing result to both players
            for connection in active_connections[room_code].values():

                await connection.send_json({
                    "user_id": user.id,
                    "message": result
                })


            # Game Over
            if winner_id is not None:

                game_over_message = {
                    "type": "game_over",
                    "winner_id": winner_id,
                    "loser_id": (
                        room.host_id
                        if winner_id == room.guest_id
                        else room.guest_id
                    )
                }

                for connection in active_connections[room_code].values():

                    await connection.send_json(game_over_message)
                    
    except WebSocketDisconnect:
        print("Webscoket disconnected",user_id, room_code)

        if room_code in active_connections:
            active_connections[room_code].pop(
                user_id,
                None
            )

            if not active_connections[room_code]:
                del active_connections[room_code]
    except Exception as e:
            print("WEBSOCKET ERROR:",e)
            await websocket.close()
    

    finally:
        db.close()