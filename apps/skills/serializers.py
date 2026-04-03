from rest_framework import serializers

from apps.skills.models import Skill


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = "__all__"

    def validate_name(self, value: str) -> str:
        if not value.strip():
            raise serializers.ValidationError("Skill name cannot be blank.")
        return value.strip()
