from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("apps", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="userprofile",
            name="telegram",
            field=models.URLField(blank=True, default=""),
        ),
    ]
