// Single source of truth for legal/business identity shown across
// Terms, Privacy, Disclaimer, Refund Policy, and Contact Us.
// Every page that needs this data reads from here, so one edit updates the whole site.

export const BUSINESS = {
  brandName: "RepetiGo",
  // Not incorporated with the MCA - operating as a sole proprietorship.
  // Never claim "Pvt. Ltd." status anywhere until the company is actually registered.
  entityType: "proprietorship" as const,
  ownerName: "Ankit Kumar",
  registeredAddress: "C/O Ankit Kumar, 79, Ward 05, Rasalpur, Bajpatti",
  city: "Sitamarhi",
  state: "Bihar",
  pincode: "843314",
  // WhatsApp-only number - does not take voice calls. Any page showing this
  // must label it "WhatsApp", never a plain "Phone"/"Call us" line.
  phone: "+91 76449 44485",
  // GST is optional below the registration threshold - leave null if not registered.
  gstin: null as string | null,
  jurisdictionCity: "Sitamarhi, Bihar",
  website: "https://repetigo.com",
  // Only support@ and billing@ are confirmed live inboxes - every other contact
  // purpose routes to support@ rather than listing unmonitored addresses
  // (legal@ / security@ / privacy@ / dpo@ would bounce if a reviewer emails them).
  supportEmail: "support@repetigo.com",
  legalEmail: "support@repetigo.com",
  billingEmail: "billing@repetigo.com",
  securityEmail: "support@repetigo.com",
  privacyEmail: "support@repetigo.com",
  dpoEmail: "support@repetigo.com",
  effectiveDate: "27 July 2026",
};

export function legalEntityStatement(): string {
  return `${BUSINESS.brandName} is a brand owned and operated by ${BUSINESS.ownerName}, a sole proprietorship business registered and operating in India. ${BUSINESS.brandName} is not currently incorporated as a private limited company or any other registered corporate entity.`;
}

export function formattedAddress(): string {
  return `${BUSINESS.registeredAddress}, ${BUSINESS.city}, ${BUSINESS.state} - ${BUSINESS.pincode}, India`;
}
