"""Expose admin registrations from the feature modules.

The project currently installs the top-level ``apps`` package, so Django's
admin autodiscovery only imports ``apps.admin``. Importing the feature admin
modules here makes their model registrations visible in the admin site.
"""

from apps.education.admin import *  # noqa: F403
from apps.projects.admin import *  # noqa: F403
from apps.skills.admin import *  # noqa: F403
from apps.users.admin import *  # noqa: F403
