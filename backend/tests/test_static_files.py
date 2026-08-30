"""
Tests for production static-file serving.

Regression coverage: the static dir was resolved as <cwd>/backend/static, but
the production image runs with WORKDIR /app/backend, so the SPA was never served.
"""

from pathlib import Path
from unittest.mock import patch

from fastapi.testclient import TestClient

from app import main as app_main
from app.config import settings


BACKEND_DIR = Path(app_main.__file__).resolve().parent.parent


def test_static_dir_is_anchored_to_backend_package_not_cwd(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    assert app_main.get_static_dir() == BACKEND_DIR / "static"


def test_production_app_serves_spa_from_static_dir(tmp_path, monkeypatch):
    static_dir = tmp_path / "static"
    (static_dir / "assets").mkdir(parents=True)
    (static_dir / "index.html").write_text("<html><body>SPA</body></html>")
    (static_dir / "assets" / "app.js").write_text("console.log('hi')")

    # Run from an unrelated cwd, as the Docker image does
    monkeypatch.chdir(tmp_path)

    with patch.object(settings, "environment", "production"), \
         patch.object(app_main, "get_static_dir", return_value=static_dir):
        app = app_main.create_app()
        with TestClient(app) as client:
            root = client.get("/")
            asset = client.get("/assets/app.js")
            deep_link = client.get("/LLM01_2025")
            api_404 = client.get("/api/v1/2025/does-not-exist")

    assert root.status_code == 200 and "SPA" in root.text
    assert asset.status_code == 200 and "console.log" in asset.text
    assert deep_link.status_code == 200 and "SPA" in deep_link.text
    assert api_404.status_code == 404
