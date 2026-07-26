from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_passportphotojob_order'),
    ]

    operations = [
        migrations.AddField(
            model_name='printorder',
            name='passport_prompt',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AddField(
            model_name='printorder',
            name='photo_status',
            field=models.CharField(blank=True, default='', max_length=20),
        ),
        migrations.AddField(
            model_name='printorder',
            name='photo_error_message',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AddField(
            model_name='printorder',
            name='photo_updated_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
