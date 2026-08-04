import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0008_merge_20260802_0016"),
    ]

    operations = [
        # The physical AuthToken.user_id column carries a stale UNIQUE constraint
        # from before this model allowed multiple concurrent tokens per user (see
        # issue_tokens() in api/views.py), but Django's migration history never
        # recorded that constraint, so a plain AlterField is a no-op against it.
        # SeparateDatabaseAndState first tells Django's state the field IS unique
        # (matching the real DB), then the AlterField below drops it for real.
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AlterField(
                    model_name="authtoken",
                    name="user",
                    field=models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="api_tokens",
                        to=settings.AUTH_USER_MODEL,
                        unique=True,
                    ),
                ),
            ],
            database_operations=[],
        ),
        migrations.AlterField(
            model_name="authtoken",
            name="user",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="api_tokens",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
