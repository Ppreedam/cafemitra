import Link from "next/link";

/*
 * Internal link targets shared by every /solutions page. The SEO briefs plan dedicated /features/*,
 * /compare/*, /security/* and /support/* pages that do not exist yet. Until they ship, each link
 * points at the closest live page so no crawler or visitor hits a 404. Swap the value here (and
 * nowhere else) once the planned URL (shown in the comment) goes live.
 */
export const LINKS = {
  whatsapp: "/print-automation", // planned: /compare/repetigo-vs-whatsapp
  qr: "/print-automation", // planned: /features/qr-upload
  ai: "/print-automation", // planned: /features/ai-enhancement
  autodelete: "/print-automation", // planned: /features/auto-delete
  queue: "/print-automation", // planned: /features/print-queue
  payment: "/pricing", // planned: /features/payment-collection
  analytics: "/print-automation", // planned: /features/analytics
  audit: "/print-automation", // planned: /features/audit-trail
  aadhaar: "/id-card-print", // planned: /use-cases/print-aadhaar
  govforms: "/print-automation", // planned: /use-cases/print-government-forms
  certificates: "/print-automation", // planned: /use-cases/print-certificates
  compliance: "/privacy-policy", // planned: /security/compliance
  security: "/privacy-policy", // planned: /security
  pricing: "/pricing",
  contact: "/contact-us",
  printpilot: "/print-automation", // planned: /products/printpilot
  bridge: "/help-support", // planned: /support/download-print-bridge
  printers: "/help-support", // planned: /support/printer-compatibility
} as const;

export type LinkKey = keyof typeof LINKS;

/** Inline markup: **bold**, [anchor text](@linkKey) and [anchor text](https://external). Keeps copy and schema text in one source. */
const LINK_TARGET = String.raw`@[a-z]+|https?://[^)\s]+`;
const TOKEN = new RegExp(String.raw`(\*\*[^*]+\*\*|\[[^\]]+\]\((?:${LINK_TARGET})\))`, "g");
const LINK_PART = new RegExp(String.raw`^\[([^\]]+)\]\((${LINK_TARGET})\)$`);
const LINK_ANY = new RegExp(String.raw`\[([^\]]+)\]\((?:${LINK_TARGET})\)`, "g");

export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(TOKEN).map((part, i) => {
        const link = part.match(LINK_PART);
        if (link) {
          if (link[2].startsWith("@")) {
            return (
              <Link href={LINKS[link[2].slice(1) as LinkKey]} key={i}>
                {link[1]}
              </Link>
            );
          }
          return (
            <a href={link[2]} key={i}>
              {link[1]}
            </a>
          );
        }
        if (part.startsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
        return part;
      })}
    </>
  );
}

export function plain(text: string) {
  return text.replace(/\*\*([^*]+)\*\*/g, "$1").replace(LINK_ANY, "$1");
}
