from rest_framework import serializers

from apps.education.models import Education, Language


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = "__all__"

    def validate(self, attrs):
        if attrs["end_year"] < attrs["start_year"]:
            raise serializers.ValidationError("End year cannot be earlier than start year.")
        return attrs


class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = "__all__"

    def validate_name(self, value: str) -> str:
        if not value.strip():
            raise serializers.ValidationError("Language name cannot be blank.")
        return value.strip()

    def validate_level(self, value: str) -> str:
        if not value.strip():
            raise serializers.ValidationError("Language level cannot be blank.")
        return value.strip()
