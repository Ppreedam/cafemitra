"use client";

import { useEffect, useState } from "react";
import { Building2, Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react";
import { apiFetch, hasStoredSession, storeSession } from "@/lib/api";
import { getPasswordStrengthError, passwordRequirementHint } from "@/lib/password";

type ProfileData = {
  user: {
    id: string;
    email: string;
    fullName: string;
    phone: string;
    balance: number;
    profilePhoto?: string;
  };
  shop: {
    shopName: string;
    address: string;
    city: string;
    state: string;
    pinCode: string;
    mobile: string;
    whatsapp: string;
    email: string;
    logo?: string;
    banner?: string;
  };
};

const defaultData: ProfileData = {
  user: {
    id: "204927",
    email: "sk6201184579@gmail.com",
    fullName: "Shankar Kumar",
    phone: "9876543210",
    balance: 0,
    profilePhoto: "",
  },
  shop: {
    shopName: "Cyber Cafe Shankar",
    address: "Main Road, Near Market",
    city: "Patna",
    state: "Bihar",
    pinCode: "800001",
    mobile: "9876543210",
    whatsapp: "9876543210",
    email: "shop@example.com",
    logo: "",
    banner: "",
  },
};

const indianStates = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

export function ProfileForms() {
  const [data, setData] = useState<ProfileData>(defaultData);
  const [savedData, setSavedData] = useState<ProfileData>(defaultData);
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const storedUser = readJson<ProfileData["user"]>("cafemitra_user");
    const storedShop = readJson<ProfileData["shop"]>("cafemitra_shop");
    const storedProfile = {
      user: { ...defaultData.user, ...storedUser },
      shop: { ...defaultData.shop, ...storedShop },
    };

    setData(storedProfile);
    setSavedData(storedProfile);

    if (!hasStoredSession()) return;

    apiFetch("/api/profile/")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((profile) => {
        setData(profile);
        setSavedData(profile);
        storeSession(profile);
        window.dispatchEvent(new Event("cafemitra:profile-updated"));
      })
      .catch(() => undefined);
  }, []);

  function updateUser(field: keyof ProfileData["user"], value: string) {
    setData((current) => ({ ...current, user: { ...current.user, [field]: value } }));
  }

  function updateShop(field: keyof ProfileData["shop"], value: string) {
    setData((current) => ({ ...current, shop: { ...current.shop, [field]: value } }));
  }

  function validateShop() {
    if (!data.shop.shopName.trim()) return "Shop name is required.";
    if (!data.shop.city.trim()) return "City is required.";
    if (!data.shop.state.trim()) return "Please select state.";
    if (data.shop.pinCode && !/^\d{6}$/.test(data.shop.pinCode)) return "PIN Code must be 6 digits.";
    if (data.shop.mobile && !/^\d{10}$/.test(data.shop.mobile)) return "Mobile number must be 10 digits.";
    if (data.shop.whatsapp && !/^\d{10}$/.test(data.shop.whatsapp)) return "WhatsApp number must be 10 digits.";
    if (data.shop.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.shop.email)) return "Enter a valid shop email.";
    return "";
  }

  function handleCancel() {
    setData(savedData);
    setMessage("");
    setError("");
  }

  async function saveProfile() {
    setMessage("");
    setError("");
    const validationError = validateShop();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!hasStoredSession()) {
      setError("Please login first.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await apiFetch("/api/profile/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message ?? "Could not save profile.");
        return;
      }

      storeSession(result);
      window.dispatchEvent(new Event("cafemitra:profile-updated"));
      setData(result);
      setSavedData(result);
      setMessage("Cafe setup saved successfully.");
    } catch {
      setError("Could not connect to server. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function changePassword() {
    setMessage("");
    setError("");
    if (!hasStoredSession()) {
      setError("Please login first.");
      return;
    }

    const passwordError = getPasswordStrengthError(passwords.newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const response = await apiFetch("/api/auth/change-password/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(passwords),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.message ?? "Could not change password.");
      return;
    }

    setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setMessage(result.message ?? "Password changed successfully.");
  }

  return (
    <>
      {message ? <div className="profile-alert success">{message}</div> : null}
      {error ? <div className="profile-alert error">{error}</div> : null}
      <section className="profile-layout">
        <article className="panel profile-card">
          <div className="profile-section-title">
            <UserRound size={18} />
            <h2>Owner Profile</h2>
          </div>
          <div className="profile-owner-grid">
            <ProfileInput label="Owner Name" value={data.user.fullName} onChange={(value) => updateUser("fullName", value)} />
            <ProfileInput label="Email" value={data.user.email} onChange={(value) => updateUser("email", value)} />
            <ProfileInput label="Mobile" value={data.user.phone} onChange={(value) => updateUser("phone", value)} />
            {/* <ProfileInput label="User ID" value={data.user.id} readOnly /> */}
          </div>
        </article>

        <article className="panel profile-card">
          <div className="profile-section-title">
            <LockKeyhole size={18} />
            <h2>Change Password</h2>
          </div>
          <div className="profile-owner-grid">
            <ProfileInput
              label="Current Password"
              type="password"
              value={passwords.currentPassword}
              onChange={(value) => setPasswords((current) => ({ ...current, currentPassword: value }))}
            />
            <ProfileInput
              label="New Password"
              type="password"
              placeholder={passwordRequirementHint}
              value={passwords.newPassword}
              onChange={(value) => setPasswords((current) => ({ ...current, newPassword: value }))}
            />
            <ProfileInput
              label="Confirm Password"
              type="password"
              value={passwords.confirmPassword}
              onChange={(value) => setPasswords((current) => ({ ...current, confirmPassword: value }))}
            />
          </div>
          <div className="profile-actions">
            <button className="btn btn-primary" type="button" onClick={changePassword}>
              Change Password
            </button>
          </div>
        </article>

        <article className="panel profile-card profile-wide">
          <div className="profile-section-title">
            <Building2 size={18} />
            <h2>Cafe Setup</h2>
          </div>
          <div className="profile-subtitle">Shop Information</div>
          <div className="profile-owner-grid">
            <ProfileInput label="Shop Name *" value={data.shop.shopName} onChange={(value) => updateShop("shopName", value)} />
            <ProfileInput label="Address (optional)" value={data.shop.address} onChange={(value) => updateShop("address", value)} />
            <ProfileInput label="City *" value={data.shop.city} onChange={(value) => updateShop("city", value)} />
            <ProfileSelect label="State *" value={data.shop.state} options={indianStates} onChange={(value) => updateShop("state", value)} />
            <ProfileInput label="PIN Code (optional)" value={data.shop.pinCode} onChange={(value) => updateShop("pinCode", value)} />
            <ProfileInput label="Mobile (optional)" value={data.shop.mobile} onChange={(value) => updateShop("mobile", value)} />
            <ProfileInput label="WhatsApp (optional)" value={data.shop.whatsapp} onChange={(value) => updateShop("whatsapp", value)} />
            <ProfileInput label="Email (optional)" value={data.shop.email} onChange={(value) => updateShop("email", value)} />
          </div>
          <div className="profile-actions">
            <button className="btn" type="button" onClick={handleCancel}>
              Cancel
            </button>
            <button className="btn btn-primary" type="button" onClick={saveProfile} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </article>
      </section>
    </>
  );
}

function ProfileInput({
  label,
  type = "text",
  placeholder,
  value,
  readOnly,
  onChange,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
}) {
  const isPasswordField = type === "password";
  const [showPassword, setShowPassword] = useState(false);
  const inputType = isPasswordField ? (showPassword ? "text" : "password") : type;

  return (
    <label className="profile-input">
      <span>{label}</span>
      <span className={isPasswordField ? "profile-input-wrap profile-input-wrap-password" : "profile-input-wrap"}>
        <input
          type={inputType}
          placeholder={placeholder}
          value={type === "file" ? undefined : value}
          readOnly={readOnly}
          onChange={(event) => onChange?.(event.target.value)}
        />
        {isPasswordField ? (
          <button
            type="button"
            className="auth-toggle-visibility profile-toggle-visibility"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((current) => !current)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        ) : null}
      </span>
    </label>
  );
}

function ProfileSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="profile-input">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Select State</option>
        {options.map((option) => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function readJson<T>(key: string): Partial<T> {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}") as Partial<T>;
  } catch {
    return {};
  }
}
