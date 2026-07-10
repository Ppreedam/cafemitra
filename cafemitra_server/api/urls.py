from django.urls import re_path

from . import views

urlpatterns = [
    re_path(r"^check/server/status/?$", views.check_server_status),
    re_path(r"^contact-us/?$", views.contact_message),
    re_path(r"^auth/register/?$", views.register_user),
    re_path(r"^auth/login/?$", views.login_user),
    re_path(r"^auth/refresh/?$", views.refresh_token),
    re_path(r"^auth/verify-email/?$", views.verify_email),
    re_path(r"^auth/resend-verification/?$", views.resend_verification),
    re_path(r"^auth/request-password-reset/?$", views.request_password_reset),
    re_path(r"^auth/reset-password/?$", views.reset_password),
    re_path(r"^auth/change-password/?$", views.change_password),
    re_path(r"^auth/delete-account/?$", views.delete_account_by_email),
    re_path(r"^profile/?$", views.profile),
    re_path(r"^wallet/?$", views.wallet),
    re_path(r"^wallet/withdraw/?$", views.request_withdrawal),
    re_path(r"^pricing-settings/?$", views.pricing_settings),
    re_path(r"^orders/?$", views.order_history),
    re_path(r"^orders/(?P<order_id>[0-9]+)/approve-cash/?$", views.approve_cash_order),
    re_path(r"^orders/(?P<order_id>[0-9]+)/reject-cash/?$", views.reject_cash_order),
    re_path(r"^public-shop/(?P<code>[^/]+)/?$", views.public_shop_by_code),
    re_path(r"^public-shop/(?P<code>[^/]+)/orders/?$", views.public_print_order),
    re_path(r"^public-orders/(?P<order_id>[0-9]+)/?$", views.public_order_status),
    re_path(r"^public-orders/(?P<order_id>[0-9]+)/mark-paid/?$", views.public_mark_order_paid),
    re_path(r"^public-orders/(?P<order_id>[0-9]+)/check-upi-payment/?$", views.public_check_upi_payment),
    re_path(r"^public-orders/(?P<order_id>[0-9]+)/delete-document/?$", views.public_delete_order_document),
    re_path(r"^agent/jobs/?$", views.agent_jobs),
    re_path(r"^agent/jobs/(?P<order_id>[0-9]+)/status/?$", views.agent_job_status),
]
