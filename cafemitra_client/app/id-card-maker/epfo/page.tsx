import type { Metadata } from "next";
import IdCardUploadClient from "../IdCardUploadClient";
import { JsonLd, StructuredSeoCopy } from "../SeoContent";

const pageUrl = "https://repetigo.com/id-card-maker/epfo";

export const metadata: Metadata = {
  title: "EPFO / UAN Card Maker from PDF Online Free | RepetiGo",
  description:
    "Turn your downloaded EPFO / UAN PDF into a clean, print-ready card - upload the PDF, review the extracted details, and print. Free.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "EPFO / UAN Card Maker from PDF Online Free | RepetiGo",
    description: "Upload your EPFO / UAN PDF, review the details, and print a ready-to-use card. Free, no sign-up required to try.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "EPFO / UAN Card Maker from PDF - RepetiGo",
    description: "Create a printable EPFO / UAN card from your PDF - upload, review, and print.",
  },
  robots: { index: true, follow: true },
};

const epfoContent = String.raw`H1: EPFO / UAN Card Maker from PDF - Free Online.

The UAN (Universal Account Number) PDF downloaded from the EPFO member portal is a document page, not a card. RepetiGo's EPFO Card Maker takes that downloaded PDF, pulls out the printed details, and lays them out on a proper card-sized layout - ready to print at any cyber cafe or print shop.

This tool is free to build and preview. Printing or downloading the final card needs a free RepetiGo login, since generating that output file needs an account to save it against.


H2: Why Recreate an EPFO / UAN Card from the PDF?

Employees are often asked to carry a physical UAN card copy for HR or verification purposes, but the downloaded PDF is a full document page. Recreating the layout from the PDF gives a clean, correctly-sized print instead of the full PDF page.

H3: Step 1 - Upload Your EPFO / UAN PDF
Download your UAN card as a PDF from the EPFO member portal, then upload it here.

H3: Step 2 - Extract and Review the Details
Tap Extract Text. The tool reads the name, date of birth, UAN number, and employer name from the PDF and fills them into an editable form.

H3: Step 3 - Preview, Choose Layout, and Print
The recreated EPFO card appears with a front side (name, date of birth) and a back side (employer name). Choose Color or Black & White and how many cards fit per A4 sheet, then print.


H2: Common Questions About the EPFO / UAN Card Maker.

H3: Do I need a physical UAN card to use this?
No. Upload the UAN PDF downloaded from the EPFO member portal - there is no need to scan a physical card.

H3: Can I edit the details before printing?
Yes. After extracting the text, every field is an editable text box.

H3: How many EPFO cards can I print on one sheet?
Choose 2, 4, 6, or 8 cards per A4 sheet, in color or black and white, before printing.


H2: More ID Card Types from RepetiGo.

Need a different document card? RepetiGo also recreates printable PAN cards, e-Shram cards, and APAAR ID cards from their downloaded PDFs.

[ Open PAN Card Maker → /id-card-maker/pan ]
[ Open e-Shram Card Maker → /id-card-maker/eshram ]
[ Open APAAR ID Card Maker → /id-card-maker/apaar ]
[ See All ID Card Types → /id-card-maker ]


[ Make Your EPFO Card Now → repetigo.com/id-card-maker/epfo ]`;

const faqSchemaQuestions = [
  ["Do I need a physical UAN card to use this?", "No. Upload the UAN PDF downloaded from the EPFO member portal - there is no need to scan a physical card."],
  ["Can I edit the details before printing?", "Yes. After extracting the text, every field is an editable text box."],
  ["How many EPFO cards can I print on one sheet?", "Choose 2, 4, 6, or 8 cards per A4 sheet, in color or black and white, before printing."],
] as const;

export default function EpfoCardMakerPage() {
  return (
    <IdCardUploadClient docType="epfo">
      <JsonLd
        toolName="RepetiGo EPFO / UAN Card Maker"
        description="Free tool to recreate a printable EPFO / UAN card from a downloaded PDF."
        pageUrl={pageUrl}
        breadcrumbLabel="EPFO / UAN Card Maker"
        faqSchemaQuestions={faqSchemaQuestions}
      />
      <article className="tool-seo-content" id="epfo-card-maker-guide">
        <StructuredSeoCopy content={epfoContent} />
      </article>
    </IdCardUploadClient>
  );
}
