from passlib.context import CryptContext
from jose import jwt
from jose import JWTError

from datetime import datetime, timedelta
from dotenv import load_dotenv
import os
load_dotenv()
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(password, hashed_password):
    return pwd_context.verify(
        password,
        hashed_password
    )


def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=30
    )

    to_encode.update({
        "exp": expire
    })

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

def decode_access_token(token: str):
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return payload

    except JWTError:
        return None
