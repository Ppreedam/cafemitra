from django.urls import re_path

from . import admin_views, views

urlpatterns = [
    # --- Admin (RepetiGo platform dashboard, staff-only) ---------------
    re_path(r"^admin/auth/login/?$", admin_views.admin_login),  # POST staff-only login, issues a token pair (rejects non-staff even with correct password)
    re_path(r"^admin/me/?$", admin_views.admin_me),  # GET current admin's profile
    re_path(r"^admin/overview/?$", admin_views.admin_overview),  # GET platform-wide KPI tiles + recent-activity feed
    re_path(r"^admin/shops/?$", admin_views.admin_shops),  # GET paginated/filtered shop list (search, balanceFilter, cashCounter, status)
    re_path(r"^admin/shops/(?P<shop_id>[0-9]+)/?$", admin_views.admin_shop_detail),  # GET full shop detail (profile+pricing+orders+wallet) / PUT credit-limit + cash-counter permission
    re_path(r"^admin/shops/(?P<shop_id>[0-9]+)/adjust-balance/?$", admin_views.admin_shop_adjust_balance),  # POST manual wallet credit/debit with a mandatory reason (audit-logged)
    re_path(r"^admin/shops/(?P<shop_id>[0-9]+)/suspend/?$", admin_views.admin_shop_suspend),  # POST deactivate a shop account
    re_path(r"^admin/shops/(?P<shop_id>[0-9]+)/reactivate/?$", admin_views.admin_shop_reactivate),  # POST reactivate a suspended shop account
    re_path(r"^admin/shops/(?P<shop_id>[0-9]+)/delete/?$", admin_views.admin_shop_delete),  # POST permanently delete a shop account and all its data (requires confirmEmail match)
    re_path(r"^admin/shops/(?P<shop_id>[0-9]+)/orders/?$", admin_views.admin_shop_orders),  # GET paginated order history for one shop, filterable by status
    re_path(r"^admin/orders/stuck/?$", admin_views.admin_stuck_orders),  # GET awaiting-approval / stuck photo jobs across all shops
    re_path(r"^admin/orders/?$", admin_views.admin_orders),  # GET paginated/filtered platform-wide order list (shop, service, paymentMode, status, from, to)
    re_path(r"^admin/orders/(?P<order_id>[0-9]+)/?$", admin_views.admin_order_detail),  # GET full order detail (any shop, admin-only)
    re_path(r"^admin/wallet/ledger/?$", admin_views.admin_wallet_ledger),  # GET platform-wide wallet transaction ledger (shop, type, from, to)
    re_path(r"^admin/wallet/ledger/summary/?$", admin_views.admin_wallet_ledger_summary),  # GET lifetime credit/debit totals + current balance for one shop (shop required)
    re_path(r"^admin/wallet/topups/?$", admin_views.admin_wallet_topups),  # GET gateway-wise top-up list (gateway, status)
    re_path(r"^admin/withdrawals/?$", admin_views.admin_withdrawals),  # GET withdrawal request queue (status)
    re_path(r"^admin/withdrawals/(?P<withdrawal_id>[0-9]+)/approve/?$", admin_views.admin_withdrawal_approve),  # POST mark a pending withdrawal as paid
    re_path(r"^admin/withdrawals/(?P<withdrawal_id>[0-9]+)/reject/?$", admin_views.admin_withdrawal_reject),  # POST reject a pending withdrawal and reverse its debit
    re_path(r"^admin/wallet-settings/?$", admin_views.admin_wallet_settings),  # GET global wallet config rows
    re_path(r"^admin/wallet-settings/(?P<key>[a-z_]+)/?$", admin_views.admin_wallet_setting_detail),  # PUT edit one wallet setting's value/isActive
    re_path(r"^admin/tool-pricing/?$", admin_views.admin_tool_pricing),  # GET RepetiGo's own per-tool usage fees
    re_path(r"^admin/tool-pricing/(?P<tool_key>[\w-]+)/?$", admin_views.admin_tool_pricing_detail),  # PUT edit one tool's price/price_b2b/price_b2c/is_billable
    re_path(r"^admin/tool-visibility/?$", admin_views.admin_tool_visibility),  # GET which Automation Tools nav entries are on/off
    re_path(r"^admin/tool-visibility/(?P<tool_key>[\w-]+)/?$", admin_views.admin_tool_visibility_detail),  # PUT toggle one tool's isEnabled
    re_path(r"^admin/agents/?$", admin_views.admin_agents),  # GET list (status filter) / POST onboard an existing account as a referral agent
    re_path(r"^admin/agents/(?P<agent_id>[0-9]+)/?$", admin_views.admin_agent_detail),  # GET detail (referred shops + commission ledger) / PUT commission rate/type/status/offer
    re_path(r"^admin/coupons/?$", admin_views.admin_coupons),  # GET list (with redemption counts) / POST create a coupon code
    re_path(r"^admin/coupons/(?P<coupon_id>[0-9]+)/?$", admin_views.admin_coupon_detail),  # GET detail (redemption list) / PUT active/message/max redemptions/expiry
    re_path(r"^admin/contact-messages/?$", admin_views.admin_contact_messages),  # GET inbox (status=unread|resolved)
    re_path(r"^admin/contact-messages/(?P<message_id>[0-9]+)/?$", admin_views.admin_contact_message_detail),  # PUT mark resolved/unread + internal note
    re_path(r"^admin/print-agent/stats/?$", admin_views.admin_print_agent_stats),  # GET desktop Print Agent last-seen per shop + recent failed jobs
    re_path(r"^admin/wallet/ledger/export/?$", admin_views.admin_wallet_ledger_export),  # GET CSV download of the filtered wallet ledger (same filters as the JSON list, capped at 5000 rows)
    re_path(r"^admin/orders/export/?$", admin_views.admin_orders_export),  # GET CSV download of the filtered order list (same filters as the JSON list, capped at 5000 rows)
    re_path(r"^admin/notifications/?$", admin_views.admin_notifications),  # GET cheap poll-friendly counts for sidebar badges
    re_path(r"^admin/analytics/signups/?$", admin_views.admin_signup_analytics),  # GET signup time-series (from, to, granularity=day|week|month) + referral-agent breakdown
    re_path(r"^admin/analytics/orders/?$", admin_views.admin_order_analytics),  # GET order time-series + top-10-shops leaderboard (from, to, granularity=day|week|month)
    re_path(r"^admin/activity-log/?$", admin_views.admin_activity_log),  # GET audit trail of admin-dashboard actions (targetType, action filters)
    re_path(r"^admin/shops/(?P<shop_id>[0-9]+)/send-password-reset/?$", admin_views.admin_shop_send_password_reset),  # POST trigger the standard password-reset email for a shop
    re_path(r"^admin/shops/(?P<shop_id>[0-9]+)/impersonate/?$", admin_views.admin_shop_impersonate),  # POST issue a fresh token pair for the shop's own account (logged, support/debug use)
    re_path(r"^admin/shops/bulk-suspend/?$", admin_views.admin_shops_bulk_suspend),  # POST {shopIds: [...]} suspend multiple shops at once
    re_path(r"^admin/shops/bulk-reactivate/?$", admin_views.admin_shops_bulk_reactivate),  # POST {shopIds: [...]} reactivate multiple shops at once
    re_path(r"^admin/staff/?$", admin_views.admin_staff),  # GET list all platform-staff accounts with their role / POST promote an existing account to staff by email (super_admin only)
    re_path(r"^admin/staff/(?P<staff_id>[0-9]+)/role/?$", admin_views.admin_staff_set_role),  # PUT set a staff account's role (super_admin only)
    re_path(r"^admin/staff/(?P<staff_id>[0-9]+)/revoke/?$", admin_views.admin_staff_revoke),  # POST demote a staff account back to a regular account (super_admin only)
    re_path(r"^admin/wallet/earnings-summary/?$", admin_views.admin_wallet_earnings_summary),  # GET today/this-week/this-month platform earning vs prior period
    re_path(r"^admin/recent-activity/?$", admin_views.admin_recent_activity),  # GET paginated merged orders+topups+withdrawals feed
    re_path(r"^admin/leads/scrape/run/?$", admin_views.admin_leads_scrape_run),  # POST start the Selenium scrape-queue extractor in the background
    re_path(r"^admin/leads/scrape/status/?$", admin_views.admin_leads_scrape_status),  # GET latest extractor run's progress/status

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
    re_path(r"^tools/resume-builder-charge/?$", views.resume_builder_charge),  # POST gate+charge one resume PDF download for the given template (free until ToolPricing rows are configured)
    re_path(r"^tools/resume-builder/save/?$", views.resume_builder_save),  # POST save/update a resume draft as a PrintOrder (free, no wallet charge)
    re_path(r"^tools/resume-builder/saved/?$", views.resume_builder_saved_list),  # GET the caller's saved resumes
    re_path(r"^tools/resume-builder/saved/(?P<order_id>[0-9]+)/delete/?$", views.resume_builder_delete),  # POST delete one saved resume
    re_path(r"^tools/resume-builder/saved/(?P<order_id>[0-9]+)/mark-paid/?$", views.mark_resume_order_paid),  # POST owner confirms cash payment for a customer's resume order
    re_path(r"^tools/biodata-maker-charge/?$", views.biodata_maker_charge),  # POST gate+charge one biodata PDF download for the given template (free until ToolPricing rows are configured)
    re_path(r"^tools/biodata-maker/save/?$", views.biodata_maker_save),  # POST save/update a biodata draft as a PrintOrder (free, no wallet charge)
    re_path(r"^tools/biodata-maker/saved/?$", views.biodata_maker_saved_list),  # GET the caller's saved biodatas
    re_path(r"^tools/biodata-maker/saved/(?P<order_id>[0-9]+)/delete/?$", views.biodata_maker_delete),  # POST delete one saved biodata
    re_path(r"^tools/biodata-maker/saved/(?P<order_id>[0-9]+)/mark-paid/?$", views.mark_biodata_order_paid),  # POST owner confirms cash payment for a customer's biodata order

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
    re_path(r"^tools/visibility/?$", views.tool_visibility),  # GET public map of {toolKey: isEnabled} for the Automation Tools nav (navbar + dashboard sidebar)
    re_path(r"^wallet/?$", views.wallet),  # GET balance, collection summary, limits, and paginated transaction ledger
    re_path(r"^wallet/withdraw/?$", views.request_withdrawal),  # POST request a withdrawal against the withdrawable balance
    re_path(r"^wallet/coupon/redeem/?$", views.redeem_coupon),  # POST redeem a coupon code, credits the wallet (not withdrawable)
    re_path(r"^wallet/topup/?$", views.create_wallet_topup),  # POST start a wallet top-up, returns {id, amount, gateway}
    re_path(r"^wallet/topup/(?P<topup_id>[0-9]+)/razorpay/order/?$", views.wallet_topup_razorpay_order),  # POST create a Razorpay order for a top-up
    re_path(r"^wallet/topup/(?P<topup_id>[0-9]+)/razorpay/verify/?$", views.wallet_topup_verify_razorpay),  # POST verify a completed Razorpay top-up payment signature
    re_path(r"^wallet/topup/(?P<topup_id>[0-9]+)/payu/order/?$", views.wallet_topup_payu_order),  # POST build the PayU hosted-checkout form fields for a top-up
    re_path(r"^wallet/topup/(?P<topup_id>[0-9]+)/payu/callback/?$", views.wallet_topup_payu_callback),  # POST PayU surl/furl target - verifies hash, credits wallet, redirects back to /wallet
    re_path(r"^wallet/topup/(?P<topup_id>[0-9]+)/phonepe/order/?$", views.wallet_topup_phonepe_order),  # POST create a PhonePe Standard Checkout order for a top-up
    re_path(r"^wallet/topup/(?P<topup_id>[0-9]+)/phonepe/callback/?$", views.wallet_topup_phonepe_callback),  # GET PhonePe return redirect target, redirects back to /wallet

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
    re_path(r"^public-shop/(?P<code>[^/]+)/resume-builder/save/?$", views.public_resume_order),  # POST anonymous customer create/update their own resume order for a shop
    re_path(r"^public-shop/(?P<code>[^/]+)/biodata-maker/save/?$", views.public_biodata_order),  # POST anonymous customer create/update their own biodata order for a shop
    re_path(r"^public-orders/(?P<order_id>[0-9]+)/?$", views.public_order_status),  # GET current status of a public order
    re_path(r"^public-orders/(?P<order_id>[0-9]+)/check-upi-payment/?$", views.public_check_upi_payment),  # POST poll UPI collect status for an order
    re_path(r"^public-orders/(?P<order_id>[0-9]+)/razorpay/order/?$", views.public_create_razorpay_order),  # POST create a Razorpay order for online payment
    re_path(r"^public-orders/(?P<order_id>[0-9]+)/razorpay/verify/?$", views.public_verify_razorpay_payment),  # POST verify a completed Razorpay payment signature
    re_path(r"^public-orders/(?P<order_id>[0-9]+)/payu/order/?$", views.public_create_payu_order),  # POST build the PayU hosted-checkout form fields for online payment
    re_path(r"^public-orders/(?P<order_id>[0-9]+)/payu/callback/?$", views.public_payu_callback),  # POST PayU surl/furl target - verifies hash, updates order, redirects back to the storefront
    re_path(r"^public-orders/(?P<order_id>[0-9]+)/phonepe/order/?$", views.public_create_phonepe_order),  # POST create a PhonePe Standard Checkout order, returns the hosted redirectUrl
    re_path(r"^public-orders/(?P<order_id>[0-9]+)/phonepe/callback/?$", views.public_phonepe_callback),  # GET PhonePe return redirect target - re-checks status via API, redirects back to the storefront
    re_path(r"^webhooks/phonepe/?$", views.phonepe_webhook),  # POST PhonePe server-to-server payment status webhook (Authorization: sha256(username:password))
    re_path(r"^public-orders/(?P<order_id>[0-9]+)/delete-document/?$", views.public_delete_order_document),  # POST customer deletes their document once printed

    # --- Passport Photo (authenticated wizard flow) -------------------------
    re_path(r"^save-raw-passport-photo/?$", views.save_raw_passport_photo),  # POST upload raw photo + AI prompt, creates the order
    re_path(r"^save-manual-passport-photo/?$", views.save_manual_passport_photo),  # POST upload a browser-edited final photo, creates the order already done
    re_path(r"^api-passport-photo-check/?$", views.check_passport_photo),  # POST poll for the AI-generated final passport photo

    # --- Agent Passport Jobs (desktop Print Agent, AI photo queue) ---------
    re_path(r"^agent/passport-jobs/?$", views.agent_passport_jobs),  # GET list pending passport-photo AI jobs
    re_path(r"^agent/passport-jobs/(?P<job_id>[0-9]+)/claim/?$", views.claim_passport_job),  # POST atomically claim a pending job
    re_path(r"^agent/passport-jobs/(?P<job_id>[0-9]+)/complete/?$", views.complete_passport_job),  # POST upload final photo, or report failure
    re_path(r"^agent/passport-jobs/(?P<job_id>[0-9]+)/original-image/?$", views.agent_passport_original_image),  # GET raw upload decoded from base64

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
