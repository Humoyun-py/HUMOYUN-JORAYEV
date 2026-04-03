from django.db import models


class Education(models.Model):
    school_name = models.CharField(max_length=255)
    direction = models.CharField(max_length=255)
    start_year = models.IntegerField()
    end_year = models.IntegerField()

    class Meta:
        ordering = ["-end_year", "-start_year"]

    def __str__(self) -> str:
        return f"{self.school_name} - {self.direction}"


class Language(models.Model):
    name = models.CharField(max_length=100)
    level = models.CharField(max_length=100)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return f"{self.name} ({self.level})"
