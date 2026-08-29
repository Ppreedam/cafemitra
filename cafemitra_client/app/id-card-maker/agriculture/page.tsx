import type { Metadata } from "next";
import IdCardUploadClient from "../IdCardUploadClient";
import { JsonLd, StructuredSeoCopy } from "../SeoContent";

const pageUrl = "https://repetigo.com/id-card-maker/agriculture";

export const metadata: Metadata = {
  title: "Agriculture / Kisan Card Maker from PDF Online Free | RepetiGo",
  description:
    "Turn your downloaded Agriculture / Kisan card PDF into a clean, print-ready farmer ID card - upload the PDF, review the extracted details, and print. Free.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Agriculture / Kisan Card Maker from PDF Online Free | RepetiGo",
    description: "Upload your Agriculture / Kisan card PDF, review the details, and print a ready-to-use farmer ID card. Free, no sign-up required to try.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Agriculture Card Maker from PDF - RepetiGo",
    description: "Create a printable Agriculture / Kisan card from your PDF - upload, review, and print.",
  },
  robots: { index: true, follow: true },
};

const agricultureContent = String.raw`H1: Agriculture / Kisan Card Maker from PDF - Free Online.

The Agriculture / Farmer ID (Kisan) card PDF downloaded from your state's agriculture department portal or the PM-Kisan portal is a document page, not a card. RepetiGo's Agriculture Card Maker takes that downloaded PDF, pulls out the printed details, and lays them out on a proper card-sized farmer ID layout - ready to print at any cyber cafe or print shop.

This tool is free to build and preview. Printing or downloading the final card needs a free RepetiGo login, since generating that output file needs an account to save it against.


H2: Why Recreate an Agriculture Card from the PDF?

Farmers are often asked to show a physical farmer ID card at procurement centres, subsidy counters, or bank branches, but the downloaded PDF is a full document page. Recreating the layout from the PDF gives a clean, correctly-sized print instead of the full PDF page.

H3: Step 1 - Upload Your Agriculture / Kisan PDF
Download your Farmer ID as a PDF from your state's agriculture department portal or the PM-Kisan portal, then upload it here.

H3: Step 2 - Extract and Review the Details
Tap Extract Text. The tool reads the farmer's name, Farmer/Kisan ID, village/district, and land area from the PDF and fills them into an editable form.

H3: Step 3 - Preview, Choose Layout, and Print
The recreated Agriculture card appears with a front side (name, village/district) and a back side (land area). Choose Color or Black & White and how many cards fit per A4 sheet, then print.


H2: Common Questions About the Agriculture Card Maker.

H3: Do I need a physical farmer ID card to use this?
No. Upload the Agriculture / Kisan PDF downloaded from your state's agriculture department portal or the PM-Kisan portal - there is no need to scan a physical card.

H3: Can I edit the details before printing?
Yes. After extracting the text, every field is an editable text box.

H3: How many Agriculture cards can I print on one sheet?
Choose 2, 4, 6, or 8 cards per A4 sheet, in color or black and white, before printing.


H2: More ID Card Types from RepetiGo.

Need a different document card? RepetiGo also recreates printable Aadhaar cards, Ration cards, and Driving Licence cards from their downloaded PDFs.

[ Open Aadhaar Card Maker → /id-card-maker/aadhaar ]
[ Open Ration Card Maker → /id-card-maker/ration ]
[ Open Driving Licence Maker → /id-card-maker/dl ]
[ See All ID Card Types → /id-card-maker ]


[ Make Your Agriculture Card Now → repetigo.com/id-card-maker/agriculture ]`;

const faqSchemaQuestions = [
  ["Do I need a physical farmer ID card to use this?", "No. Upload the Agriculture / Kisan PDF downloaded from your state's agriculture department portal or the PM-Kisan portal - there is no need to scan a physical card."],
  ["Can I edit the details before printing?", "Yes. After extracting the text, every field is an editable text box."],
  ["How many Agriculture cards can I print on one sheet?", "Choose 2, 4, 6, or 8 cards per A4 sheet, in color or black and white, before printing."],
] as const;

export default function AgricultureCardMakerPage() {
  return (
    <IdCardUploadClient docType="agriculture">
      <JsonLd
        toolName="RepetiGo Agriculture Card Maker"
        description="Free tool to recreate a printable Agriculture / Kisan card from a downloaded PDF."
        pageUrl={pageUrl}
        breadcrumbLabel="Agriculture Card Maker"
        faqSchemaQuestions={faqSchemaQuestions}
      />
      <article className="tool-seo-content" id="agriculture-card-maker-guide">
        <StructuredSeoCopy content={agricultureContent} />
      </article>
    </IdCardUploadClient>
  );
}
