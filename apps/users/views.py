from io import BytesIO
import textwrap

from django.db.utils import OperationalError
from django.http import HttpResponse
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas
from rest_framework import status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView

from apps.education.models import Education
from apps.projects.models import Project
from apps.skills.models import Skill
from apps.users.models import ExtraInfo, UserProfile
from apps.users.serializers import ExtraInfoSerializer, UserProfileSerializer

DEFAULT_PROFILE = {
    "full_name": "Humoyun Jo'rayev",
    "title": "Python Backend Developer",
    "bio": (
        "Humoyun Jo'rayev Toshkentdagi Python backend developer bo'lib, "
        "Django, Django REST Framework, REST API, Telegram bot, SQLite va "
        "PostgreSQL bilan ishlaydi."
    ),
    "location": "Toshkent, O'zbekiston",
    "github": "https://github.com/Humoyun-py",
    "telegram": "https://t.me/humoyun_coder",
    "email": "freif56@gmail.com",
    "phone": "+998 20 000 88 39",
    "profile_image": None,
}


class UserProfileAPIView(APIView):
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get(self, request):
        try:
            profile = UserProfile.objects.first()
        except OperationalError:
            return Response(DEFAULT_PROFILE, status=status.HTTP_200_OK)

        if not profile:
            return Response(DEFAULT_PROFILE, status=status.HTTP_200_OK)
        return Response(UserProfileSerializer(profile, context={"request": request}).data)

    def put(self, request):
        profile = UserProfile.objects.first()
        if profile is None:
            serializer = UserProfileSerializer(data=request.data, context={"request": request})
        else:
            serializer = UserProfileSerializer(profile, data=request.data, context={"request": request})

        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ExtraInfoListAPIView(ListAPIView):
    queryset = ExtraInfo.objects.all()
    serializer_class = ExtraInfoSerializer


class ExportPDFAPIView(APIView):
    """Build a lightweight CV PDF directly from the stored portfolio data."""

    def get(self, request):
        profile = UserProfile.objects.first()
        skills = Skill.objects.all()
        projects = Project.objects.all()
        education_records = Education.objects.all()
        extra_items = ExtraInfo.objects.all()

        buffer = BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4
        left = 2 * cm
        y = height - 2 * cm

        def draw_line(text: str, font="Helvetica", size=11, gap=0.7 * cm):
            nonlocal y
            if y < 2 * cm:
                pdf.showPage()
                y = height - 2 * cm
            pdf.setFont(font, size)
            pdf.drawString(left, y, text)
            y -= gap

        pdf.setTitle("cv-export")
        draw_line("Curriculum Vitae", font="Helvetica-Bold", size=18, gap=1 * cm)

        if profile:
            draw_line(profile.full_name, font="Helvetica-Bold", size=14)
            draw_line(profile.title)
            draw_line(f"Email: {profile.email}")
            draw_line(f"Phone: {profile.phone}")
            draw_line(f"Location: {profile.location}")
            draw_line(f"GitHub: {profile.github}")
            draw_line("Bio:", font="Helvetica-Bold", size=12)
            for paragraph in profile.bio.splitlines() or [profile.bio]:
                for line in textwrap.wrap(paragraph, width=95) or [""]:
                    draw_line(line)
        else:
            draw_line("Profile information is not available yet.")

        draw_line("Skills", font="Helvetica-Bold", size=13, gap=0.9 * cm)
        if skills:
            for skill in skills:
                draw_line(f"- {skill.name} ({skill.level})")
        else:
            draw_line("No skills added yet.")

        draw_line("Projects", font="Helvetica-Bold", size=13, gap=0.9 * cm)
        if projects:
            for project in projects:
                draw_line(f"- {project.title}", font="Helvetica-Bold", size=11)
                for line in textwrap.wrap(project.description, width=95) or [""]:
                    draw_line(line)
                draw_line(f"Tech stack: {project.formatted_tech_stack}")
                draw_line(f"GitHub: {project.github_link}")
        else:
            draw_line("No projects added yet.")

        draw_line("Education", font="Helvetica-Bold", size=13, gap=0.9 * cm)
        if education_records:
            for item in education_records:
                draw_line(
                    f"- {item.school_name} | {item.direction} ({item.start_year} - {item.end_year})"
                )
        else:
            draw_line("No education records added yet.")

        if extra_items:
            draw_line("Extra Information", font="Helvetica-Bold", size=13, gap=0.9 * cm)
            for item in extra_items:
                draw_line(f"- {item.text}")

        pdf.showPage()
        pdf.save()
        buffer.seek(0)

        response = HttpResponse(buffer.getvalue(), content_type="application/pdf")
        response["Content-Disposition"] = 'attachment; filename="cv.pdf"'
        return response
