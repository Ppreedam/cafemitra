from django.urls import path

from . import views

urlpatterns = [
    path("check/server/status/", views.check_server_status),
    path("auth/register/", views.register_user),
    path("auth/login/", views.login_user),
    path("auth/refresh/", views.refresh_token),
    path("auth/verify-email/", views.verify_email),
    path("auth/resend-verification/", views.resend_verification),
    path("auth/request-password-reset/", views.request_password_reset),
    path("auth/reset-password/", views.reset_password),
    path("auth/change-password/", views.change_password),
    path("profile/", views.profile),
    path("wallet/", views.wallet),
    path("wallet/withdraw/", views.request_withdrawal),
    path("pricing-settings/", views.pricing_settings),
    path("orders/", views.order_history),
    path("orders/<int:order_id>/approve-cash/", views.approve_cash_order),
    path("orders/<int:order_id>/reject-cash/", views.reject_cash_order),
    path("public-shop/<str:code>/", views.public_shop_by_code),
    path("public-shop/<str:code>/orders/", views.public_print_order),
    path("public-orders/<int:order_id>/", views.public_order_status),
    path("public-orders/<int:order_id>/mark-paid/", views.public_mark_order_paid),
    path("public-orders/<int:order_id>/check-upi-payment/", views.public_check_upi_payment),
    path("public-orders/<int:order_id>/delete-document/", views.public_delete_order_document),
    path("agent/jobs/", views.agent_jobs),
    path("agent/jobs/<int:order_id>/status/", views.agent_job_status),
]
