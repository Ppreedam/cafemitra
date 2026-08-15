"use client";

import { useState } from "react";
import { CircleDollarSign, RefreshCw } from "lucide-react";
import { customerPriceForTemplate, useCustomerPricing } from "../useCustomerPricing";
import { payResumeOrderWithRazorpay } from "../razorpayCheckout";

type SavedOrderLike = { id: number; forCustomer: boolean; paymentStatus: string; paymentMode: string; totalAmount: number };

// Generic "charge a walk-in customer for this document" panel - shared by
// every document builder (resume, biodata, ...). `payResumeOrderWithRazorpay`
// is itself generic (just needs an order id) despite the resume-specific
// name.
export default function CustomerOrderPanel<TId extends string, TOrder extends SavedOrderLike>({
  template,
  serviceKey,
  itemLabel,
  savedOrder,
  forCustomer,
  onForCustomerChange,
  paymentMode,
  onPaymentModeChange,
  onSave,
  saveBusy,
  onOrderUpdate,
  onRefresh,
  refreshBusy,
}: {
  template: TId;
  serviceKey: string;
  itemLabel: string;
  savedOrder: TOrder | null;
  forCustomer: boolean;
  onForCustomerChange: (value: boolean) => void;
  paymentMode: "cash" | "online";
  onPaymentModeChange: (mode: "cash" | "online") => void;
  onSave: () => void;
  saveBusy: boolean;
  onOrderUpdate: (order: TOrder) => void;
  onRefresh: () => void;
  refreshBusy: boolean;
}) {
  const pricingService = useCustomerPricing(serviceKey);
  const price = customerPriceForTemplate(pricingService, template);
  const [payBusy, setPayBusy] = useState(false);
  const [payError, setPayError] = useState("");

  const isPaid = savedOrder?.forCustomer && savedOrder.paymentStatus === "paid";
  const isAwaitingOnline = savedOrder?.forCustomer && savedOrder.paymentMode === "Online" && savedOrder.paymentStatus === "pending";
  const isAwaitingCash = savedOrder?.forCustomer && savedOrder.paymentMode === "Cash" && savedOrder.paymentStatus !== "paid";

  async function payWithRazorpay() {
    if (!savedOrder || payBusy) return;
    setPayBusy(true);
    setPayError("");
    try {
      await payResumeOrderWithRazorpay({
        orderId: savedOrder.id,
        onPaid: (paymentStatus) => onOrderUpdate({ ...savedOrder, paymentStatus }),
        onError: setPayError,
        onDismiss: () => setPayBusy(false),
      });
    } catch (reason) {
      setPayError(reason instanceof Error ? reason.message : "Could not start payment.");
    } finally {
      setPayBusy(false);
    }
  }

  return (
    <fieldset className="resbuild-section resbuild-customer-panel">
      <h2>Charge a customer</h2>
      <label className="resbuild-customer-toggle">
        <input type="checkbox" checked={forCustomer} onChange={(event) => onForCustomerChange(event.target.checked)} />
        This {itemLabel} is for a walk-in customer
      </label>

      {forCustomer ? (
        <div className="resbuild-customer-details">
          <div className="resbuild-customer-price">
            <span>Price for this template</span>
            <strong>{pricingService ? `₹${price}` : "Loading..."}</strong>
          </div>

          {!isPaid ? (
            <>
              <div className="resbuild-customer-payment-modes">
                <button type="button" className={paymentMode === "online" ? "active" : ""} onClick={() => onPaymentModeChange("online")}>Online</button>
                <button type="button" className={paymentMode === "cash" ? "active" : ""} onClick={() => onPaymentModeChange("cash")}>Cash</button>
              </div>
              <button type="button" className="resbuild-btn-primary" onClick={onSave} disabled={saveBusy}>
                <CircleDollarSign size={16} /> {saveBusy ? "Saving..." : `Save & Charge ₹${price}`}
              </button>
            </>
          ) : null}

          {isPaid ? (
            <p className="resbuild-customer-paid">Paid - ₹{savedOrder!.totalAmount}. Download is unlocked below.</p>
          ) : null}

          {isAwaitingOnline ? (
            <div className="resbuild-customer-pay-block">
              <button type="button" className="resbuild-btn-primary" onClick={payWithRazorpay} disabled={payBusy}>
                {payBusy ? "Opening..." : `Pay ₹${savedOrder!.totalAmount} now`}
              </button>
              {payError ? <p className="resbuild-error">{payError}</p> : null}
            </div>
          ) : null}

          {isAwaitingCash ? (
            <div className="resbuild-customer-cash-wait">
              <p>Waiting for cash payment confirmation. Collect ₹{savedOrder!.totalAmount}, then go to Orders and click "Mark as Paid" - the download unlocks here right after.</p>
              <button type="button" className="resbuild-btn-secondary" onClick={onRefresh} disabled={refreshBusy}>
                <RefreshCw size={14} /> {refreshBusy ? "Checking..." : "Refresh status"}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </fieldset>
  );
}
