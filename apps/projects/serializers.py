from rest_framework import serializers

from apps.projects.models import Project


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = "__all__"
        read_only_fields = ("created_at",)

    def validate_title(self, value: str) -> str:
        if not value.strip():
            raise serializers.ValidationError("Project title cannot be blank.")
        return value.strip()

    def validate_tech_stack(self, value):
        if isinstance(value, str):
            items = [item.strip() for item in value.split(",") if item.strip()]
            if not items:
                raise serializers.ValidationError("Provide at least one technology.")
            return items
        if isinstance(value, list) and not value:
            raise serializers.ValidationError("Provide at least one technology.")
        return value
