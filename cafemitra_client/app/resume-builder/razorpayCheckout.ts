import { apiUrl } from "@/lib/api";

type RazorpayCheckout = { open: () => void };
type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayCheckout;

export function loadRazorpayScript() {
  const src = "https://checkout.razorpay.com/v1/checkout.js";
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "true") resolve();
      else existing.addEventListener("load", () => resolve(), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error("Payment checkout could not load."));
    document.body.appendChild(script);
  });
}

/// Opens Razorpay checkout for a resume PrintOrder that's already Online +
/// pending, reusing the same anonymous, order-id-scoped endpoints every
/// other public order type pays through. `onPaid` fires once the payment is
/// verified server-side; `onDismiss` fires if the customer closes the modal
/// without paying.
export async function payResumeOrderWithRazorpay({
  orderId,
  onPaid,
  onError,
  onDismiss,
}: {
  orderId: number;
  onPaid: (paymentStatus: string) => void;
  onError: (message: string) => void;
  onDismiss?: () => void;
}) {
  await loadRazorpayScript();
  const response = await fetch(apiUrl(`/api/public-orders/${orderId}/razorpay/order/`), { method: "POST" });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || "Could not start payment.");

  const Razorpay = (window as typeof window & { Razorpay?: RazorpayConstructor }).Razorpay;
  if (!Razorpay) throw new Error("Payment checkout could not load.");

  const checkout = new Razorpay({
    key: result.payment.keyId,
    amount: result.payment.amount,
    currency: result.payment.currency,
    name: result.payment.name,
    description: result.payment.description,
    order_id: result.payment.gatewayOrderId,
    theme: { color: "#2563eb" },
    handler: async (payment: Record<string, string>) => {
      try {
        const verifyResponse = await fetch(apiUrl(`/api/public-orders/${orderId}/razorpay/verify/`), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payment),
        });
        const verified = await verifyResponse.json().catch(() => ({}));
        if (!verifyResponse.ok) throw new Error(verified.message || "Payment verification failed.");
        onPaid(verified.order?.paymentStatus || "paid");
      } catch (reason) {
        onError(reason instanceof Error ? reason.message : "Payment verification failed.");
      }
    },
    modal: { ondismiss: () => onDismiss?.() },
  });
  checkout.open();
}
