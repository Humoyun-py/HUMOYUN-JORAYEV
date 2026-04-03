from django.core.exceptions import ValidationError
from django.db import models


class UserProfile(models.Model):
    full_name = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    bio = models.TextField()
    phone = models.CharField(max_length=50)
    email = models.EmailField()
    location = models.CharField(max_length=255)
    github = models.URLField()
    profile_image = models.ImageField(upload_to="profile/", blank=True, null=True)

    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profile"

    def __str__(self) -> str:
        return self.full_name

    def save(self, *args, **kwargs):
        if not self.pk and UserProfile.objects.exists():
            raise ValidationError("Only one user profile instance is allowed.")
        return super().save(*args, **kwargs)


class ExtraInfo(models.Model):
    text = models.TextField()

    class Meta:
        verbose_name = "Extra Information"
        verbose_name_plural = "Extra Information"

    def __str__(self) -> str:
        return self.text[:50]
