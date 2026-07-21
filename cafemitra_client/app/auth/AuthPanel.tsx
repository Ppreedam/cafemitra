"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type React from "react";
import {
  BadgeCheck,
  Check,
  Eye,
  EyeOff,
  FileText,
  LockKeyhole,
  Printer,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { apiUrl, storeSession } from "@/lib/api";
import { getPasswordStrengthError, passwordRequirementHint } from "@/lib/password";

type AuthPanelProps = {
  mode: "login" | "register";
};

type AuthValues = {
  email: string;
  fullName: string;
  phone: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
};

type TouchedValues = Partial<Record<keyof AuthValues, boolean>>;

const initialValues: AuthValues = {
  email: "",
  fullName: "",
  phone: "",
  password: "",
  confirmPassword: "",
  terms: false,
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\d{10}$/;

export function AuthPanel({ mode }: AuthPanelProps) {
  const isRegister = mode === "register";
  const router = useRouter();
  const [values, setValues] = useState<AuthValues>(initialValues);
  const [touched, setTouched] = useState<TouchedValues>({});
  const [apiError, setApiError] = useState("");
  const [apiNotice, setApiNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

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

      if (!phonePattern.test(values.phone.trim())) {
        nextErrors.phone = "Mobile number must be exactly 10 digits.";
      }

      if (values.confirmPassword !== values.password || values.confirmPassword.length === 0) {
        nextErrors.confirmPassword = "Passwords must match.";
      }

      if (!values.terms) {
        nextErrors.terms = "Accept terms and conditions to continue.";
      }
    } else if (!values.password) {
      nextErrors.password = "Enter your password.";
    }

    return nextErrors;
  }, [isRegister, values]);

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
    if (apiError) setApiError("");
    if (apiNotice) setApiNotice("");
  }

  function markTouched(field: keyof AuthValues) {
    setTouched((current) => ({ ...current, [field]: true }));
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
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message ?? "Something went wrong.");
      }

      if (data.token) {
        storeSession(data);
        router.push(getPostAuthRedirectPath());
      } else {
        setApiNotice(data.message || "Please check your email to continue.");
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
    <main className="auth-page">
      <section
        className={`auth-card ${isRegister ? "register-auth" : "login-auth"}`}
        aria-label={isRegister ? "Create account" : "Login"}
      >
        <div className="auth-visual">
          <Link className="brand auth-brand" href="/">
            <span className="brand-mark" aria-hidden>
              <Printer size={16} />
            </span>
            <span className="brand-main">
              Repeti<span className="brand-accent">Go</span>
            </span>
          </Link>
          <AuthIllustration />
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
                <Field
                  label="Phone Number"
                  name="phone-number"
                  type="tel"
                  placeholder="Enter 10 digit mobile number"
                  value={values.phone}
                  error={touched.phone ? errors.phone : undefined}
                  verified={Boolean(values.phone.trim()) && !errors.phone}
                  inputMode="numeric"
                  maxLength={10}
                  autoComplete="off"
                  onBlur={() => markTouched("phone")}
                  onChange={(value) => updateValue("phone", value.replace(/\D/g, "").slice(0, 10))}
                />
                <Field
                  label="Password"
                  name="new-password"
                  type="password"
                  placeholder={passwordRequirementHint}
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
  );
}

function Field({
  label,
  name,
  type,
  placeholder,
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
      ) : null}
    </label>
  );
}

function getPostAuthRedirectPath() {
  if (typeof window === "undefined") return "/dashboard";

  const nextPath = new URLSearchParams(window.location.search).get("next") || "";
  return nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/dashboard";
}

function AuthIllustration() {
  return (
    <div className="auth-illustration" aria-hidden="true">
      <div className="auth-lock">
        <LockKeyhole size={58} />
      </div>
      <div className="auth-phone">
        <div className="phone-notch" />
        <div className="phone-user">
          <UserRound size={34} />
        </div>
        <span className="phone-line short" />
        <span className="phone-box" />
        <span className="phone-line" />
        <span className="phone-box" />
        <span className="phone-line" />
        <span className="phone-dots" />
        <button className="phone-button" type="button" tabIndex={-1} />
      </div>
      <div className="auth-person seated">
        <span className="head" />
        <span className="body" />
        <span className="laptop" />
      </div>
      <div className="auth-person standing">
        <span className="head" />
        <span className="body" />
        <span className="legs" />
      </div>
      <div className="auth-bubble">
        <BadgeCheck size={30} />
      </div>
      <div className="auth-doc">
        <FileText size={34} />
      </div>
      <div className="auth-shield">
        <ShieldCheck size={32} />
      </div>
      <div className="plant plant-left" />
      <div className="plant plant-right" />
    </div>
  );
}
