from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0045_seed_family_passport_photo'),
    ]

    operations = [
        migrations.AddField(
            model_name='printorder',
            name='duplex',
            field=models.BooleanField(db_default=False, default=False),
        ),
        migrations.AddField(
            model_name='printorder',
            name='duplex_edge',
            field=models.CharField(blank=True, db_default='long', default='long', max_length=8),
        ),
    ]
