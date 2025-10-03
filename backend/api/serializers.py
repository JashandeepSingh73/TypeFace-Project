from rest_framework import serializers

from .models import File


class FileSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = File
        fields = [
            "id",
            "original_name",
            "content_type",
            "size",
            "uploaded_at",
            "url",
            "file",
        ]
        read_only_fields = [
            "id",
            "uploaded_at",
            "url",
            "original_name",
            "content_type",
            "size",
        ]

    def get_url(self, obj):
        request = self.context.get("request")
        if request is None:
            return None
        return request.build_absolute_uri(f"/api/files/{obj.id}/download/")

    def validate_file(self, value):
        # Validate file type and size
        allowed = [
            "text/plain",
            "application/json",
            "image/png",
            "image/jpeg",
            "application/pdf",
        ]
        if hasattr(value, "content_type") and value.content_type not in allowed:
            raise serializers.ValidationError("Unsupported file type")

        max_size = 10 * 1024 * 1024
        if value.size > max_size:
            raise serializers.ValidationError("File too large (max 10MB)")
        return value

    def create(self, validated_data):
        uploaded_file = validated_data.get("file")
        obj = File.objects.create(
            original_name=getattr(uploaded_file, "name", ""),
            file=uploaded_file,
            content_type=getattr(uploaded_file, "content_type", ""),
            size=getattr(uploaded_file, "size", 0),
        )
        return obj
