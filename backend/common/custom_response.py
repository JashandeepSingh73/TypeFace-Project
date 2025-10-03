from rest_framework.response import Response


def custom_response(data, count=None, lastpage=None, status=200, request=None):
    # If request is provided, use limit/offset for pagination
    if request is not None:
        try:
            limit = int(request.GET.get("limit", 10))
        except (ValueError, AttributeError):
            limit = 10
        if count is None:
            count = len(data) if isinstance(data, list) else 1
        lastpage = (count + limit - 1) // limit if limit else 1
    else:
        if count is None:
            count = len(data) if isinstance(data, list) else 1
    resp = {
        "count": count,
        "lastpage": lastpage,
        "data": data,
    }
    return Response(resp, status=status)
