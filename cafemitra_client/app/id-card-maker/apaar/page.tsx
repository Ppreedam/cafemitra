import type { Metadata } from "next";
import IdCardUploadClient from "../IdCardUploadClient";
import { JsonLd, StructuredSeoCopy } from "../SeoContent";

const pageUrl = "https://repetigo.com/id-card-maker/apaar";

export const metadata: Metadata = {
  title: "APAAR ID Card Maker from PDF Online Free | RepetiGo",
  description:
    "Turn your downloaded APAAR (student) ID PDF into a clean, print-ready card - upload the PDF, review the extracted details, and print. Free.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "APAAR ID Card Maker from PDF Online Free | RepetiGo",
    description: "Upload your APAAR ID PDF, review the details, and print a ready-to-use student ID card. Free, no sign-up required to try.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "APAAR ID Card Maker from PDF - RepetiGo",
    description: "Create a printable APAAR student ID card from your PDF - upload, review, and print.",
  },
  robots: { index: true, follow: true },
};

const apaarContent = String.raw`H1: APAAR ID Card Maker from PDF - Free Online.

The APAAR ID (Automated Permanent Academic Account Registry - the "One Nation One Student ID") PDF downloaded from your school's portal or DigiLocker is a document page, not a card. RepetiGo's APAAR ID Card Maker takes that downloaded PDF, pulls out the printed details, and lays them out on a proper card-sized student ID layout - ready to print at any cyber cafe or print shop.

This tool is free to build and preview. Printing or downloading the final card needs a free RepetiGo login, since generating that output file needs an account to save it against.


H2: Why Recreate an APAAR ID Card from the PDF?

Schools and colleges increasingly ask students to carry a physical APAAR ID card, but the downloaded PDF is a full document page, not a wallet-sized card. Recreating the layout from the PDF gives a clean, correctly-sized print instead of the full PDF page.

H3: Step 1 - Upload Your APAAR ID PDF
Download your APAAR ID as a PDF from your school's portal or DigiLocker, then upload it here.

H3: Step 2 - Extract and Review the Details
Tap Extract Text. The tool reads the student's name, date of birth, APAAR ID, and institution name from the PDF and fills them into an editable form.

H3: Step 3 - Preview, Choose Layout, and Print
The recreated APAAR ID card appears with a front side (name, date of birth) and a back side (institution name). Choose Color or Black & White and how many cards fit per A4 sheet, then print.


H2: Common Questions About the APAAR ID Card Maker.

H3: Do I need a physical APAAR card to use this?
No. Upload the APAAR ID PDF downloaded from your school's portal or DigiLocker - there is no need to scan a physical card.

H3: Can I edit the details before printing?
Yes. After extracting the text, every field is an editable text box.

H3: How many APAAR ID cards can I print on one sheet?
Choose 2, 4, 6, or 8 cards per A4 sheet, in color or black and white, before printing.


H2: More ID Card Types from RepetiGo.

Need a different document card? RepetiGo also recreates printable Aadhaar cards, EPFO/UAN cards, and Driving Licence cards from their downloaded PDFs.

[ Open Aadhaar Card Maker → /id-card-maker/aadhaar ]
[ Open EPFO / UAN Card Maker → /id-card-maker/epfo ]
[ Open Driving Licence Maker → /id-card-maker/dl ]
[ See All ID Card Types → /id-card-maker ]


[ Make Your APAAR ID Card Now → repetigo.com/id-card-maker/apaar ]`;

const faqSchemaQuestions = [
  ["Do I need a physical APAAR card to use this?", "No. Upload the APAAR ID PDF downloaded from your school's portal or DigiLocker - there is no need to scan a physical card."],
  ["Can I edit the details before printing?", "Yes. After extracting the text, every field is an editable text box."],
  ["How many APAAR ID cards can I print on one sheet?", "Choose 2, 4, 6, or 8 cards per A4 sheet, in color or black and white, before printing."],
] as const;

export default function ApaarCardMakerPage() {
  return (
    <IdCardUploadClient docType="apaar">
      <JsonLd
        toolName="RepetiGo APAAR ID Card Maker"
        description="Free tool to recreate a printable APAAR (student) ID card from a downloaded PDF."
        pageUrl={pageUrl}
        breadcrumbLabel="APAAR ID Card Maker"
        faqSchemaQuestions={faqSchemaQuestions}
      />
      <article className="tool-seo-content" id="apaar-card-maker-guide">
        <StructuredSeoCopy content={apaarContent} />
      </article>
    </IdCardUploadClient>
  );
}
