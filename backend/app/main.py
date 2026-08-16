from fastapi import FastAPI
from app.routers import auth
from app.routers import friends
from app.routers import rooms
from app.routers import websocket
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(friends.router)
app.include_router(rooms.router)
app.include_router(websocket.router)

@app.get("/")
def home():
    return {
        "message": "Typing Battle Arena API Running"
    }