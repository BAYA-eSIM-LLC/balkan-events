"""Ticketing core validation tests (structure + contracts).
Full concurrent PostgreSQL tests run in CI.
"""
import os

def test_internal_secret_not_hardcoded():
    text = open("app/routers/orders.py").read()
    assert "dev-internal-key" not in text
    assert "INTERNAL_API_SECRET" in text

def test_idempotency_content_hash():
    text = open("app/routers/orders.py").read()
    assert "content_hash" in text
    assert "409" in text

def test_expiry_job_exists():
    text = open("app/routers/orders.py").read()
    assert "expire-reservations" in text
    assert "skip_locked" in text or "with_for_update" in text

def test_qr_uses_secrets():
    text = open("app/routers/orders.py").read()
    assert "secrets.token_urlsafe" in text or "token_urlsafe" in text

def test_migrations_chain():
    versions = [
        "001_initial.py", "002_inventory_ledger.py", "003_ledger_immutable.py",
        "004_user_profile_auth.py", "005_locations_categories.py",
        "006_events_engine.py", "007_search_admin.py", "008_organizer_portal.py",
        "009_admin_system.py", "010_cms_hero.py", "011_order_reference.py",
        "012_content_hash.py",
    ]
    for v in versions:
        assert os.path.exists(f"alembic/versions/{v}"), f"missing {v}"

def test_order_status_expired():
    text = open("app/models/order.py").read()
    assert "EXPIRED" in text
    assert "RESERVED" in text
