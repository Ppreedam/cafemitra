from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0021_seed_more_resume_builder_tool_pricing'),
    ]

    operations = [
        migrations.AddField(
            model_name='printorder',
            name='biodata_data',
            field=models.JSONField(blank=True, null=True),
        ),
    ]
