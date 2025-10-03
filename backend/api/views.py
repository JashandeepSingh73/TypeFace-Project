from common.custom_response import custom_response
from django.http import FileResponse, Http404
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser

from .models import File
from .serializers import FileSerializer


@api_view(["GET"])
def file_list(request):
    files = File.objects.all().order_by("-uploaded_at")
    try:
        limit = int(request.GET.get("limit", 10))
        offset = int(request.GET.get("offset", 0))
    except ValueError:
        limit = 10
        offset = 0
    paginated_files = files[offset : offset + limit]
    serializer = FileSerializer(
        paginated_files, many=True, context={"request": request}
    )
    return custom_response(serializer.data, count=files.count(), request=request)


@api_view(["POST"])
@parser_classes([MultiPartParser])
def file_upload(request):
    # Expecting 'file' in multipart form data
    serializer = FileSerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        instance = serializer.save()
        return custom_response(
            FileSerializer(instance, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
            request=request,
        )
    print("Validation errors:", serializer.errors)  # Debug print
    return custom_response(
        serializer.errors, status=status.HTTP_400_BAD_REQUEST, request=request
    )


@api_view(["GET"])
def file_download(request, pk):
    try:
        f = File.objects.get(pk=pk)
    except File.DoesNotExist:
        raise Http404
    # Serve file via FileResponse
    response = FileResponse(f.file.open("rb"))
    response["Content-Type"] = "application/octet-stream"
    response["Content-Disposition"] = f"attachment; filename={f.original_name}"
    # Optionally, you can return file info as JSON if requested
    if request.GET.get("info") == "1":
        serializer = FileSerializer(f, context={"request": request})
        return custom_response(serializer.data, request=request)
    return response


@api_view(["GET"])
def file_preview(request, pk):
    try:
        f = File.objects.get(pk=pk)
        # Serve file inline where possible
        if request.GET.get("info") == "1":
            serializer = FileSerializer(f, context={"request": request})
            return custom_response(serializer.data, request=request)
        response = FileResponse(f.file.open("rb"))
        if f.content_type:
            response["Content-Type"] = f.content_type
        # Always serve inline for preview
        response["Content-Disposition"] = "inline"
        return response
    except File.DoesNotExist:
        raise Http404


@api_view(["DELETE"])
def file_delete(request, pk):
    try:
        f = File.objects.get(pk=pk)
        f.delete()  # This will delete both the database record and the file
        return custom_response(
            {"detail": "File deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
            request=request,
        )
    except File.DoesNotExist:
        raise Http404
