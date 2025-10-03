# TypeFace-Project

A full-stack file management system built with Django (backend) and React (frontend).

## Features
- Upload, preview, download, and delete files (images, PDFs, JSON, text, etc.)
- Unified file table with file type icons
- REST API backend (Django + DRF)
- Drag-and-drop or button-based file upload

## Project Structure

```
TypeFace-Project/
├── backend/      # Django backend (API, models, media storage)
├── frontend/     # React frontend (UI, file management)
└── README.md     # Project documentation
```

### Backend (Django)
1. Navigate to the `backend` directory:
   ```sh
   cd backend
   ```
2. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
3. Run migrations:
   ```sh
   python manage.py migrate
   ```
4. Start the backend server:
   ```sh
   python manage.py runserver
   ```

### Frontend (React)
1. Navigate to the `frontend` directory:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the frontend server:
   ```sh
   npm start
   ```

The React app will run on [http://localhost:3000] and the Django API on [http://localhost:8000]

## Usage
- Upload files using the UI (supports drag-and-drop and file picker)
- Preview images, PDFs, and text files in-browser
- Download or delete files as needed

## Customization
- Update allowed file types in `backend/api/serializers.py`
- Adjust UI and icons in `frontend/src/App.js`

