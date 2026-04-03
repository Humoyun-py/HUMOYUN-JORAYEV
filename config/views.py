"""Views for the portfolio site and SEO-related endpoints."""

from __future__ import annotations

import json
import os

from django.http import HttpResponse
from django.shortcuts import render
from django.templatetags.static import static
from django.utils import timezone

from apps.projects.models import Project
from apps.skills.models import Skill
from apps.users.models import UserProfile


DEFAULT_PROFILE = {
    "full_name": "Humoyun Jo'rayev",
    "title": "Python Backend Developer",
    "bio": (
        "Humoyun Jo'rayev Toshkentdagi Python backend developer bo'lib, "
        "Django, Django REST Framework, REST API, Telegram bot, SQLite va "
        "PostgreSQL bilan ishlaydi."
    ),
    "location": "Toshkent, O'zbekiston",
    "github": "https://github.com/Humoyun-py",
    "email": "freif56@gmail.com",
    "phone": "+998 20 000 88 39",
}

GOOGLE_VERIFICATION_FILE = "google455ae077a0eb0277.html"
GOOGLE_VERIFICATION_META = "google455ae077a0eb0277"
GOOGLE_VERIFICATION_CONTENT = (
    "google-site-verification: google455ae077a0eb0277.html"
)


def _site_url(request) -> str:
    configured = os.getenv("SITE_URL", "").strip()
    if configured:
        return configured.rstrip("/")
    return request.build_absolute_uri("/").rstrip("/")


def _profile_payload() -> dict[str, str]:
    profile = UserProfile.objects.first()
    if not profile:
        return DEFAULT_PROFILE.copy()

    return {
        "full_name": profile.full_name or DEFAULT_PROFILE["full_name"],
        "title": profile.title or DEFAULT_PROFILE["title"],
        "bio": profile.bio or DEFAULT_PROFILE["bio"],
        "location": profile.location or DEFAULT_PROFILE["location"],
        "github": profile.github or DEFAULT_PROFILE["github"],
        "email": profile.email or DEFAULT_PROFILE["email"],
        "phone": profile.phone or DEFAULT_PROFILE["phone"],
    }


def _keyword_terms(skill_names: list[str]) -> list[str]:
    base_terms = [
        "Humoyun Jo'rayev",
        "Humoyun Jorayev",
        "Humoyun Jo'rayev backend developer",
        "Humoyun Jo'rayev Python developer",
        "Humoyun Jo'rayev Django developer",
        "Python backend developer Uzbekistan",
        "Django developer Tashkent",
        "Django REST Framework developer",
        "REST API developer Uzbekistan",
        "Telegram bot developer Python",
        "backend dasturchi Toshkent",
        "Python dasturchi O'zbekiston",
        "portfolio website backend developer",
        "SQLite developer",
        "PostgreSQL developer",
    ]
    return base_terms + skill_names


def home(request):
    """Render the main portfolio page with SEO-friendly server metadata."""

    profile = _profile_payload()
    skill_names = list(Skill.objects.values_list("name", flat=True)[:8])
    project_titles = list(Project.objects.values_list("title", flat=True)[:5])
    site_url = _site_url(request)
    canonical_url = f"{site_url}/"
    image_url = request.build_absolute_uri(static("image/image.png"))
    keyword_terms = _keyword_terms(skill_names)
    meta_title = (
        f"{profile['full_name']} | Python Backend Developer | Django Developer | REST API Developer"
    )
    meta_description = (
        f"{profile['full_name']} - {profile['location']}dagi Python backend developer. "
        f"Django, Django REST Framework, REST API, Telegram bot, SQLite va PostgreSQL bilan ishlaydi."
    )
    structured_data = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Person",
                "name": profile["full_name"],
                "jobTitle": profile["title"],
                "description": meta_description,
                "url": canonical_url,
                "image": image_url,
                "email": profile["email"],
                "telephone": profile["phone"],
                "sameAs": [profile["github"]],
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": profile["location"],
                    "addressCountry": "UZ",
                },
                "knowsAbout": keyword_terms[:12],
            },
            {
                "@type": "WebSite",
                "name": f"{profile['full_name']} Portfolio",
                "url": canonical_url,
                "inLanguage": "uz",
            },
        ],
    }

    return render(
        request,
        "index.html",
        {
            "seo_title": meta_title,
            "seo_description": meta_description,
            "seo_keywords": ", ".join(keyword_terms),
            "seo_author": profile["full_name"],
            "seo_canonical": canonical_url,
            "seo_image": image_url,
            "seo_site_name": f"{profile['full_name']} Portfolio",
            "seo_locale": "uz_UZ",
            "seo_type": "website",
            "google_site_verification": os.getenv(
                "GOOGLE_SITE_VERIFICATION", GOOGLE_VERIFICATION_META
            ).strip(),
            "structured_data_json": json.dumps(structured_data, ensure_ascii=False),
            "seo_project_titles": project_titles,
            "seo_skill_names": skill_names,
            "seo_profile": profile,
        },
    )


def google_site_verification(request):
    """Serve the exact HTML verification file Google expects."""

    return HttpResponse(
        GOOGLE_VERIFICATION_CONTENT,
        content_type="text/html; charset=utf-8",
    )


def robots_txt(request):
    """Expose robots.txt for search engine crawlers."""

    site_url = _site_url(request)
    content = (
        "User-agent: *\n"
        "Allow: /\n\n"
        f"Sitemap: {site_url}/sitemap.xml\n"
    )
    return HttpResponse(content, content_type="text/plain; charset=utf-8")


def sitemap_xml(request):
    """Expose a tiny sitemap for Search Console submission."""

    site_url = _site_url(request)
    lastmod = timezone.now().date().isoformat()
    content = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        "  <url>\n"
        f"    <loc>{site_url}/</loc>\n"
        f"    <lastmod>{lastmod}</lastmod>\n"
        "    <changefreq>weekly</changefreq>\n"
        "    <priority>1.0</priority>\n"
        "  </url>\n"
        "</urlset>\n"
    )
    return HttpResponse(content, content_type="application/xml; charset=utf-8")
