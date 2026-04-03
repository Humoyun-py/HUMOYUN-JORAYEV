from django.contrib import admin

from apps.projects.models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "github_link", "created_at")
    search_fields = ("title", "description")
    ordering = ("-created_at",)
