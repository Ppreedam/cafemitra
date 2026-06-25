"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type React from "react";
import {
  BadgeCheck,
  Check,
  FileText,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { apiUrl, storeSession } from "@/lib/api";

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
  remember: boolean;
};

type TouchedValues = Partial<Record<keyof AuthValues, boolean>>;

const initialValues: AuthValues = {
  email: "",
  fullName: "",
  phone: "",
  password: "",
  confirmPassword: "",
  terms: false,
  remember: false,
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\d{10}$/;

export function AuthPanel({ mode }: AuthPanelProps) {
  const isRegister = mode === "register";
  const router = useRouter();
  const [values, setValues] = useState<AuthValues>(initialValues);
  const [touched, setTouched] = useState<TouchedValues>({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const errors = useMemo(() => {
    const nextErrors: Partial<Record<keyof AuthValues, string>> = {};

    if (!emailPattern.test(values.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (values.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    if (isRegister) {
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
    }

    return nextErrors;
  }, [isRegister, values]);

  const isFormValid = Object.keys(errors).length === 0;

  function updateValue(field: keyof AuthValues, value: string | boolean) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function markTouched(field: keyof AuthValues) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApiError("");

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
          email: values.email,
          fullName: values.fullName,
          phone: values.phone,
          password: values.password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message ?? "Something went wrong.");
      }

      storeSession(data);
      router.push("/dashboard");
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
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
            <span className="brand-main">
              Cafe<span className="brand-accent">Mitra</span>
            </span>
            <span className="brand-dot">.online</span>
          </Link>
          <AuthIllustration />
          <div className="auth-visual-copy">
            <h2>Manage your cyber cafe with confidence</h2>
            <p>Secure logins, quick services, daily orders, wallet tracking, and customer tools in one place.</p>
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
                  placeholder="Minimum 8 characters"
                  value={values.password}
                  error={touched.password ? errors.password : undefined}
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
                    I agree to the Terms and Conditions, Privacy Policy, Refund Policy and Disclaimer.
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
                <div className="auth-row">
                  <label className="auth-check compact">
                    <input
                      type="checkbox"
                      checked={values.remember}
                      onChange={(event) => updateValue("remember", event.target.checked)}
                    />
                    <span>Remember me?</span>
                  </label>
                  <Link href="#">Forgot password?</Link>
                </div>
                <p className="recaptcha-copy">
                  This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.
                </p>
              </>
            )}

            {apiError ? <p className="auth-error">{apiError}</p> : null}
            <button className="btn btn-primary auth-submit" type="submit" disabled={!isFormValid || isSubmitting}>
              {isSubmitting ? "Please wait..." : isRegister ? "Create Account" : "Login"}
            </button>
          </form>
          <p className="auth-copy">Copyrights (c) 2026 CafeMitra.online</p>
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
  const fieldId = `cafemitra-${name}`;

  return (
    <label className="auth-field" htmlFor={fieldId}>
      <span>{label}</span>
      <span className="auth-input-wrap">
        <input
          id={fieldId}
          name={fieldId}
          type={type}
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
        {verified ? <Check className="field-check" size={24} /> : null}
      </span>
      {error ? (
        <span className="auth-error" id={`${fieldId}-error`}>
          {error}
        </span>
      ) : null}
    </label>
  );
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
