from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_user

router = APIRouter(
    prefix="/friends",
    tags=["Friends"]
)


@router.get(
    "/search/{game_id}",
    response_model=schemas.FriendSearchResponse
)
def search_friend(
    game_id: str,
    db: Session = Depends(get_db)
):

    user = db.query(models.User).filter(
        models.User.game_id == game_id
    ).first()


    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )


    return user

@router.post("/add")
def add_friend(
    data: schemas.FriendCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    friend = db.query(models.User).filter(
        models.User.game_id == data.friend_game_id
    ).first()


    if not friend:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )


    if friend.id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Cannot add yourself"
        )


    existing = db.query(models.Friend).filter(
        models.Friend.user_id == current_user.id,
        models.Friend.friend_id == friend.id
    ).first()


    if existing:
        raise HTTPException(
            status_code=400,
            detail="Already friends"
        )


    new_friend = models.Friend(
        user_id=current_user.id,
        friend_id=friend.id
    )


    db.add(new_friend)
    db.commit()
    db.refresh(new_friend)


    return {
        "message": "Friend added successfully"
    }

@router.get(
    "/list",
    response_model=list[schemas.FriendResponse]
)
def friend_list(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    friends = db.query(models.User).join(
        models.Friend,
        models.Friend.friend_id == models.User.id
    ).filter(
        models.Friend.user_id == current_user.id
    ).all()


    return friends