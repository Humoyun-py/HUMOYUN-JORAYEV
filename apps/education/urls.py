from django.urls import path

from apps.education.views import EducationListCreateAPIView, LanguageListCreateAPIView


urlpatterns = [
    path("education/", EducationListCreateAPIView.as_view(), name="education-list-create"),
    path("languages/", LanguageListCreateAPIView.as_view(), name="language-list-create"),
]
