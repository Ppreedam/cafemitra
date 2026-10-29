from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0006_crop_filter_values"),
    ]

    operations = [
        migrations.AddField(
            model_name="withdrawalrequest",
            name="fee_debited",
            field=models.BooleanField(default=False),
        ),
    ]
