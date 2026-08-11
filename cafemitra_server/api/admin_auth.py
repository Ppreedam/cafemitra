from django.http import JsonResponse

from .admin_roles import SECTION_ROLES, get_admin_role, role_allows_section
from .views import auth_user

__all__ = ["SECTION_ROLES", "get_admin_role", "require_admin", "require_section"]


def require_admin(request):
    """Resolve the caller and confirm they're platform staff.

    Returns (user, None) on success, or (None, JsonResponse) on failure -
    callers should `return err` immediately when err is not None. Kept
    separate from `auth_user` in views.py: every /api/admin/... route needs
    both "is this a valid token" AND "is this account platform staff", and
    bundling both checks here means that can't be forgotten on a new view.
    """
    user = auth_user(request)
    if not user:
        return None, JsonResponse({"message": "Unauthorized."}, status=401)
    if not user.is_staff:
        return None, JsonResponse({"message": "Not authorized for admin access."}, status=403)
    return user, None


def require_section(request, section):
    """require_admin() plus a role check for one dashboard section - use on
    every endpoint that belongs to a section restricted in SECTION_ROLES.
    super_admin always passes; other roles need to be in that section's set.
    """
    user, err = require_admin(request)
    if err:
        return None, err
    if not role_allows_section(user, section):
        return None, JsonResponse({"message": "Your admin role does not have access to this section."}, status=403)
    return user, None
