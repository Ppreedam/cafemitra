from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0019_seed_resume_builder_tool_pricing'),
    ]

    operations = [
        migrations.AddField(
            model_name='printorder',
            name='resume_data',
            field=models.JSONField(blank=True, null=True),
        ),
    ]
