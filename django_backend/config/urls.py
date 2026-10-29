from django.contrib import admin
from django.urls import include, path
from wellness.views import health_view

urlpatterns = [
    path("admin/", admin.site.urls),
    path("health", health_view, name="health"),
    path("health/", health_view, name="health-slash"),
    path("api/", include("wellness.urls")),
]
