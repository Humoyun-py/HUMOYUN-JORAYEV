from django.contrib import admin

from apps.users.models import ExtraInfo, UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("full_name", "title", "email", "location")
    search_fields = ("full_name", "title", "email", "location")


@admin.register(ExtraInfo)
class ExtraInfoAdmin(admin.ModelAdmin):
    list_display = ("id", "text")
    search_fields = ("text",)
