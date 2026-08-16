"""change typing passage text to text

Revision ID: da54e7973ae9
Revises: 59c360b78ace
Create Date: 2026-08-08 21:22:12.331546

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'da54e7973ae9'
down_revision: Union[str, Sequence[str], None] = '59c360b78ace'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "typing_passages",
        "text",
        existing_type=sa.String(),
        type_=sa.Text(),
        existing_nullable=False
    )


def downgrade() -> None:
    op.alter_column(
        "typing_passages",
        "text",
        existing_type=sa.Text(),
        type_=sa.String(),
        existing_nullable=False
    )