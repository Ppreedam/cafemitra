from django.urls import re_path

from . import views

urlpatterns = [
    # --- System -------------------------------------------------------
    re_path(r"^check/server/status/?$", views.check_server_status),  # GET  health check, returns {status, message}
    re_path(r"^contact-us/?$", views.contact_message),  # POST create a contact-us message (name/email/phone/subject/message)

    # --- Tools (standalone utilities, no auth) -------------------------
    re_path(r"^tools/ai-upscale-image/?$", views.ai_upscale_image),  # POST upscale an image via configured AI provider, returns image binary
    re_path(r"^tools/extract-pdf-text/?$", views.extract_pdf_text),  # POST extract text per page from an uploaded PDF
    re_path(r"^tools/remove-image-background/?$", views.remove_image_background),  # POST strip background from an uploaded image (optional enhance=false to skip edge cleanup)
    re_path(r"^tools/enhance-background-image/?$", views.enhance_background_image),  # POST refine edges/remove color halo from an already-transparent PNG
    re_path(r"^tools/website-to-image/?$", views.website_to_image),  # POST screenshot a public URL via configured provider
    re_path(r"^tools/detect-faces/?$", views.detect_faces),  # POST return normalized face bounding boxes for an uploaded image

    # --- Auth -----------------------------------------------------------
    re_path(r"^auth/register/?$", views.register_user),  # POST create account, sends email verification link
    re_path(r"^auth/login/?$", views.login_user),  # POST authenticate, issues a fresh access/refresh token pair
    re_path(r"^auth/refresh/?$", views.refresh_token),  # POST exchange a refresh token for a new access token
    re_path(r"^auth/verify-email/?$", views.verify_email),  # POST activate account from emailed verification token
    re_path(r"^auth/resend-verification/?$", views.resend_verification),  # POST resend the verification email
    re_path(r"^auth/request-password-reset/?$", views.request_password_reset),  # POST email a password reset link
    re_path(r"^auth/reset-password/?$", views.reset_password),  # POST set a new password from a reset token
    re_path(r"^auth/change-password/?$", views.change_password),  # POST change password while logged in
    re_path(r"^auth/delete-account/?$", views.delete_account_by_email),  # POST/DELETE permanently delete an account and its files

    # --- Profile ----------------------------------------------------------
    re_path(r"^profile/?$", views.profile),  # GET/PUT fetch or update the owner's user + shop profile

    # --- Wallet -----------------------------------------------------------
    re_path(r"^wallet/config/?$", views.wallet_config),  # GET public signup/referral bonus, grace limits, and billable tool prices
    re_path(r"^wallet/?$", views.wallet),  # GET balance, collection summary, limits, and paginated transaction ledger
    re_path(r"^wallet/withdraw/?$", views.request_withdrawal),  # POST request a withdrawal against the withdrawable balance

    # --- Pricing ----------------------------------------------------------
    re_path(r"^pricing-settings/?$", views.pricing_settings),  # GET/PUT per-service pricing (auto_document_print, passport_photo)

    # --- Owner Orders (authenticated cafe owner) ---------------------------
    re_path(r"^orders/?$", views.order_history),  # GET latest 100 orders for the owner across all services
    re_path(r"^orders/(?P<order_id>[0-9]+)/?$", views.order_detail),  # GET a single order owned by the caller
    re_path(r"^orders/(?P<order_id>[0-9]+)/mark-paid/?$", views.mark_passport_order_paid),  # POST mark an unpaid cash passport-photo order as paid
    re_path(r"^orders/(?P<order_id>[0-9]+)/approve-cash/?$", views.approve_cash_order),  # POST approve a cash-counter order awaiting approval
    re_path(r"^orders/(?P<order_id>[0-9]+)/reject-cash/?$", views.reject_cash_order),  # POST reject a cash-counter order
    re_path(r"^orders/(?P<order_id>[0-9]+)/file/?$", views.order_document),  # GET download the order's original uploaded document

    # --- Public Shop And Orders (anonymous, customer-facing) ---------------
    re_path(r"^public-shop/(?P<code>[^/]+)/?$", views.public_shop_by_code),  # GET shop profile + services by cafe code
    re_path(r"^public-shop/(?P<code>[^/]+)/orders/?$", views.public_print_order),  # POST create a print/passport-photo order for a shop
    re_path(r"^public-orders/(?P<order_id>[0-9]+)/?$", views.public_order_status),  # GET current status of a public order
    re_path(r"^public-orders/(?P<order_id>[0-9]+)/check-upi-payment/?$", views.public_check_upi_payment),  # POST poll UPI collect status for an order
    re_path(r"^public-orders/(?P<order_id>[0-9]+)/razorpay/order/?$", views.public_create_razorpay_order),  # POST create a Razorpay order for online payment
    re_path(r"^public-orders/(?P<order_id>[0-9]+)/razorpay/verify/?$", views.public_verify_razorpay_payment),  # POST verify a completed Razorpay payment signature
    re_path(r"^public-orders/(?P<order_id>[0-9]+)/delete-document/?$", views.public_delete_order_document),  # POST customer deletes their document once printed

    # --- Passport Photo (authenticated wizard flow) -------------------------
    re_path(r"^save-raw-passport-photo/?$", views.save_raw_passport_photo),  # POST upload raw photo + AI prompt, creates the order
    re_path(r"^api-passport-photo-check/?$", views.check_passport_photo),  # POST poll for the AI-generated final passport photo

    # --- Agent Passport Jobs (desktop Print Agent, AI photo queue) ---------
    re_path(r"^agent/passport-jobs/?$", views.agent_passport_jobs),  # GET list pending passport-photo AI jobs
    re_path(r"^agent/passport-jobs/(?P<job_id>[0-9]+)/claim/?$", views.claim_passport_job),  # POST atomically claim a pending job
    re_path(r"^agent/passport-jobs/(?P<job_id>[0-9]+)/complete/?$", views.complete_passport_job),  # POST upload final photo, or report failure

    # --- Agent (desktop Print Agent, print queue) ---------------------------
    re_path(r"^agent/jobs/?$", views.agent_jobs),  # GET list queued/approved print jobs (excludes passport_photo)
    re_path(r"^agent/jobs/(?P<order_id>[0-9]+)/status/?$", views.agent_job_status),  # POST update a job's print status (printing/printed/failed)
    re_path(r"^agent/jobs/(?P<order_id>[0-9]+)/gemini-photo/?$", views.agent_upload_gemini_photo),  # POST attach an AI-generated photo to any order

    # --- Agent Update (anonymous auto-update endpoints) ---------------------
    re_path(r"^agent/version-check/?$", views.agent_version_check),  # GET latest available agent version (plain text)
    re_path(r"^agent/update/?$", views.agent_update_download),  # GET download the latest agent zip package

    # --- Google Places (no auth) --------------------------------------------
    re_path(r"^google-places/?$", views.google_places),  # GET list (optional ?extracted_status=true/false/all) / POST create (unique name)
    re_path(r"^google-places/(?P<place_id>[0-9]+)/?$", views.google_place_detail),  # PUT/PATCH mark extracted_status=true, DELETE remove

    # --- Google Place Details (full scraped record, no auth) ----------------
    re_path(r"^google-place-details/?$", views.google_place_details),  # GET list (optional ?name=, ?status=, ?follow_up= search/filter) / POST create (unique maps_url)
    re_path(r"^google-place-details/(?P<detail_id>[0-9]+)/?$", views.google_place_detail_item),  # GET one, PUT/PATCH update fields, DELETE remove
    re_path(r"^google-place-details/(?P<detail_id>[0-9]+)/activities/?$", views.lead_activities),  # GET timeline, POST add a manual note
    # --- Agent Installer (Download Agent button on PrintPilot Setup) --------
    re_path(r"^agent/installer/?$", views.agent_installer_download),  # GET download RepetigoInstaller.exe
]
