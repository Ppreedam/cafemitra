"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { apiUrl } from "@/lib/api";

const subjects = ["General Enquiry", "Sales", "Technical Support", "Billing", "Partnership", "Press & Media", "Other"];

export function ContactForm() {
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      fullName: String(formData.get("fullName") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      subject: String(formData.get("subject") || "").trim(),
      message: String(formData.get("message") || "").trim(),
    };

    setToast(null);
    setIsSending(true);

    try {
      const response = await fetch(apiUrl("/api/contact-us/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Could not send your message. Please try again.");
      }

      form.reset();
      setToast({ type: "success", message: data.message || "Message sent! We will reply within 24 hours." });
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Could not send your message. Please try again.",
      });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <label>
        <span>Full Name *</span>
        <input name="fullName" placeholder="Your full name" required />
      </label>
      <label>
        <span>Email Address *</span>
        <input name="email" type="email" placeholder="hello@yourshop.com" required />
      </label>
      <label>
        <span>Phone Number</span>
        <input name="phone" type="tel" placeholder="+91 98765 43210" />
      </label>
      <label>
        <span>Subject *</span>
        <select name="subject" required defaultValue="">
          <option value="" disabled>
            Select a subject
          </option>
          {subjects.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </label>
      <label className="contact-field-wide">
        <span>Message *</span>
        <textarea name="message" placeholder="Tell us how we can help..." rows={4} required />
      </label>
      {toast ? <p className={`contact-form-toast contact-form-toast-${toast.type}`}>{toast.message}</p> : null}
      <button type="submit" disabled={isSending}>
        {isSending ? (
          <>
            <Loader2 size={17} /> Sending...
          </>
        ) : (
          <>
            Send Message <Send size={17} />
          </>
        )}
      </button>
    </form>
  );
}
