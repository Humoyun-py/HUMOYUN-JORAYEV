from django.db import models


class Project(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    tech_stack = models.JSONField(default=list, blank=True)
    github_link = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.title

    @property
    def formatted_tech_stack(self) -> str:
        if isinstance(self.tech_stack, list):
            return ", ".join(self.tech_stack)
        return str(self.tech_stack)
