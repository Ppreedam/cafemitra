from .models import AdminActivityLog


def log_admin_activity(admin_user, action, target_type="", target_id="", detail=""):
    AdminActivityLog.objects.create(
        admin_user=admin_user,
        action=action,
        target_type=target_type,
        target_id=str(target_id),
        detail=detail,
    )
