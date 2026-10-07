from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0052_blogarticle'),
    ]

    operations = [
        migrations.AddField(
            model_name='blogarticle',
            name='tags',
            field=models.JSONField(blank=True, default=list, help_text='List of tag strings'),
        ),
        migrations.AddField(
            model_name='blogarticle',
            name='focus_keywords',
            field=models.JSONField(blank=True, default=list, help_text='List of SEO focus keyword strings'),
        ),
    ]
