from django.db import migrations


def seed_tool_visibility(apps, schema_editor):
    ToolVisibility = apps.get_model("api", "ToolVisibility")

    tools = [
        ("auto_document_print", "PrintPilot"),
        ("resume_builder", "Resume Builder"),
        ("biodata_maker", "Biodata Maker"),
        ("passport_photo", "Passport Photo"),
        ("id_card_maker", "ID Card Maker"),
        ("id_card_print", "ID Card Print"),
    ]
    for tool_key, label in tools:
        ToolVisibility.objects.get_or_create(tool_key=tool_key, defaults={"label": label, "is_enabled": True})


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0024_toolvisibility'),
    ]

    operations = [
        migrations.RunPython(seed_tool_visibility, noop_reverse),
    ]
