from django.db import migrations, models


class Migration(migrations.Migration):

    # Also merges the two 0044 branches (pooler_node and the
    # family_photo_inputs -> 0047 chain) back into one leaf.
    dependencies = [
        ('api', '0044_pooler_node'),
        ('api', '0047_shopprofile_duplex_available'),
    ]

    operations = [
        migrations.AddField(
            model_name='printorder',
            name='profile_name',
            field=models.CharField(blank=True, default=None, max_length=120, null=True),
        ),
    ]
