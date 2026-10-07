"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import {
  Check,
  Eye,
  EyeOff,
  ChevronDown,
  Search,
  UserRound,
} from "lucide-react";
import { getCountries, getCountryCallingCode, type CountryCode } from "libphonenumber-js";
import { apiUrl, storeSession } from "@/lib/api";
import { getPasswordStrengthError, passwordRequirementHint } from "@/lib/password";
import { LandingNavbar } from "../LandingNavbar";

type AuthPanelProps = {
  mode: "login" | "register";
};

type AuthValues = {
  email: string;
  fullName: string;
  phone: string;
  password: string;
  confirmPassword: string;
  referralCode: string;
  terms: boolean;
};

type TouchedValues = Partial<Record<keyof AuthValues, boolean>>;

const initialValues: AuthValues = {
  email: "",
  fullName: "",
  phone: "",
  password: "",
  confirmPassword: "",
  referralCode: "",
  terms: false,
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VERIFIED_PHONE_KEY = "repetigo.verifiedPhone";

// India: exactly 10 digits. Other countries: 6-12 digits (country code is separate).
function isValidPhone(countryCode: string, number: string) {
  const digits = number.trim();
  return countryCode === "91" ? /^\d{10}$/.test(digits) : /^\d{6,12}$/.test(digits);
}

export function AuthPanel({ mode }: AuthPanelProps) {
  const isRegister = mode === "register";
  const router = useRouter();
  const [values, setValues] = useState<AuthValues>(initialValues);

  // Pre-fill from a shared invite link (/register?ref=CODE) - done after mount
  // so the server-rendered markup and first client render stay identical.
  useEffect(() => {
    if (!isRegister) return;
    const ref = (new URLSearchParams(window.location.search).get("ref") || "").trim().slice(0, 16);
    if (ref) setValues((current) => ({ ...current, referralCode: ref }));
  }, [isRegister]);
  // Result of checking the typed referral code: null = nothing to show.
  const [referralCheck, setReferralCheck] = useState<{ status: "checking" | "valid" | "invalid"; name?: string } | null>(null);
  const [touched, setTouched] = useState<TouchedValues>({});
  const [apiError, setApiError] = useState("");
  const [apiNotice, setApiNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  // WhatsApp OTP verification (register only). phoneToken is the server's
  // proof that `verifiedPhone` was confirmed; it is sent along with register.
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpBusy, setOtpBusy] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [country, setCountry] = useState<CountryCode>("IN");
  const countryCode = getCountryCallingCode(country);
  const [phoneToken, setPhoneToken] = useState("");
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const fullPhone = `${countryCode}:${values.phone.trim()}`;
  // Remember a verified number across refreshes so the OTP isn't asked twice.
  useEffect(() => {
    if (!isRegister) return;
    try {
      const saved = JSON.parse(window.localStorage.getItem(VERIFIED_PHONE_KEY) || "null");
      if (saved?.token && saved.phone && saved.country) {
        setCountry(saved.country as CountryCode);
        setValues((current) => ({ ...current, phone: saved.phone }));
        setPhoneToken(saved.token);
        setVerifiedPhone(`${getCountryCallingCode(saved.country as CountryCode)}:${saved.phone}`);
      }
    } catch {
      // storage unavailable or corrupt - user just verifies again
    }
  }, [isRegister]);

  function clearVerifiedPhone() {
    setPhoneToken("");
    setVerifiedPhone("");
    try {
      window.localStorage.removeItem(VERIFIED_PHONE_KEY);
    } catch {
      // ignore
    }
  }

  const phoneVerified = Boolean(phoneToken) && verifiedPhone === fullPhone;

  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = window.setTimeout(() => setOtpCooldown((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [otpCooldown]);

  useEffect(() => {
    const code = values.referralCode.trim();
    if (!isRegister || code.length < 4) {
      setReferralCheck(null);
      return;
    }
    setReferralCheck({ status: "checking" });
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(apiUrl(`/api/referrals/lookup/?code=${encodeURIComponent(code)}`), { signal: controller.signal });
        const data = await response.json().catch(() => null);
        setReferralCheck(data?.valid ? { status: "valid", name: data.name } : { status: "invalid" });
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) setReferralCheck(null);
      }
    }, 450);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [isRegister, values.referralCode]);

  const errors = useMemo(() => {
    const nextErrors: Partial<Record<keyof AuthValues, string>> = {};

    if (!emailPattern.test(values.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (isRegister) {
      const passwordError = getPasswordStrengthError(values.password);
      if (passwordError) {
        nextErrors.password = passwordError;
      }

      if (values.fullName.trim().length < 2) {
        nextErrors.fullName = "Enter your full name.";
      }

      if (!isValidPhone(countryCode, values.phone)) {
        nextErrors.phone = countryCode === "91" ? "WhatsApp number must be exactly 10 digits." : "Enter a valid WhatsApp number (6-12 digits).";
      }

      if (values.confirmPassword !== values.password || values.confirmPassword.length === 0) {
        nextErrors.confirmPassword = "Passwords must match.";
      }

      if (!phoneVerified) {
        nextErrors.phone = nextErrors.phone ?? "Verify your WhatsApp number with the OTP.";
      }

      if (!values.terms) {
        nextErrors.terms = "Accept terms and conditions to continue.";
      }
    } else if (!values.password) {
      nextErrors.password = "Enter your password.";
    }

    return nextErrors;
  }, [isRegister, values, phoneVerified, countryCode]);

  const isFormValid = Object.keys(errors).length === 0;
  const hasAnyInput = isRegister
    ? Boolean(values.email || values.fullName || values.phone || values.password || values.confirmPassword || values.terms)
    : Boolean(values.email || values.password);
  const canSubmit = isFormValid && !isSubmitting;
  const hasVerificationPrompt =
    apiNotice.toLowerCase().includes("verify") || apiError.toLowerCase().includes("verify") || isResending;
  const canResendVerification = emailPattern.test(values.email.trim()) && hasVerificationPrompt;

  function updateValue(field: keyof AuthValues, value: string | boolean) {
    setValues((current) => ({ ...current, [field]: value }));
    if (field === "phone") {
      setOtpSent(false);
      setOtpCode("");
      setOtpError("");
      setOtpCooldown(0);
    }
    if (apiError) setApiError("");
    if (apiNotice) setApiNotice("");
  }

  function markTouched(field: keyof AuthValues) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  async function sendPhoneOtp() {
    setOtpError("");
    setOtpBusy(true);
    try {
      const response = await fetch(apiUrl("/api/auth/phone-otp/send/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: values.phone.trim(), countryCode }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message ?? "Could not send OTP. Please try again.");
      setOtpSent(true);
      setOtpCode("");
      setOtpCooldown(data?.resendAfter ?? 60);
    } catch (error) {
      setOtpError(error instanceof Error ? error.message : "Could not send OTP.");
    } finally {
      setOtpBusy(false);
    }
  }

  async function verifyPhoneOtp() {
    setOtpError("");
    setOtpBusy(true);
    try {
      const response = await fetch(apiUrl("/api/auth/phone-otp/verify/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: values.phone.trim(), countryCode, otp: otpCode.trim() }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.phoneVerificationToken) throw new Error(data?.message ?? "Could not verify OTP.");
      setPhoneToken(data.phoneVerificationToken);
      setVerifiedPhone(fullPhone);
      try {
        window.localStorage.setItem(VERIFIED_PHONE_KEY, JSON.stringify({ country, phone: values.phone.trim(), token: data.phoneVerificationToken }));
      } catch {
        // ignore - verification still works for this page load
      }
      setOtpSent(false);
    } catch (error) {
      setOtpError(error instanceof Error ? error.message : "Could not verify OTP.");
    } finally {
      setOtpBusy(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApiError("");
    setApiNotice("");

    if (!isFormValid) {
      setTouched({
        email: true,
        fullName: true,
        phone: true,
        password: true,
        confirmPassword: true,
        terms: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(apiUrl(isRegister ? "/api/auth/register/" : "/api/auth/login/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email.trim().toLowerCase(),
          fullName: values.fullName.trim(),
          phone: values.phone.trim(),
          password: values.password,
          ...(isRegister ? { phoneVerificationToken: phoneToken, countryCode } : {}),
          ...(isRegister && values.referralCode.trim() ? { referralCode: values.referralCode.trim() } : {}),
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        if (isRegister && /verify your whatsapp/i.test(data?.message ?? "")) clearVerifiedPhone();
        throw new Error(data?.message ?? "Server error. Please try again in a moment.");
      }
      if (!data) {
        throw new Error("Unexpected response from server. Please try again.");
      }

      if (data.token) {
        storeSession(data);
        router.push(getPostAuthRedirectPath());
      } else {
        setApiNotice(data.message || "Please check your email to continue.");
        if (isRegister) {
          setValues(initialValues);
          setTouched({});
          setCountry("IN");
          clearVerifiedPhone();
        }
      }
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function resendVerification() {
    setApiError("");
    setApiNotice("");

    if (!emailPattern.test(values.email.trim())) {
      setTouched((current) => ({ ...current, email: true }));
      setApiError("Enter a valid email address to resend verification.");
      return;
    }

    setIsResending(true);
    try {
      const response = await fetch(apiUrl("/api/auth/resend-verification/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message ?? "Could not send verification email.");
      }
      setApiNotice(data.message || "Verification email sent.");
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Could not send verification email.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="auth-shell">
      <LandingNavbar />
      <main className="auth-page">
      <section
        className={`auth-card ${isRegister ? "register-auth" : "login-auth"}`}
        aria-label={isRegister ? "Create account" : "Login"}
      >
        <div className="auth-visual">
          <Link className="brand auth-brand" href="/">
            <span className="brand-main">
              Repeti<span className="brand-accent">Go</span>
            </span>
          </Link>
          <AuthIllustration isRegister={isRegister} />
          <div className="auth-visual-copy">
            <h2>Run your print shop on autopilot</h2>
            <p>Secure QR uploads, AI document processing, print queues, wallet tracking, and customer tools in one place.</p>
          </div>
        </div>

        <div className="auth-form-side">
          <div className="auth-avatar">
            <UserRound size={28} />
          </div>
          <h1>{isRegister ? "Create new account" : "Welcome Back"}</h1>
          <p className="auth-switch">
            {isRegister ? "Already a member?" : "New here?"}{" "}
            <Link href={isRegister ? "/login" : "/register"}>
              {isRegister ? "Log in" : "Create an account"}
            </Link>
          </p>

          <form className="auth-form" autoComplete="off" onSubmit={handleSubmit} noValidate>
            <Field
              label="Email ID"
              name="email"
              type="email"
              placeholder="Enter email"
              value={values.email}
              error={touched.email ? errors.email : undefined}
              verified={Boolean(values.email) && !errors.email}
              autoComplete="new-email"
              onBlur={() => markTouched("email")}
              onChange={(value) => updateValue("email", value)}
            />
            {isRegister ? (
              <>
                <Field
                  label="Full Name"
                  name="full-name"
                  type="text"
                  placeholder="Enter full name"
                  value={values.fullName}
                  error={touched.fullName ? errors.fullName : undefined}
                  verified={Boolean(values.fullName.trim()) && !errors.fullName}
                  autoComplete="off"
                  onBlur={() => markTouched("fullName")}
                  onChange={(value) => updateValue("fullName", value)}
                />
                <PhoneField
                  label="WhatsApp Number"
                  country={country}
                  value={values.phone}
                  hint="Enter a correct WhatsApp number to get a bonus - an incorrect number will not qualify."
                  error={touched.phone ? errors.phone : undefined}
                  verified={phoneVerified}
                  onBlur={() => markTouched("phone")}
                  onCountryChange={(next) => {
                    setCountry(next);
                    setValues((current) => ({ ...current, phone: "" }));
                    setOtpSent(false);
                    setOtpCode("");
                    setOtpError("");
                    setOtpCooldown(0);
                  }}
                  onChange={(value) => updateValue("phone", value)}
                />
                {isValidPhone(countryCode, values.phone) && !phoneVerified ? (
                  <div className="auth-otp">
                    {otpSent ? (
                      <>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="Enter 6 digit OTP"
                          aria-label="WhatsApp OTP"
                          autoComplete="one-time-code"
                          value={otpCode}
                          onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                        />
                        <button className="btn btn-primary" type="button" onClick={verifyPhoneOtp} disabled={otpBusy || otpCode.length !== 6}>
                          {otpBusy ? "Checking..." : "Verify OTP"}
                        </button>
                        <button className="auth-resend" type="button" onClick={sendPhoneOtp} disabled={otpBusy || otpCooldown > 0}>
                          {otpCooldown > 0 ? `Resend OTP in ${otpCooldown}s` : "Resend OTP"}
                        </button>
                      </>
                    ) : (
                      <button className="btn btn-primary" type="button" onClick={sendPhoneOtp} disabled={otpBusy || otpCooldown > 0}>
                        {otpBusy ? "Sending..." : otpCooldown > 0 ? `Resend OTP in ${otpCooldown}s` : "Send OTP on WhatsApp"}
                      </button>
                    )}
                    {otpError ? <p className="auth-error">{otpError}</p> : null}
                  </div>
                ) : null}
                {phoneVerified ? <p className="auth-success">WhatsApp number verified.</p> : null}
                <Field
                  label="Password"
                  name="new-password"
                  type="password"
                  placeholder="Enter password"
                  hint={passwordRequirementHint}
                  value={values.password}
                  error={touched.password ? errors.password : undefined}
                  verified={Boolean(values.password) && !errors.password}
                  autoComplete="new-password"
                  onBlur={() => markTouched("password")}
                  onChange={(value) => updateValue("password", value)}
                />
                <Field
                  label="Confirm Password"
                  name="confirm-password"
                  type="password"
                  placeholder="Confirm password"
                  value={values.confirmPassword}
                  error={touched.confirmPassword ? errors.confirmPassword : undefined}
                  verified={Boolean(values.confirmPassword) && !errors.confirmPassword}
                  autoComplete="new-password"
                  onBlur={() => markTouched("confirmPassword")}
                  onChange={(value) => updateValue("confirmPassword", value)}
                />
                <Field
                  label="Referral Code (optional)"
                  name="referral-code"
                  type="text"
                  placeholder="Enter referral code"
                  hint={
                    referralCheck?.status === "checking"
                      ? "Checking code..."
                      : referralCheck?.status === "valid"
                        ? `Valid code - referred by ${referralCheck.name}`
                        : undefined
                  }
                  error={
                    referralCheck?.status === "invalid"
                      ? "Referral code not found. Check it again, or leave it empty to continue."
                      : undefined
                  }
                  verified={referralCheck?.status === "valid"}
                  value={values.referralCode}
                  autoComplete="off"
                  onBlur={() => markTouched("referralCode")}
                  onChange={(value) => updateValue("referralCode", value.trim().slice(0, 16))}
                />
                <label className="auth-check">
                  <input
                    type="checkbox"
                    checked={values.terms}
                    onBlur={() => markTouched("terms")}
                    onChange={(event) => {
                      updateValue("terms", event.target.checked);
                      markTouched("terms");
                    }}
                  />
                  <span>
                    I agree to the{" "}
                    <Link href="/terms-conditions">Terms and Conditions</Link>,{" "}
                    <Link href="/privacy-policy">Privacy Policy</Link>, and{" "}
                    <Link href="/disclaimer">Disclaimer</Link>.
                  </span>
                </label>
                {touched.terms && errors.terms ? <p className="auth-error">{errors.terms}</p> : null}
              </>
            ) : (
              <>
                <Field
                  label="Password"
                  name="login-password"
                  type="password"
                  placeholder="Password"
                  value={values.password}
                  error={touched.password ? errors.password : undefined}
                  autoComplete="new-password"
                  onBlur={() => markTouched("password")}
                  onChange={(value) => updateValue("password", value)}
                />
                <div className="auth-row auth-row-end">
                  <Link href="/forgot-password">Forgot password?</Link>
                </div>
              </>
            )}

            {apiError ? <p className="auth-error">{apiError}</p> : null}
            {apiNotice ? <p className="auth-success">{apiNotice}</p> : null}
            {canResendVerification ? (
              <button className="auth-resend" type="button" onClick={resendVerification} disabled={isResending}>
                {isResending ? "Sending..." : "Resend verification email"}
              </button>
            ) : null}
            <button
              className={canSubmit ? "btn btn-primary auth-submit auth-submit-ready" : "btn btn-primary auth-submit"}
              type="submit"
              disabled={isSubmitting}
              aria-disabled={!canSubmit}
              title={!isFormValid && hasAnyInput ? "Complete the highlighted fields to continue." : undefined}
            >
              {isSubmitting ? (
                <>
                  <span className="auth-button-spinner" aria-hidden />
                  Please wait...
                </>
              ) : isRegister ? (
                "Create Account"
              ) : (
                "Login"
              )}
            </button>
          </form>
          <p className="auth-copy">Copyright 2026 RepetiGo. All rights reserved.</p>
        </div>
      </section>
      </main>
    </div>
  );
}

const regionNames = typeof Intl !== "undefined" && "DisplayNames" in Intl ? new Intl.DisplayNames(["en"], { type: "region" }) : null;
const countryOptions = getCountries()
  .map((iso) => ({ iso, name: regionNames?.of(iso) ?? iso, dial: getCountryCallingCode(iso) }))
  .sort((a, b) => a.name.localeCompare(b.name));

function flagUrl(iso: string) {
  return `https://flagcdn.com/w40/${iso.toLowerCase()}.png`;
}

function PhoneField({
  label,
  country,
  value,
  hint,
  error,
  verified,
  onBlur,
  onCountryChange,
  onChange,
}: {
  label: string;
  country: CountryCode;
  value: string;
  hint?: string;
  error?: string;
  verified?: boolean;
  onBlur: () => void;
  onCountryChange: (country: CountryCode) => void;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const isIndia = country === "IN";
  const maxDigits = isIndia ? 10 : 12;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const q = query.trim().toLowerCase().replace(/^\+/, "");
  const filtered = q
    ? countryOptions.filter((item) => item.name.toLowerCase().includes(q) || item.iso.toLowerCase() === q || item.dial.startsWith(q))
    : countryOptions;

  return (
    <div className="auth-field phone-field" ref={rootRef}>
      <span>{label}</span>
      <div className={`phone-input-row${error ? " has-error" : ""}`}>
        <button className="phone-country-btn" type="button" aria-label="Select country" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
          <img src={flagUrl(country)} alt="" width={28} height={20} />
          <ChevronDown size={16} />
        </button>
        <span className="phone-dial">+{getCountryCallingCode(country)}</span>
        <input
          type="tel"
          inputMode="numeric"
          placeholder={isIndia ? "Enter 10 digit WhatsApp number" : "Enter WhatsApp number"}
          maxLength={maxDigits}
          autoComplete="off"
          aria-invalid={Boolean(error)}
          value={value}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, maxDigits))}
        />
        {verified ? <Check className="field-check phone-check" size={20} /> : null}
        {open ? (
          <div className="phone-country-menu">
            <div className="phone-country-search">
              <Search size={18} />
              <input autoFocus type="text" placeholder="Search..." value={query} onChange={(event) => setQuery(event.target.value)} />
            </div>
            <ul>
              {filtered.map((item) => (
                <li key={item.iso}>
                  <button
                    className={item.iso === country ? "active" : ""}
                    type="button"
                    onClick={() => {
                      if (item.iso !== country) onCountryChange(item.iso);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <img src={flagUrl(item.iso)} alt="" width={28} height={20} loading="lazy" />
                    <span>
                      <strong>{item.name}</strong>
                      <small>{item.iso} (+{item.dial})</small>
                    </span>
                  </button>
                </li>
              ))}
              {!filtered.length ? <li className="phone-country-empty">No country found</li> : null}
            </ul>
          </div>
        ) : null}
      </div>
      {error ? <span className="auth-error">{error}</span> : hint ? <span className="auth-hint">{hint}</span> : null}
    </div>
  );
}

function Field({
  label,
  name,
  type,
  placeholder,
  hint,
  value,
  error,
  verified,
  autoComplete = "off",
  inputMode,
  maxLength,
  onBlur,
  onChange,
}: {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  hint?: string;
  value: string;
  error?: string;
  verified?: boolean;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  onBlur: () => void;
  onChange: (value: string) => void;
}) {
  const fieldId = `repetigo-${name}`;
  const isPasswordField = type === "password";
  const [showPassword, setShowPassword] = useState(false);
  const inputType = isPasswordField ? (showPassword ? "text" : "password") : type;

  return (
    <label className="auth-field" htmlFor={fieldId}>
      <span>{label}</span>
      <span className={isPasswordField ? "auth-input-wrap auth-input-wrap-password" : "auth-input-wrap"}>
        <input
          id={fieldId}
          name={fieldId}
          type={inputType}
          placeholder={placeholder}
          value={value}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
        />
        <span className="auth-input-icons">
          {verified ? <Check className="field-check" size={20} /> : null}
          {isPasswordField ? (
            <button
              type="button"
              className="auth-toggle-visibility"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          ) : null}
        </span>
      </span>
      {error ? (
        <span className="auth-error" id={`${fieldId}-error`}>
          {error}
        </span>
      ) : hint ? (
        <span className="auth-hint">{hint}</span>
      ) : null}
    </label>
  );
}

function getPostAuthRedirectPath() {
  if (typeof window === "undefined") return "/dashboard";

  const nextPath = new URLSearchParams(window.location.search).get("next") || "";
  return nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/dashboard";
}

function AuthIllustration({ isRegister }: { isRegister: boolean }) {
  return (
    <div className="auth-illustration" aria-hidden="true">
      <img
        className="auth-illustration-image"
        src={isRegister ? "/Create-account.png" : "/Log-in.png"}
        alt=""
      />
    </div>
  );
}
