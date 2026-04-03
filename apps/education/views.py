from rest_framework.generics import ListCreateAPIView

from apps.education.models import Education, Language
from apps.education.serializers import EducationSerializer, LanguageSerializer


class EducationListCreateAPIView(ListCreateAPIView):
    queryset = Education.objects.all()
    serializer_class = EducationSerializer


class LanguageListCreateAPIView(ListCreateAPIView):
    queryset = Language.objects.all()
    serializer_class = LanguageSerializer
