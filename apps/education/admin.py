from django.contrib import admin

from apps.education.models import Education, Language


@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ("school_name", "direction", "start_year", "end_year")
    search_fields = ("school_name", "direction")


@admin.register(Language)
class LanguageAdmin(admin.ModelAdmin):
    list_display = ("name", "level")
    search_fields = ("name", "level")
