from rest_framework import serializers

from apps.users.models import ExtraInfo, UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = "__all__"

    def validate_full_name(self, value: str) -> str:
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Full name must contain at least 3 characters.")
        return value.strip()

    def validate_phone(self, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) < 7:
            raise serializers.ValidationError("Phone number looks too short.")
        return cleaned

    def validate_telegram(self, value: str) -> str:
        return value.strip()


class ExtraInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExtraInfo
        fields = "__all__"

    def validate_text(self, value: str) -> str:
        if not value.strip():
            raise serializers.ValidationError("Text field cannot be blank.")
        return value.strip()
