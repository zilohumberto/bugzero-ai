"""change id to uuid

Revision ID: 20240920_000002
Revises: 20240920_000001
Create Date: 2024-09-20 00:00:02

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "20240920_000002"
down_revision = "20240920_000001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Drop the old id column and create new UUID column
    op.drop_column("wishlist_items", "id")
    op.add_column(
        "wishlist_items",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
    )
    # Create primary key constraint
    op.create_primary_key("wishlist_items_pkey", "wishlist_items", ["id"])


def downgrade() -> None:
    # Drop UUID column and recreate integer column
    op.drop_constraint("wishlist_items_pkey", "wishlist_items", type_="primary")
    op.drop_column("wishlist_items", "id")
    op.add_column(
        "wishlist_items",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
    )
    op.create_primary_key("wishlist_items_pkey", "wishlist_items", ["id"])
