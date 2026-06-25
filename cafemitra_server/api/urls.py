from django.urls import path

from . import views

urlpatterns = [
    path("auth/register/", views.register_user),
    path("auth/login/", views.login_user),
    path("auth/refresh/", views.refresh_token),
    path("auth/change-password/", views.change_password),
    path("profile/", views.profile),
    path("pricing-settings/", views.pricing_settings),
    path("orders/", views.order_history),
    path("orders/<int:order_id>/approve-cash/", views.approve_cash_order),
    path("orders/<int:order_id>/reject-cash/", views.reject_cash_order),
    path("public-shop/<str:code>/", views.public_shop_by_code),
    path("public-shop/<str:code>/orders/", views.public_print_order),
    path("public-orders/<int:order_id>/mark-paid/", views.public_mark_order_paid),
    path("agent/jobs/", views.agent_jobs),
    path("agent/jobs/<int:order_id>/status/", views.agent_job_status),
]
