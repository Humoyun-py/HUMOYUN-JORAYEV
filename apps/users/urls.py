from django.urls import path

from apps.users.views import ExportPDFAPIView, ExtraInfoListAPIView, UserProfileAPIView


urlpatterns = [
    path("profile/", UserProfileAPIView.as_view(), name="profile"),
    path("extra/", ExtraInfoListAPIView.as_view(), name="extra-list"),
    path("export-pdf/", ExportPDFAPIView.as_view(), name="export-pdf"),
]
