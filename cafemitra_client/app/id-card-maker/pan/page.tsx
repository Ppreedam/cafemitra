import type { Metadata } from "next";
import IdCardUploadClient from "../IdCardUploadClient";
import { JsonLd, StructuredSeoCopy } from "../SeoContent";

const pageUrl = "https://repetigo.com/id-card-maker/pan";

export const metadata: Metadata = {
  title: "PAN Card Maker from PDF Online Free | RepetiGo",
  description:
    "Turn your downloaded e-PAN PDF into a clean, print-ready PAN card - upload the PDF, review the extracted details, and print. Free, built for print shops and cyber cafes.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "PAN Card Maker from PDF Online Free | RepetiGo",
    description: "Upload your e-PAN PDF, review the details, and print a ready-to-use PAN card. Free, no sign-up required to try.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "PAN Card Maker from PDF - RepetiGo",
    description: "Create a printable PAN card from your e-PAN PDF - upload, review, and print.",
  },
  robots: { index: true, follow: true },
};

const panContent = String.raw`H1: PAN Card Maker from PDF - Free Online.

The e-PAN PDF issued by the Income Tax Department / NSDL / UTIITSL is a document page, not a card. RepetiGo's PAN Card Maker takes that downloaded PDF, pulls out the printed details, and lays them out on a proper card-sized PAN layout - ready to print at any cyber cafe or print shop.

This tool is free to build and preview. Printing or downloading the final card needs a free RepetiGo login, since generating that output file needs an account to save it against.


H2: Why Recreate a PAN Card from the PDF?

A lost or damaged physical PAN card is a common reason people turn to the e-PAN PDF instead - but that PDF is formatted as a government letter, not a wallet-sized card. Banks, offices, and local KYC counters often expect a card-shaped printout. Recreating the layout from the PDF gives a clean, correctly-sized print instead of the full PDF page.

H3: Step 1 - Upload Your e-PAN PDF
Download your e-PAN as a PDF from the Income Tax e-filing portal, NSDL, or UTIITSL, then upload it here.

H3: Step 2 - Extract and Review the Details
Tap Extract Text. The tool reads the name, father's name, date of birth, and PAN number from the PDF and fills them into an editable form.

H3: Step 3 - Preview, Choose Layout, and Print
The recreated PAN card appears with all the extracted details on a single card face (PAN cards in this tool don't need a back side). Choose Color or Black & White and how many cards fit per A4 sheet, then print.


H2: Common Questions About the PAN Card Maker.

H3: Do I need my physical PAN card to use this?
No. Upload the e-PAN PDF downloaded from the Income Tax e-filing portal, NSDL, or UTIITSL - there is no need to scan the physical card.

H3: Can I edit the details before printing?
Yes. After extracting the text, every field - name, father's name, date of birth, PAN number - is an editable text box.

H3: How many PAN cards can I print on one sheet?
Choose 2, 4, 6, or 8 cards per A4 sheet, in color or black and white, before printing.


H2: More ID Card Types from RepetiGo.

Need a different document card? RepetiGo also recreates printable Aadhaar cards, EPFO/UAN cards, and Driving Licence cards from their downloaded PDFs.

[ Open Aadhaar Card Maker → /id-card-maker/aadhaar ]
[ Open EPFO / UAN Card Maker → /id-card-maker/epfo ]
[ Open Driving Licence Maker → /id-card-maker/dl ]
[ See All ID Card Types → /id-card-maker ]


[ Make Your PAN Card Now → repetigo.com/id-card-maker/pan ]`;

const faqSchemaQuestions = [
  ["Do I need my physical PAN card to use this?", "No. Upload the e-PAN PDF downloaded from the Income Tax e-filing portal, NSDL, or UTIITSL - there is no need to scan the physical card."],
  ["Can I edit the details before printing?", "Yes. After extracting the text, every field is an editable text box."],
  ["How many PAN cards can I print on one sheet?", "Choose 2, 4, 6, or 8 cards per A4 sheet, in color or black and white, before printing."],
] as const;

export default function PanCardMakerPage() {
  return (
    <IdCardUploadClient docType="pan">
      <JsonLd
        toolName="RepetiGo PAN Card Maker"
        description="Free tool to recreate a printable PAN card from a downloaded e-PAN PDF."
        pageUrl={pageUrl}
        breadcrumbLabel="PAN Card Maker"
        faqSchemaQuestions={faqSchemaQuestions}
      />
      <article className="tool-seo-content" id="pan-card-maker-guide">
        <StructuredSeoCopy content={panContent} />
      </article>
    </IdCardUploadClient>
  );
}
