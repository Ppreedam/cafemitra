from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0046_printorder_duplex'),
    ]

    operations = [
        migrations.AddField(
            model_name='shopprofile',
            name='duplex_available',
            field=models.BooleanField(db_default=False, default=False),
        ),
    ]
