from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0005_printorder_token_id_printorder_token_number_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="authtoken",
            name="access_expires_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="authtoken",
            name="refresh_key",
            field=models.CharField(blank=True, max_length=128, null=True, unique=True),
        ),
        migrations.AddField(
            model_name="authtoken",
            name="refresh_expires_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
