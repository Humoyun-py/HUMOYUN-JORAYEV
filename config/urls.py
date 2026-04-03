"""Root URL configuration for the portfolio backend."""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from config.views import google_site_verification, home, robots_txt, sitemap_xml


urlpatterns = [
    path("", home, name="home"),
    path(
        "google455ae077a0eb0277.html",
        google_site_verification,
        name="google-site-verification",
    ),
    path("robots.txt", robots_txt, name="robots-txt"),
    path("sitemap.xml", sitemap_xml, name="sitemap-xml"),
    path("admin/", admin.site.urls),
    path("api/", include("apps.users.urls")),
    path("api/", include("apps.skills.urls")),
    path("api/", include("apps.projects.urls")),
    path("api/", include("apps.education.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
