"""create typing passage table

Revision ID: 59c360b78ace
Revises: ccb0b4b195b6
Create Date: 2026-08-08 21:11:40.378270

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '59c360b78ace'
down_revision: Union[str, Sequence[str], None] = 'ccb0b4b195b6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.create_table(
        "typing_passages",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("text", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id")
    )

    op.create_index(
        op.f("ix_typing_passages_id"),
        "typing_passages",
        ["id"],
        unique=False
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_typing_passages_id"),
        table_name="typing_passages"
    )

    op.drop_table("typing_passages")
