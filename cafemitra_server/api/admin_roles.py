"""Role/section definitions - kept dependency-free (only imports .models) so
both admin_auth.py (which imports from views.py) and views.py itself (for the
Leads CRM endpoints, which live in views.py, not admin_views.py) can import
this without a circular import.
"""

from .models import AdminRole

SECTION_ROLES = {
    # super_admin can always access every section - it's added to each set
    # below at lookup time rather than repeated in every entry.
    "shops": {AdminRole.ROLE_FINANCE, AdminRole.ROLE_SUPPORT},
    "orders": {AdminRole.ROLE_SUPPORT},
    "wallet": {AdminRole.ROLE_FINANCE},
    "agents": {AdminRole.ROLE_FINANCE, AdminRole.ROLE_SALES},
    "support": {AdminRole.ROLE_SUPPORT},
    "leads": {AdminRole.ROLE_SALES},
    "print_agent": {AdminRole.ROLE_SUPPORT},
    "analytics": {AdminRole.ROLE_FINANCE, AdminRole.ROLE_SALES},
    "activity_log": set(),
    "security": set(),
}


def get_admin_role(user):
    role = getattr(user, "admin_role", None)
    return role.role if role else AdminRole.ROLE_SUPER_ADMIN


def role_allows_section(user, section):
    role = get_admin_role(user)
    if role == AdminRole.ROLE_SUPER_ADMIN:
        return True
    return role in SECTION_ROLES.get(section, set())
