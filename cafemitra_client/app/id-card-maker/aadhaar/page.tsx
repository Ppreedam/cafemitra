import type { Metadata } from "next";
import IdCardUploadClient from "../IdCardUploadClient";
import { JsonLd, StructuredSeoCopy } from "../SeoContent";

const pageUrl = "https://repetigo.com/id-card-maker/aadhaar";

export const metadata: Metadata = {
  title: "Aadhaar Card Maker from PDF Online Free | RepetiGo",
  description:
    "Turn your downloaded e-Aadhaar PDF into a clean, print-ready Aadhaar card - upload the PDF, review the extracted details, and print. Free, built for print shops and cyber cafes.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Aadhaar Card Maker from PDF Online Free | RepetiGo",
    description: "Upload your e-Aadhaar PDF, review the details, and print a ready-to-use Aadhaar card. Free, no sign-up required to try.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Aadhaar Card Maker from PDF - RepetiGo",
    description: "Create a printable Aadhaar card from your e-Aadhaar PDF - upload, review, and print.",
  },
  robots: { index: true, follow: true },
};

const aadhaarContent = String.raw`H1: Aadhaar Card Maker from PDF - Free Online.

Most people who download their Aadhaar from the UIDAI website (mAadhaar or the official portal) end up with a multi-page PDF, not a clean, wallet-sized card image. RepetiGo's Aadhaar Card Maker takes that downloaded PDF, pulls out the printed details, and lays them out on a proper front-and-back Aadhaar card layout - ready to print at any cyber cafe or print shop.

This tool is free to build and preview. Printing or downloading the final card needs a free RepetiGo login, since generating that output file needs an account to save it against.


H2: Why Recreate an Aadhaar Card from the PDF?

The e-Aadhaar PDF downloaded from UIDAI is formatted as a government document page, not a compact card. Many everyday situations - school admissions, local shop KYC, small offices, coaching centres - still ask for a physical, card-shaped Aadhaar copy, especially where the original plastic card has been lost or is being reprinted. Recreating the card layout from the PDF gives a clean, correctly-sized front-and-back print instead of printing the full A4 government PDF page.

H3: Step 1 - Upload Your e-Aadhaar PDF
Download your Aadhaar as a PDF from the official UIDAI website or the mAadhaar app, then upload it here. Drag and drop the file or tap to choose it from your device.

H3: Step 2 - Extract and Review the Details
Tap Extract Text. The tool reads the name, date of birth, gender, guardian name, Aadhaar number, and address from the PDF and fills them into an editable form, so you can correct anything before printing.

H3: Step 3 - Preview, Choose Layout, and Print
The recreated Aadhaar card appears with a front side (photo, name, DOB, gender) and a back side (guardian name, address, QR placeholder). Choose Color or Black & White and how many cards fit per A4 sheet, then print.


H2: Common Questions About the Aadhaar Card Maker.

H3: Do I need to upload my physical Aadhaar card?
No. Upload the PDF you download from the UIDAI website or mAadhaar app - there is no need to scan the physical card.

H3: Is my Aadhaar data stored or shared?
No file is required to be permanently stored to preview and build the card - printing the final output just needs you to be logged in so the generated file can be linked to your account.

H3: Can I edit the details before printing?
Yes. After extracting the text, every field - name, date of birth, gender, guardian name, Aadhaar number, address - is an editable text box, so you can fix anything before printing.

H3: How many Aadhaar cards can I print on one sheet?
Choose 2, 4, 6, or 8 cards per A4 sheet, in color or black and white, before printing.


H2: More ID Card Types from RepetiGo.

Need a different document card? RepetiGo also recreates printable PAN cards, Voter ID cards, and Driving Licence cards from their downloaded PDFs.

[ Open PAN Card Maker → /id-card-maker/pan ]
[ Open Voter ID Card Maker → /id-card-maker/voter ]
[ Open Driving Licence Maker → /id-card-maker/dl ]
[ See All ID Card Types → /id-card-maker ]


[ Make Your Aadhaar Card Now → repetigo.com/id-card-maker/aadhaar ]`;

const faqSchemaQuestions = [
  ["Do I need to upload my physical Aadhaar card?", "No. Upload the PDF you download from the UIDAI website or mAadhaar app - there is no need to scan the physical card."],
  ["Can I edit the details before printing?", "Yes. After extracting the text, every field is an editable text box, so you can fix anything before printing."],
  ["How many Aadhaar cards can I print on one sheet?", "Choose 2, 4, 6, or 8 cards per A4 sheet, in color or black and white, before printing."],
] as const;

export default function AadhaarCardMakerPage() {
  return (
    <IdCardUploadClient docType="aadhaar">
      <JsonLd
        toolName="RepetiGo Aadhaar Card Maker"
        description="Free tool to recreate a printable Aadhaar card from a downloaded e-Aadhaar PDF."
        pageUrl={pageUrl}
        breadcrumbLabel="Aadhaar Card Maker"
        faqSchemaQuestions={faqSchemaQuestions}
      />
      <article className="tool-seo-content" id="aadhaar-card-maker-guide">
        <StructuredSeoCopy content={aadhaarContent} />
      </article>
    </IdCardUploadClient>
  );
}
