import type { Metadata } from "next";
import IdCardUploadClient from "../IdCardUploadClient";
import { JsonLd, StructuredSeoCopy } from "../SeoContent";

const pageUrl = "https://repetigo.com/id-card-maker/dl";

export const metadata: Metadata = {
  title: "Driving Licence Card Maker from PDF Online Free | RepetiGo",
  description:
    "Turn your downloaded Driving Licence PDF into a clean, print-ready DL card - upload the PDF, review the extracted details, and print. Free, built for print shops and cyber cafes.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Driving Licence Card Maker from PDF Online Free | RepetiGo",
    description: "Upload your Driving Licence PDF, review the details, and print a ready-to-use DL card. Free, no sign-up required to try.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Driving Licence Card Maker from PDF - RepetiGo",
    description: "Create a printable Driving Licence card from your DL PDF - upload, review, and print.",
  },
  robots: { index: true, follow: true },
};

const dlContent = String.raw`H1: Driving Licence Card Maker from PDF - Free Online.

The Driving Licence PDF downloaded from the Parivahan / mParivahan portal or Sarathi is a document page, not a card. RepetiGo's Driving Licence Card Maker takes that downloaded PDF, pulls out the printed details, and lays them out on a proper card-sized DL layout - ready to print at any cyber cafe or print shop.

This tool is free to build and preview. Printing or downloading the final card needs a free RepetiGo login, since generating that output file needs an account to save it against.


H2: Why Recreate a Driving Licence Card from the PDF?

A lost, damaged, or delayed physical DL is a common reason people rely on the digital licence from mParivahan or DigiLocker - but that PDF is formatted as a document page, not a wallet-sized card. Recreating the layout from the PDF gives a clean, correctly-sized print instead of the full PDF page.

H3: Step 1 - Upload Your Driving Licence PDF
Download your Driving Licence as a PDF from the Parivahan portal, mParivahan app, Sarathi, or DigiLocker, then upload it here.

H3: Step 2 - Extract and Review the Details
Tap Extract Text. The tool reads the name, date of birth, DL number, validity date, and blood group from the PDF and fills them into an editable form.

H3: Step 3 - Preview, Choose Layout, and Print
The recreated DL card appears with a front side (name, date of birth, blood group) and a back side (validity date, address). Choose Color or Black & White and how many cards fit per A4 sheet, then print.


H2: Common Questions About the Driving Licence Card Maker.

H3: Do I need the physical DL smart card to use this?
No. Upload the Driving Licence PDF downloaded from the Parivahan portal, mParivahan app, Sarathi, or DigiLocker - there is no need to scan the physical card.

H3: Can I edit the details before printing?
Yes. After extracting the text, every field - name, date of birth, DL number, validity, blood group, address - is an editable text box.

H3: How many DL cards can I print on one sheet?
Choose 2, 4, 6, or 8 cards per A4 sheet, in color or black and white, before printing.


H2: More ID Card Types from RepetiGo.

Need a different document card? RepetiGo also recreates printable Aadhaar cards, PAN cards, and Agriculture cards from their downloaded PDFs.

[ Open Aadhaar Card Maker → /id-card-maker/aadhaar ]
[ Open PAN Card Maker → /id-card-maker/pan ]
[ Open Agriculture Card Maker → /id-card-maker/agriculture ]
[ See All ID Card Types → /id-card-maker ]


[ Make Your Driving Licence Card Now → repetigo.com/id-card-maker/dl ]`;

const faqSchemaQuestions = [
  ["Do I need the physical DL smart card to use this?", "No. Upload the Driving Licence PDF downloaded from the Parivahan portal, mParivahan app, Sarathi, or DigiLocker - there is no need to scan the physical card."],
  ["Can I edit the details before printing?", "Yes. After extracting the text, every field is an editable text box."],
  ["How many DL cards can I print on one sheet?", "Choose 2, 4, 6, or 8 cards per A4 sheet, in color or black and white, before printing."],
] as const;

export default function DlCardMakerPage() {
  return (
    <IdCardUploadClient docType="dl">
      <JsonLd
        toolName="RepetiGo Driving Licence Card Maker"
        description="Free tool to recreate a printable Driving Licence card from a downloaded DL PDF."
        pageUrl={pageUrl}
        breadcrumbLabel="Driving Licence Card Maker"
        faqSchemaQuestions={faqSchemaQuestions}
      />
      <article className="tool-seo-content" id="dl-card-maker-guide">
        <StructuredSeoCopy content={dlContent} />
      </article>
    </IdCardUploadClient>
  );
}
