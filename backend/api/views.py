from django.http import FileResponse, Http404, JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response

from .models import File
from .serializers import FileSerializer


def hello(request):
    return JsonResponse({"message": "Hello from Django"})


@api_view(["GET"])
def file_list(request):
    files = File.objects.all().order_by("-uploaded_at")
    serializer = FileSerializer(files, many=True, context={"request": request})
    return Response(serializer.data)


@api_view(["POST"])
@parser_classes([MultiPartParser])
def file_upload(request):
    # Expecting 'file' in multipart form data
    serializer = FileSerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    print("Validation errors:", serializer.errors)  # Debug print
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
    return response


@api_view(["GET"])
def file_preview(request, pk):
    try:
        f = File.objects.get(pk=pk)
        # Serve file inline where possible
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
        return Response(status=status.HTTP_204_NO_CONTENT)
    except File.DoesNotExist:
        raise Http404
