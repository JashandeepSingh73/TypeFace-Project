from django.db import models


def upload_to(instance, filename):
    # store files under uploads/<id or timestamp> - keep original filename
    return f"uploads/{filename}"


class File(models.Model):
    original_name = models.CharField(max_length=255)
    file = models.FileField(upload_to=upload_to)
    content_type = models.CharField(max_length=100, blank=True)
    size = models.PositiveIntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.content_type and self.file:
            # Try to guess the content type from the file extension
            import mimetypes

            content_type, _ = mimetypes.guess_type(self.original_name)
            if content_type:
                self.content_type = content_type
        super().save(*args, **kwargs)

    def __str__(self):
        return self.original_name
