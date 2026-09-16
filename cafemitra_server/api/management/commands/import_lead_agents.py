import json

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction

from api.models import LeadAgent


def state_label_from_folder(folder_name):
    """"jharkhand" -> "Jharkhand", "Uttar_Pradesh" -> "Uttar Pradesh" - matches
    the folder-naming scheme admin_lead_import() uses when it saves an
    uploaded state's files, so a folder created either way re-imports with
    the same LeadAgent.state value.
    """
    return folder_name.replace("_", " ").strip().title()


class Command(BaseCommand):
    help = (
        "Rebuild LeadAgent from every agents_data/<State>/<Division>.json - wipes "
        "all existing rows and reloads every state/division/pincode/agent found on "
        "disk. Re-run whenever the agents_data JSON files change outside the admin "
        "UI's Leads import."
    )

    def handle(self, *args, **options):
        data_root = settings.BASE_DIR.parent / "agents_data"
        rows = []

        for state_dir in sorted(p for p in data_root.iterdir() if p.is_dir()):
            state_label = state_label_from_folder(state_dir.name)

            for path in sorted(state_dir.glob("*.json")):
                if path.name.startswith("_"):
                    continue
                with open(path, encoding="utf-8") as f:
                    data = json.load(f)

                division = data.get("division")
                if not division:
                    continue

                for pincode, pin_data in (data.get("pincodes") or {}).items():
                    for agent in pin_data.get("agents") or []:
                        rows.append(
                            LeadAgent(
                                state=state_label,
                                division=division,
                                pincode=pincode,
                                sno=agent.get("SNo.", ""),
                                agent_id=agent.get("Agent ID", ""),
                                company=agent.get("Company", ""),
                                agent_name=agent.get("Agent Name", ""),
                                address=agent.get("Address", ""),
                                city=agent.get("City", ""),
                                mobile=agent.get("Mobile No.", ""),
                            )
                        )

        with transaction.atomic():
            LeadAgent.objects.all().delete()
            LeadAgent.objects.bulk_create(rows, batch_size=1000)

        self.stdout.write(self.style.SUCCESS(f"Imported {len(rows)} lead agents."))
