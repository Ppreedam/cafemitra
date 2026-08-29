import type { Metadata } from "next";
import IdCardUploadClient from "../IdCardUploadClient";
import { JsonLd, StructuredSeoCopy } from "../SeoContent";

const pageUrl = "https://repetigo.com/id-card-maker/eshram";

export const metadata: Metadata = {
  title: "e-Shram Card Maker from PDF Online Free | RepetiGo",
  description:
    "Turn your downloaded e-Shram UAN PDF into a clean, print-ready e-Shram card - upload the PDF, review the extracted details, and print. Free.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "e-Shram Card Maker from PDF Online Free | RepetiGo",
    description: "Upload your e-Shram PDF, review the details, and print a ready-to-use e-Shram card. Free, no sign-up required to try.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "e-Shram Card Maker from PDF - RepetiGo",
    description: "Create a printable e-Shram card from your UAN PDF - upload, review, and print.",
  },
  robots: { index: true, follow: true },
};

const eshramContent = String.raw`H1: e-Shram Card Maker from PDF - Free Online.

The e-Shram UAN PDF downloaded from the eshram.gov.in portal (Ministry of Labour & Employment) is a document page, not a card. RepetiGo's e-Shram Card Maker takes that downloaded PDF, pulls out the printed details, and lays them out on a proper card-sized e-Shram layout - ready to print at any cyber cafe or print shop.

This tool is free to build and preview. Printing or downloading the final card needs a free RepetiGo login, since generating that output file needs an account to save it against.


H2: Why Recreate an e-Shram Card from the PDF?

Unorganised sector workers often need to show a physical e-Shram card at worksites or when applying for welfare schemes, but the downloaded PDF is a full document page, not a wallet-sized card. Recreating the layout from the PDF gives a clean, correctly-sized print instead of the full PDF page.

H3: Step 1 - Upload Your e-Shram PDF
Download your e-Shram UAN card as a PDF from eshram.gov.in, then upload it here.

H3: Step 2 - Extract and Review the Details
Tap Extract Text. The tool reads the name, date of birth, gender, UAN number, and occupation category from the PDF and fills them into an editable form.

H3: Step 3 - Preview, Choose Layout, and Print
The recreated e-Shram card appears with a front side (name, DOB, gender) and a back side (category, address). Choose Color or Black & White and how many cards fit per A4 sheet, then print.


H2: Common Questions About the e-Shram Card Maker.

H3: Do I need my physical e-Shram card to use this?
No. Upload the e-Shram PDF downloaded from eshram.gov.in - there is no need to scan a physical card.

H3: Can I edit the details before printing?
Yes. After extracting the text, every field is an editable text box.

H3: How many e-Shram cards can I print on one sheet?
Choose 2, 4, 6, or 8 cards per A4 sheet, in color or black and white, before printing.


H2: More ID Card Types from RepetiGo.

Need a different document card? RepetiGo also recreates printable Aadhaar cards, EPFO/UAN cards, and Ayushman cards from their downloaded PDFs.

[ Open Aadhaar Card Maker → /id-card-maker/aadhaar ]
[ Open EPFO / UAN Card Maker → /id-card-maker/epfo ]
[ Open Ayushman Card Maker → /id-card-maker/ayushman ]
[ See All ID Card Types → /id-card-maker ]


[ Make Your e-Shram Card Now → repetigo.com/id-card-maker/eshram ]`;

const faqSchemaQuestions = [
  ["Do I need my physical e-Shram card to use this?", "No. Upload the e-Shram PDF downloaded from eshram.gov.in - there is no need to scan a physical card."],
  ["Can I edit the details before printing?", "Yes. After extracting the text, every field is an editable text box."],
  ["How many e-Shram cards can I print on one sheet?", "Choose 2, 4, 6, or 8 cards per A4 sheet, in color or black and white, before printing."],
] as const;

export default function EshramCardMakerPage() {
  return (
    <IdCardUploadClient docType="eshram">
      <JsonLd
        toolName="RepetiGo e-Shram Card Maker"
        description="Free tool to recreate a printable e-Shram card from a downloaded UAN PDF."
        pageUrl={pageUrl}
        breadcrumbLabel="e-Shram Card Maker"
        faqSchemaQuestions={faqSchemaQuestions}
      />
      <article className="tool-seo-content" id="eshram-card-maker-guide">
        <StructuredSeoCopy content={eshramContent} />
      </article>
    </IdCardUploadClient>
  );
}
