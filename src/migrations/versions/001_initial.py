"""initial

Revision ID: 001
Revises:
Create Date: 2025-01-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "member",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("trello_id", sa.String, unique=True, nullable=False, index=True),
        sa.Column("username", sa.String, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "time_record",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("trello_member_id", sa.String, sa.ForeignKey("member.trello_id"), nullable=False, index=True),
        sa.Column("trello_card_id", sa.String, nullable=False, index=True),
        sa.Column("start_time", sa.DateTime(timezone=True), nullable=True),
        sa.Column("end_time", sa.DateTime(timezone=True), nullable=True),
        sa.Column("duration_sec", sa.Integer, nullable=False),
        sa.Column("comment", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "active_timer",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("trello_member_id", sa.String, sa.ForeignKey("member.trello_id"), unique=True, nullable=False, index=True),
        sa.Column("trello_card_id", sa.String, nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "time_estimate",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("trello_member_id", sa.String, nullable=False, index=True),
        sa.Column("trello_card_id", sa.String, nullable=False, index=True),
        sa.Column("estimated_min", sa.Integer, nullable=False),
        sa.Column("comment", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("active_timer")
    op.drop_table("time_record")
    op.drop_table("member")
