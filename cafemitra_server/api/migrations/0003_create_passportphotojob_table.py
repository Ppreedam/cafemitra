# api_passportphoto_job was defined in 0001_initial's state but the actual
# CREATE TABLE never ran against the live database (it's absent from
# information_schema while every other 0001_initial table exists) - this
# migration performs only the missing database operation, no state change.

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_printorder_attire_gemini'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[],
            database_operations=[
                migrations.CreateModel(
                    name='PassportPhotoJob',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('username', models.CharField(blank=True, max_length=255)),
                        ('self_agent', models.BooleanField(db_column='selfagent', default=True)),
                        ('img_path', models.ImageField(db_column='imgpath', upload_to='passportsizephoto/%Y/%m/%d/')),
                        ('prompt', models.CharField(blank=True, max_length=255)),
                        ('final_img_path', models.CharField(blank=True, db_column='finalimgpath', max_length=255)),
                        ('is_printed', models.BooleanField(default=False)),
                        ('status', models.CharField(default='pending', max_length=20)),
                        ('error_message', models.TextField(blank=True)),
                        ('created_at', models.DateTimeField(auto_now_add=True, db_column='createdAt')),
                        ('updated_at', models.DateTimeField(auto_now=True, db_column='updatedAt')),
                        ('user', models.ForeignKey(db_column='userid', on_delete=django.db.models.deletion.CASCADE, related_name='passport_photo_jobs', to=settings.AUTH_USER_MODEL)),
                    ],
                    options={
                        'db_table': 'api_passportphoto_job',
                        'ordering': ['-created_at'],
                        'indexes': [models.Index(fields=['user', 'created_at'], name='api_passpor_userid_1f8859_idx')],
                    },
                ),
            ],
        ),
    ]
