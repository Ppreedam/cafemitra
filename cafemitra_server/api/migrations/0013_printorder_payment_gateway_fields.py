from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("api", "0012_rename_api_contact_created_9c3435_idx_api_contact_created_e89a17_idx_and_more")]

    operations = [
        migrations.AddField(model_name="printorder", name="payment_gateway", field=models.CharField(blank=True, max_length=40)),
        migrations.AddField(model_name="printorder", name="gateway_order_id", field=models.CharField(blank=True, max_length=120)),
        migrations.AddField(model_name="printorder", name="gateway_payment_id", field=models.CharField(blank=True, max_length=120)),
    ]
