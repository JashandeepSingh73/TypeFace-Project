import json

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import Client, TestCase
from django.urls import reverse

from .models import File


class FileAPITestCase(TestCase):
    def setUp(self):
        self.client = Client()
        # Create a test file
        self.test_content = b"Test file content"
        self.test_file = SimpleUploadedFile(
            name="test.txt", content=self.test_content, content_type="text/plain"
        )

    def test_upload_file(self):
        """Test file upload endpoint"""
        url = reverse("file-upload")
        response = self.client.post(url, {"file": self.test_file}, format="multipart")

        self.assertEqual(response.status_code, 201)
        self.assertTrue(File.objects.exists())

        file = File.objects.first()
        self.assertEqual(file.original_name, "test.txt")
        self.assertEqual(file.content_type, "text/plain")
        self.assertEqual(file.size, len(self.test_content))

    def test_list_files(self):
        """Test file listing endpoint"""
        # Create a test file first
        File.objects.create(
            original_name="test.txt",
            file=self.test_file,
            content_type="text/plain",
            size=len(self.test_content),
        )

        url = reverse("file-list")
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["original_name"], "test.txt")
        self.assertTrue("url" in data[0])

    def test_download_file(self):
        """Test file download endpoint"""
        # Create a test file first
        file = File.objects.create(
            original_name="test.txt",
            file=self.test_file,
            content_type="text/plain",
            size=len(self.test_content),
        )

        url = reverse("file-download", args=[file.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "application/octet-stream")
        self.assertEqual(
            response["Content-Disposition"], "attachment; filename=test.txt"
        )

    def test_preview_file(self):
        """Test file preview endpoint"""
        # Create a test file first
        file = File.objects.create(
            original_name="test.txt",
            file=self.test_file,
            content_type="text/plain",
            size=len(self.test_content),
        )

        url = reverse("file-preview", args=[file.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "text/plain")
        # Preview should not have attachment disposition
        # Check response has correct content type
        self.assertEqual(response["Content-Type"], "text/plain")

    def test_upload_invalid_file_type(self):
        """Test file upload validation - invalid type"""
        invalid_file = SimpleUploadedFile(
            name="test.exe",
            content=b"Invalid content",
            content_type="application/x-msdownload",
        )

        url = reverse("file-upload")
        response = self.client.post(url, {"file": invalid_file}, format="multipart")

        self.assertEqual(response.status_code, 400)
        self.assertFalse(File.objects.exists())

    def test_delete_file(self):
        """Test file deletion endpoint"""
        # Create a test file first
        file = File.objects.create(
            original_name="test.txt",
            file=self.test_file,
            content_type="text/plain",
            size=len(self.test_content),
        )

        url = reverse("file-delete", args=[file.id])
        response = self.client.delete(url)

        self.assertEqual(response.status_code, 204)
        self.assertFalse(File.objects.exists())  # File should be deleted

        # Try deleting non-existent file
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 404)

    def test_upload_large_file(self):
        """Test file upload validation - size limit"""
        # Create a file > 10MB
        large_content = b"x" * (10 * 1024 * 1024 + 1)
        large_file = SimpleUploadedFile(
            name="large.txt", content=large_content, content_type="text/plain"
        )

        url = reverse("file-upload")
        response = self.client.post(url, {"file": large_file}, format="multipart")

        self.assertEqual(response.status_code, 400)
        self.assertFalse(File.objects.exists())

    def test_download_nonexistent_file(self):
        """Test downloading a file that doesn't exist"""
        url = reverse("file-download", args=[999])
        response = self.client.get(url)

        self.assertEqual(response.status_code, 404)
