from django.urls import path

from . import views

urlpatterns = [
    path("files/", views.file_list, name="file-list"),
    path("files/upload/", views.file_upload, name="file-upload"),
    path("files/<int:pk>/download/", views.file_download, name="file-download"),
    path("files/<int:pk>/preview/", views.file_preview, name="file-preview"),
    path("files/<int:pk>/", views.file_delete, name="file-delete"),
]
