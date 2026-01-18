import asyncio
import os
import unittest
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock, patch

from fastapi.testclient import TestClient

from app.db import get_session
from app.main import app
from app.models import WishlistItem
from app.modules.wishlist.controllers import create_wishlist_item
from app.modules.wishlist.schemas import WishlistCreate


async def override_get_session():
    yield SimpleNamespace()


class WishlistEndpointTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        app.dependency_overrides[get_session] = override_get_session
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls) -> None:
        app.dependency_overrides.pop(get_session, None)

    @patch("app.modules.wishlist.views.create_wishlist_item", new_callable=AsyncMock)
    def test_create_wishlist_success(self, create_mock: AsyncMock) -> None:
        now = datetime.now(timezone.utc)
        item = WishlistItem(
            id=1,
            email="user@example.com",
            name="Test User",
            website="https://example.com",
            action="track",
            metadata_json={"plan": "pro"},
            created_at=now,
            updated_at=now,
            is_deleted=False,
        )
        create_mock.return_value = item

        payload = {
            "email": "user@example.com",
            "name": "Test User",
            "website": "https://example.com",
            "action": "track",
            "metadata": {"plan": "pro"},
        }

        response = self.client.post("/api/wishlist/", json=payload)

        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data["email"], payload["email"])
        self.assertEqual(data["name"], payload["name"])
        self.assertEqual(data["website"], payload["website"])
        self.assertEqual(data["action"], payload["action"])
        self.assertEqual(data["metadata"], payload["metadata"])
        self.assertFalse(data["is_deleted"])
        self.assertIn("created_at", data)
        self.assertIn("updated_at", data)

    def test_create_wishlist_validation_error(self) -> None:
        payload = {
            "email": "user@example.com",
            "name": "Test User",
            "action": "track",
        }

        response = self.client.post("/api/wishlist/", json=payload)

        self.assertEqual(response.status_code, 422)


class WishlistControllerTests(unittest.TestCase):
    def test_create_wishlist_item_calls_session(self) -> None:
        session = SimpleNamespace(
            add=Mock(),
            commit=AsyncMock(),
            refresh=AsyncMock(),
        )

        async def run_test():
            payload = WishlistCreate(
                email="controller@example.com",
                name="Controller User",
                website="https://controller.example.com",
                action="notify",
                metadata={"source": "unit"},
            )
            item = await create_wishlist_item(session, payload)
            return item

        item = asyncio.run(run_test())

        session.add.assert_called_once()
        session.commit.assert_awaited_once()
        session.refresh.assert_awaited_once()
        self.assertEqual(item.email, "controller@example.com")
        self.assertEqual(item.metadata_json, {"source": "unit"})


class WishlistModelAndMigrationTests(unittest.TestCase):
    def test_wishlist_model_columns(self) -> None:
        columns = WishlistItem.__table__.columns
        self.assertIn("email", columns)
        self.assertIn("name", columns)
        self.assertIn("website", columns)
        self.assertIn("action", columns)
        self.assertIn("metadata", columns)
        self.assertIn("created_at", columns)
        self.assertIn("updated_at", columns)
        self.assertIn("is_deleted", columns)

    def test_migration_contains_wishlist_table(self) -> None:
        migration_path = os.path.join(
            os.path.dirname(__file__),
            "..",
            "alembic",
            "versions",
            "20240920_000001_create_wishlist_items.py",
        )
        with open(migration_path, "r", encoding="utf-8") as handle:
            content = handle.read()

        self.assertIn("create_table", content)
        self.assertIn("wishlist_items", content)
        self.assertIn("metadata", content)
        self.assertIn("created_at", content)
        self.assertIn("updated_at", content)
        self.assertIn("is_deleted", content)
