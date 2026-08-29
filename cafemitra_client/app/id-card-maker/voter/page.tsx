import type { Metadata } from "next";
import IdCardUploadClient from "../IdCardUploadClient";
import { JsonLd, StructuredSeoCopy } from "../SeoContent";

const pageUrl = "https://repetigo.com/id-card-maker/voter";

export const metadata: Metadata = {
  title: "Voter ID Card Maker from PDF Online Free | RepetiGo",
  description:
    "Turn your downloaded e-EPIC (Voter ID) PDF into a clean, print-ready Voter ID card - upload the PDF, review the extracted details, and print. Free.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Voter ID Card Maker from PDF Online Free | RepetiGo",
    description: "Upload your e-EPIC PDF, review the details, and print a ready-to-use Voter ID card. Free, no sign-up required to try.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Voter ID Card Maker from PDF - RepetiGo",
    description: "Create a printable Voter ID card from your e-EPIC PDF - upload, review, and print.",
  },
  robots: { index: true, follow: true },
};

const voterContent = String.raw`H1: Voter ID Card Maker from PDF - Free Online.

The e-EPIC PDF downloaded from the Election Commission's Voter Helpline app or the National Voter Service Portal is a document page, not a card. RepetiGo's Voter ID Card Maker takes that downloaded PDF, pulls out the printed details, and lays them out on a proper card-sized Voter ID layout - ready to print at any cyber cafe or print shop.

This tool is free to build and preview. Printing or downloading the final card needs a free RepetiGo login, since generating that output file needs an account to save it against.


H2: Why Recreate a Voter ID Card from the PDF?

A lost or damaged physical EPIC card is a common reason people rely on the e-EPIC PDF instead - but that PDF is formatted as a document page, not a wallet-sized card. Polling booths and local verification counters often expect a card-shaped printout. Recreating the layout from the PDF gives a clean, correctly-sized print instead of the full PDF page.

H3: Step 1 - Upload Your e-EPIC PDF
Download your Voter ID as a PDF from the Voter Helpline app or the National Voter Service Portal, then upload it here.

H3: Step 2 - Extract and Review the Details
Tap Extract Text. The tool reads the name, father's/husband's name, age, gender, and EPIC number from the PDF and fills them into an editable form.

H3: Step 3 - Preview, Choose Layout, and Print
The recreated Voter ID card appears with a front side (name, age, gender) and a back side (guardian name, address). Choose Color or Black & White and how many cards fit per A4 sheet, then print.


H2: Common Questions About the Voter ID Card Maker.

H3: Do I need my physical EPIC card to use this?
No. Upload the e-EPIC PDF downloaded from the Voter Helpline app or the National Voter Service Portal - there is no need to scan the physical card.

H3: Can I edit the details before printing?
Yes. After extracting the text, every field is an editable text box, so you can fix anything before printing.

H3: How many Voter ID cards can I print on one sheet?
Choose 2, 4, 6, or 8 cards per A4 sheet, in color or black and white, before printing.


H2: More ID Card Types from RepetiGo.

Need a different document card? RepetiGo also recreates printable Aadhaar cards, e-Shram cards, and Ayushman cards from their downloaded PDFs.

[ Open Aadhaar Card Maker → /id-card-maker/aadhaar ]
[ Open e-Shram Card Maker → /id-card-maker/eshram ]
[ Open Ayushman Card Maker → /id-card-maker/ayushman ]
[ See All ID Card Types → /id-card-maker ]


[ Make Your Voter ID Card Now → repetigo.com/id-card-maker/voter ]`;

const faqSchemaQuestions = [
  ["Do I need my physical EPIC card to use this?", "No. Upload the e-EPIC PDF downloaded from the Voter Helpline app or the National Voter Service Portal - there is no need to scan the physical card."],
  ["Can I edit the details before printing?", "Yes. After extracting the text, every field is an editable text box."],
  ["How many Voter ID cards can I print on one sheet?", "Choose 2, 4, 6, or 8 cards per A4 sheet, in color or black and white, before printing."],
] as const;

export default function VoterCardMakerPage() {
  return (
    <IdCardUploadClient docType="voter">
      <JsonLd
        toolName="RepetiGo Voter ID Card Maker"
        description="Free tool to recreate a printable Voter ID card from a downloaded e-EPIC PDF."
        pageUrl={pageUrl}
        breadcrumbLabel="Voter ID Card Maker"
        faqSchemaQuestions={faqSchemaQuestions}
      />
      <article className="tool-seo-content" id="voter-card-maker-guide">
        <StructuredSeoCopy content={voterContent} />
      </article>
    </IdCardUploadClient>
  );
}
