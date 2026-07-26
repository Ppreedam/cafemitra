from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_migrate_passportphotojob_to_printorder'),
    ]

    operations = [
        migrations.DeleteModel(
            name='PassportPhotoJob',
        ),
    ]
