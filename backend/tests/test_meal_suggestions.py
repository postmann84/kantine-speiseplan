"""Tests for /api/meal-suggestions endpoint (Ideen-Button feature)."""
import os
import requests
import pytest

# Next.js monolith - frontend serves the API on port 3000.
# Per agent_to_agent_context_note: preview URL doesn't work, use localhost:3000
BASE_URL = os.environ.get("TEST_BASE_URL", "http://localhost:3000").rstrip("/")
API_URL = f"{BASE_URL}/api/meal-suggestions"

EXPECTED_CATEGORIES = {
    "🐷": "Schwein",
    "🐔": "Huhn",
    "🥗": "Vegetarisch",
    "🐄": "Rind",
    "🐟": "Fisch",
    "🥣": "Suppe/Eintopf",
    "🍝": "Pasta",
}


@pytest.fixture(scope="module")
def payload():
    response = requests.get(API_URL, timeout=30)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text[:200]}"
    return response.json()


# --- Status & top-level shape ---
class TestApiContract:
    def test_status_code(self):
        r = requests.get(API_URL, timeout=30)
        assert r.status_code == 200

    def test_success_true(self, payload):
        assert payload.get("success") is True

    def test_categories_present(self, payload):
        assert "categories" in payload
        assert isinstance(payload["categories"], dict)


# --- Category structure ---
class TestCategories:
    def test_all_seven_categories_present(self, payload):
        cats = payload["categories"]
        for icon in EXPECTED_CATEGORIES.keys():
            assert icon in cats, f"Missing category icon {icon}"

    def test_category_labels_correct(self, payload):
        cats = payload["categories"]
        for icon, expected_label in EXPECTED_CATEGORIES.items():
            assert cats[icon]["label"] == expected_label, (
                f"Icon {icon}: expected label '{expected_label}', got '{cats[icon]['label']}'"
            )

    def test_category_has_icon_field(self, payload):
        cats = payload["categories"]
        for icon, cat in cats.items():
            assert cat.get("icon") == icon

    def test_category_meals_is_list(self, payload):
        for cat in payload["categories"].values():
            assert isinstance(cat["meals"], list)


# --- Meal item structure ---
class TestMealItems:
    def test_meal_required_fields(self, payload):
        for icon, cat in payload["categories"].items():
            for meal in cat["meals"]:
                for field in ("name", "count", "weeksAgo", "price"):
                    assert field in meal, f"meal in {icon} missing field '{field}'"

    def test_meal_field_types(self, payload):
        for cat in payload["categories"].values():
            for meal in cat["meals"]:
                assert isinstance(meal["name"], str) and meal["name"].strip()
                assert isinstance(meal["count"], int) and meal["count"] >= 1
                assert meal["weeksAgo"] is None or isinstance(meal["weeksAgo"], int)
                assert isinstance(meal["price"], (int, float))

    def test_meals_sorted_by_count_desc(self, payload):
        for icon, cat in payload["categories"].items():
            counts = [m["count"] for m in cat["meals"]]
            assert counts == sorted(counts, reverse=True), (
                f"Category {icon} not sorted desc by count: {counts[:10]}"
            )

    def test_at_least_one_category_has_meals(self, payload):
        total = sum(len(c["meals"]) for c in payload["categories"].values())
        assert total > 0, "No meals in any category - DB empty?"


# --- Method handling ---
class TestMethodHandling:
    def test_post_not_allowed(self):
        r = requests.post(API_URL, json={}, timeout=10)
        assert r.status_code == 405
