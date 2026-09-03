import type { Metadata } from "next";
import PanCardMakerClient from "./PanCardMakerClient";
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

The e-PAN PDF issued by the Income Tax Department / NSDL / UTIITSL is a document page, not a card. RepetiGo's PAN Card Maker takes that downloaded PDF - even password-protected ones - and recreates the exact front and back of the card at true CR-80 card size (3.38 x 2.13 in), ready to print at any cyber cafe or print shop.

This tool is free to build and preview. Printing or downloading the final card needs a free RepetiGo login, since generating that output file needs an account to save it against.


H2: Why Recreate a PAN Card from the PDF?

A lost or damaged physical PAN card is a common reason people turn to the e-PAN PDF instead - but that PDF is formatted as a government letter, not a wallet-sized card. Banks, offices, and local KYC counters often expect a card-shaped printout. Recreating the layout from the PDF gives a clean, correctly-sized print instead of the full PDF page.

H3: Step 1 - Upload Your e-PAN PDF
Download your e-PAN as a PDF from the Income Tax e-filing portal, NSDL, or UTIITSL, then upload it here. If it's password-protected, a popup asks for the password and unlocks it in your browser - nothing is uploaded to a server.

H3: Step 2 - Auto-Crop the Front &amp; Back
The tool detects the front and back of the card on the PDF page(s) and crops them automatically. Fine-tune the crop area by hand if it doesn't line up perfectly with your PDF's layout.

H3: Step 3 - Choose Background, Size, and Print
Optionally strip the colored background for a clean black &amp; white print, then download a ready-to-feed 2-page PDF sized exactly for a thermal card printer, or print several cards on an A4 sheet or 4x6 photo paper.


H2: Common Questions About the PAN Card Maker.

H3: Do I need my physical PAN card to use this?
No. Upload the e-PAN PDF downloaded from the Income Tax e-filing portal, NSDL, or UTIITSL - there is no need to scan the physical card.

H3: My PDF is password-protected - can I still use this?
Yes. A popup will ask for the PDF's password and unlock it locally in your browser before the card is generated.

H3: What size is the printed card?
The card face is sized to the standard CR-80 card format (3.38 x 2.13 in), the same size as a bank card, so it fits standard card holders and thermal card printers.

H3: How can I print it?
Download a 2-page, card-sized PDF for a thermal card printer, or print several copies on a regular A4 sheet or on 4x6 photo paper.


H2: More ID Card Types from RepetiGo.

Need a different document card? RepetiGo also recreates printable Aadhaar cards, EPFO/UAN cards, and Driving Licence cards from their downloaded PDFs.

[ Open Aadhaar Card Maker → /id-card-maker/aadhaar ]
[ Open EPFO / UAN Card Maker → /id-card-maker/epfo ]
[ Open Driving Licence Maker → /id-card-maker/dl ]
[ See All ID Card Types → /id-card-maker ]


[ Make Your PAN Card Now → repetigo.com/id-card-maker/pan ]`;

const faqSchemaQuestions = [
  ["Do I need my physical PAN card to use this?", "No. Upload the e-PAN PDF downloaded from the Income Tax e-filing portal, NSDL, or UTIITSL - there is no need to scan the physical card."],
  ["My PDF is password-protected - can I still use this?", "Yes. A popup asks for the PDF's password and unlocks it locally in your browser before the card is generated."],
  ["What size is the printed card?", "The card face is sized to the standard CR-80 card format (3.38 x 2.13 in), the same size as a bank card."],
  ["How can I print it?", "Download a 2-page, card-sized PDF for a thermal card printer, or print several copies on an A4 sheet or 4x6 photo paper."],
] as const;

export default function PanCardMakerPage() {
  return (
    <PanCardMakerClient>
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
    </PanCardMakerClient>
  );
}
