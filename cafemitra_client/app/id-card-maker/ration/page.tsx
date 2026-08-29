import type { Metadata } from "next";
import IdCardUploadClient from "../IdCardUploadClient";
import { JsonLd, StructuredSeoCopy } from "../SeoContent";

const pageUrl = "https://repetigo.com/id-card-maker/ration";

export const metadata: Metadata = {
  title: "Ration Card Maker from PDF Online Free | RepetiGo",
  description:
    "Turn your downloaded Ration Card PDF into a clean, print-ready card - upload the PDF, review the extracted details, and print. Free.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Ration Card Maker from PDF Online Free | RepetiGo",
    description: "Upload your Ration Card PDF, review the details, and print a ready-to-use card. Free, no sign-up required to try.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Ration Card Maker from PDF - RepetiGo",
    description: "Create a printable Ration card from your PDF - upload, review, and print.",
  },
  robots: { index: true, follow: true },
};

const rationContent = String.raw`H1: Ration Card Maker from PDF - Free Online.

The Ration Card PDF downloaded from your state's Public Distribution System (PDS) portal or the Mera Ration app is a document page, not a card. RepetiGo's Ration Card Maker takes that downloaded PDF, pulls out the printed details, and lays them out on a proper card-sized layout - ready to print at any cyber cafe or print shop.

This tool is free to build and preview. Printing or downloading the final card needs a free RepetiGo login, since generating that output file needs an account to save it against.


H2: Why Recreate a Ration Card from the PDF?

Ration shops and welfare offices often expect a compact, card-shaped copy, but the downloaded PDF is a full document page. Recreating the layout from the PDF gives a clean, correctly-sized print instead of the full PDF page.

H3: Step 1 - Upload Your Ration Card PDF
Download your Ration Card as a PDF from your state's PDS portal or the Mera Ration app, then upload it here.

H3: Step 2 - Extract and Review the Details
Tap Extract Text. The tool reads the head of family's name, ration card number, and category (like Priority/PHH) from the PDF and fills them into an editable form.

H3: Step 3 - Preview, Choose Layout, and Print
The recreated Ration card appears with a front side (name, category) and a back side (address). Choose Color or Black & White and how many cards fit per A4 sheet, then print.


H2: Common Questions About the Ration Card Maker.

H3: Do I need my physical ration card to use this?
No. Upload the Ration Card PDF downloaded from your state's PDS portal or the Mera Ration app - there is no need to scan a physical card.

H3: Can I edit the details before printing?
Yes. After extracting the text, every field is an editable text box.

H3: How many Ration cards can I print on one sheet?
Choose 2, 4, 6, or 8 cards per A4 sheet, in color or black and white, before printing.


H2: More ID Card Types from RepetiGo.

Need a different document card? RepetiGo also recreates printable Aadhaar cards, Ayushman cards, and Agriculture cards from their downloaded PDFs.

[ Open Aadhaar Card Maker → /id-card-maker/aadhaar ]
[ Open Ayushman Card Maker → /id-card-maker/ayushman ]
[ Open Agriculture Card Maker → /id-card-maker/agriculture ]
[ See All ID Card Types → /id-card-maker ]


[ Make Your Ration Card Now → repetigo.com/id-card-maker/ration ]`;

const faqSchemaQuestions = [
  ["Do I need my physical ration card to use this?", "No. Upload the Ration Card PDF downloaded from your state's PDS portal or the Mera Ration app - there is no need to scan a physical card."],
  ["Can I edit the details before printing?", "Yes. After extracting the text, every field is an editable text box."],
  ["How many Ration cards can I print on one sheet?", "Choose 2, 4, 6, or 8 cards per A4 sheet, in color or black and white, before printing."],
] as const;

export default function RationCardMakerPage() {
  return (
    <IdCardUploadClient docType="ration">
      <JsonLd
        toolName="RepetiGo Ration Card Maker"
        description="Free tool to recreate a printable Ration card from a downloaded PDF."
        pageUrl={pageUrl}
        breadcrumbLabel="Ration Card Maker"
        faqSchemaQuestions={faqSchemaQuestions}
      />
      <article className="tool-seo-content" id="ration-card-maker-guide">
        <StructuredSeoCopy content={rationContent} />
      </article>
    </IdCardUploadClient>
  );
}
