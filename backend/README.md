# Django Backend

Minimal Django backend for the project.

Requirements

- Python 3.8+

Quickstart (PowerShell)

```powershell
python -m venv .venv; .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

API

- GET /api/hello/ -> { "message": "Hello from Django" }
