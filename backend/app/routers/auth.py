from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import random
import string
from fastapi.security import OAuth2PasswordRequestForm
from app.security import verify_password, create_access_token

from app.database import get_db
from app import models, schemas
from app.security import hash_password


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


def generate_game_id():
    return "TB" + ''.join(
        random.choices(
            string.digits,
            k=6
        )
    )


@router.post("/register", response_model=schemas.UserResponse)
def register(
    user: schemas.UserCreate,
    db: Session = Depends(get_db)
):

    # check username exists
    existing_user = db.query(models.User).filter(
        models.User.username == user.username
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )


    new_user = models.User(
        username=user.username,
        password_hash=hash_password(user.password),
        game_id=generate_game_id()
    )


    db.add(new_user)
    db.commit()
    db.refresh(new_user)


    return new_user

@router.post("/login", response_model=schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    user = db.query(models.User).filter(
        models.User.username == form_data.username
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    if not verify_password(
        form_data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    token = create_access_token({
        "sub": user.username,
        "user_id": user.id
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }




from app.dependencies import get_current_user


@router.get("/me")
def get_me(
    current_user = Depends(get_current_user)
):
    return current_user