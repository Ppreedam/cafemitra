import type { Metadata } from "next";
import IdCardUploadClient from "../IdCardUploadClient";
import { JsonLd, StructuredSeoCopy } from "../SeoContent";

const pageUrl = "https://repetigo.com/id-card-maker/ayushman";

export const metadata: Metadata = {
  title: "Ayushman Card Maker from PDF Online Free | RepetiGo",
  description:
    "Turn your downloaded Ayushman Bharat (PM-JAY) PDF into a clean, print-ready health card - upload the PDF, review the extracted details, and print. Free.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Ayushman Card Maker from PDF Online Free | RepetiGo",
    description: "Upload your Ayushman Bharat PDF, review the details, and print a ready-to-use PM-JAY card. Free, no sign-up required to try.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Ayushman Card Maker from PDF - RepetiGo",
    description: "Create a printable Ayushman Bharat (PM-JAY) card from your PDF - upload, review, and print.",
  },
  robots: { index: true, follow: true },
};

const ayushmanContent = String.raw`H1: Ayushman Card Maker from PDF - Free Online.

The Ayushman Bharat (PM-JAY) card PDF downloaded from the Beneficiary Identification System (BIS) or the Ayushman app is a document page, not a card. RepetiGo's Ayushman Card Maker takes that downloaded PDF, pulls out the printed details, and lays them out on a proper card-sized layout - ready to print at any cyber cafe or print shop.

This tool is free to build and preview. Printing or downloading the final card needs a free RepetiGo login, since generating that output file needs an account to save it against.


H2: Why Recreate an Ayushman Card from the PDF?

Hospitals and health camps often ask beneficiaries to show a physical Ayushman card, but the downloaded PDF is a full document page, not a wallet-sized card. Recreating the layout from the PDF gives a clean, correctly-sized print instead of the full PDF page.

H3: Step 1 - Upload Your Ayushman Bharat PDF
Download your PM-JAY card as a PDF from the Beneficiary Identification System or the Ayushman app, then upload it here.

H3: Step 2 - Extract and Review the Details
Tap Extract Text. The tool reads the name, date of birth, gender, PM-JAY ID, and family ID from the PDF and fills them into an editable form.

H3: Step 3 - Preview, Choose Layout, and Print
The recreated Ayushman card appears with a front side (name, DOB, gender) and a back side (family ID, address). Choose Color or Black & White and how many cards fit per A4 sheet, then print.


H2: Common Questions About the Ayushman Card Maker.

H3: Do I need my physical Ayushman card to use this?
No. Upload the PM-JAY PDF downloaded from the Beneficiary Identification System or the Ayushman app - there is no need to scan a physical card.

H3: Can I edit the details before printing?
Yes. After extracting the text, every field is an editable text box.

H3: How many Ayushman cards can I print on one sheet?
Choose 2, 4, 6, or 8 cards per A4 sheet, in color or black and white, before printing.


H2: More ID Card Types from RepetiGo.

Need a different document card? RepetiGo also recreates printable Aadhaar cards, Voter ID cards, and Ration cards from their downloaded PDFs.

[ Open Aadhaar Card Maker → /id-card-maker/aadhaar ]
[ Open Voter ID Card Maker → /id-card-maker/voter ]
[ Open Ration Card Maker → /id-card-maker/ration ]
[ See All ID Card Types → /id-card-maker ]


[ Make Your Ayushman Card Now → repetigo.com/id-card-maker/ayushman ]`;

const faqSchemaQuestions = [
  ["Do I need my physical Ayushman card to use this?", "No. Upload the PM-JAY PDF downloaded from the Beneficiary Identification System or the Ayushman app - there is no need to scan a physical card."],
  ["Can I edit the details before printing?", "Yes. After extracting the text, every field is an editable text box."],
  ["How many Ayushman cards can I print on one sheet?", "Choose 2, 4, 6, or 8 cards per A4 sheet, in color or black and white, before printing."],
] as const;

export default function AyushmanCardMakerPage() {
  return (
    <IdCardUploadClient docType="ayushman">
      <JsonLd
        toolName="RepetiGo Ayushman Card Maker"
        description="Free tool to recreate a printable Ayushman Bharat (PM-JAY) card from a downloaded PDF."
        pageUrl={pageUrl}
        breadcrumbLabel="Ayushman Card Maker"
        faqSchemaQuestions={faqSchemaQuestions}
      />
      <article className="tool-seo-content" id="ayushman-card-maker-guide">
        <StructuredSeoCopy content={ayushmanContent} />
      </article>
    </IdCardUploadClient>
  );
}
