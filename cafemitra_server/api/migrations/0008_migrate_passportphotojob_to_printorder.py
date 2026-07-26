import os

from django.db import migrations, models


def cafe_code_for_user_id(user_id):
    return f"CM{int(user_id):04d}"


def next_order_token(PrintOrder, user_id):
    latest = PrintOrder.objects.filter(user_id=user_id).aggregate(
        max_token=models.Max("token_number")
    )["max_token"] or 0
    token_number = int(latest) + 1
    return token_number, f"{cafe_code_for_user_id(user_id)}-T{token_number:03d}"


def migrate_passport_jobs_forward(apps, schema_editor):
    PassportPhotoJob = apps.get_model("api", "PassportPhotoJob")
    PrintOrder = apps.get_model("api", "PrintOrder")
    ServicePricing = apps.get_model("api", "ServicePricing")

    for job in PassportPhotoJob.objects.all().iterator():
        if job.order_id:
            order = PrintOrder.objects.filter(id=job.order_id).first()
            if not order:
                continue
            order.passport_prompt = job.prompt
            if not order.gemini_photo and job.final_img_path:
                order.gemini_photo = job.final_img_path
            order.photo_status = job.status
            order.photo_error_message = job.error_message
            order.photo_updated_at = job.updated_at
            order.save(update_fields=[
                "passport_prompt", "gemini_photo", "photo_status", "photo_error_message",
                "photo_updated_at",
            ])
            continue

        # Orphan job (owner's standalone "Passport Photo Maker" tool - self_agent=True,
        # never had a linked PrintOrder). Synthesize one so it shows up in Order History.
        pricing = ServicePricing.objects.filter(user_id=job.user_id, service_key="passport_photo").first()
        service_name = pricing.service_name if pricing else "Passport Size Photo"
        token_number, token_id = next_order_token(PrintOrder, job.user_id)

        new_order = PrintOrder.objects.create(
            user_id=job.user_id,
            shop_code=cafe_code_for_user_id(job.user_id),
            token_number=token_number,
            token_id=token_id,
            service_key="passport_photo",
            service_name=service_name,
            price_item_id=job.price_item_id,
            price_label=job.price_label,
            rate=job.rate,
            pages=1,
            copies=1,
            total_amount=job.rate,
            payment_mode="No Payment",
            payment_status="no_payment",
            status="queued",
            document=job.img_path.name if job.img_path else "",
            original_filename=os.path.basename(job.img_path.name) if job.img_path else "",
            passport_prompt=job.prompt,
            photo_status=job.status,
            photo_error_message=job.error_message,
            gemini_photo=job.final_img_path or "",
        )
        PrintOrder.objects.filter(pk=new_order.pk).update(
            created_at=job.created_at, photo_updated_at=job.updated_at,
        )


def migrate_passport_jobs_backward(apps, schema_editor):
    # One-directional data migration - the synthesized orders and copied fields are
    # left in place on reverse; nothing to undo without risking data loss.
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_printorder_photo_fields'),
    ]

    operations = [
        migrations.RunPython(migrate_passport_jobs_forward, migrate_passport_jobs_backward),
    ]
