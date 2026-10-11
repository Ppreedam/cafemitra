const pageUrl = "https://repetigo.com/photo-copy";

const faqs: [string, string][] = [
  [
    "How do I photo copy a document from my computer online?",
    "Open RepetiGo Photo Copy, upload the PDF or photo from your computer, pick the pages and number of copies, and press Print. The job goes straight to the printer connected to your PC through the PrintPilot agent - no separate software and no need to copy the file to a phone first.",
  ],
  [
    "Which files can I print or photo copy?",
    "PDF, JPG, JPEG and PNG files. You can select several files at once - they are combined into one job. Page count is detected automatically, so you only choose the pages you actually want.",
  ],
  [
    "Can I photo copy a document that I only have as a phone photo or scan?",
    "Yes. Upload the photo, let the tool straighten and clean it, crop it if needed, and print it like any other page. This is useful for Aadhaar, PAN, marksheets and any paper you photographed instead of scanning.",
  ],
  [
    "Does it work with any printer?",
    "It prints on the printers installed on your Windows PC through the PrintPilot agent, using the print profile you choose (paper size, colour or black and white). You can also fall back to the normal browser print dialog.",
  ],
  [
    "Is there a charge for printing from this page?",
    "Printing from your own shop dashboard creates no customer order and no payment. It is meant for the shop owner's own counter work; customers who upload through your shop QR code are billed through PrintPilot.",
  ],
];

function JsonLd() {
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "RepetiGo Photo Copy",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web",
      description: "Print or photo copy documents from your local computer - PDF and photo upload, page selection, straighten and crop, direct print on your PC's printer.",
      url: pageUrl,
      featureList: "PDF and image upload, auto page detection, straighten and crop, page selection, copies, print profile, direct print through PrintPilot agent",
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map(([question, answer]) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://repetigo.com/" },
        { "@type": "ListItem", position: 2, name: "Photo Copy", item: pageUrl },
      ],
    },
  ];
  return (
    <>
      {schemas.map((schema) => (
        <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
    </>
  );
}

export default function PhotoCopySeoContent() {
  return (
    <>
      <JsonLd />
      <article className="tool-seo-content" id="photo-copy-guide">
        <h2>Photo Copy and Print Documents From Your Computer - Free With RepetiGo.</h2>
        <div className="tool-seo-copy-paragraph tool-seo-hero">
          <p>
            RepetiGo Photo Copy lets a print shop or cyber cafe print or photo copy documents that are already on the local computer - PDFs, scans and phone photos - straight on the printer next to it. Upload, tidy up the pages, choose copies and print, all from one screen alongside the other RepetiGo tools.
          </p>
          <div className="tool-seo-badges">
            <span>✓ PDF, JPG, PNG Upload</span>
            <span>✓ Auto Page Detection</span>
            <span>✓ Straighten &amp; Crop</span>
            <span>✓ Page Selection &amp; Copies</span>
            <span>✓ Direct Print on Your PC&apos;s Printer</span>
          </div>
        </div>

        <h2>Why Use It Instead of Opening Every File in a Different Program?</h2>
        <p>Most counter jobs are the same few steps: open the file, fix the page, set copies, print. Doing that in separate programs wastes minutes on every customer. Photo Copy keeps it in one place:</p>
        <ul className="tool-seo-list">
          <li>Upload PDFs and images from the computer - or several files at once, combined into one job.</li>
          <li>Pages are detected automatically, so you print only the ones you need.</li>
          <li>Crooked phone photos of documents can be straightened and cropped before printing.</li>
          <li>Pick your print profile once - paper size, colour or black and white - and reuse it.</li>
        </ul>

        <h2>How to Photo Copy a Document in 3 Steps.</h2>
        <h3>Step 1 - Upload the document</h3>
        <p>Choose a PDF, JPG, PNG or JPEG from your computer. Select more than one file if the customer has several pages in different files.</p>
        <h3>Step 2 - Set print options</h3>
        <p>Choose the pages you want and the number of copies. Straighten or crop photo pages so the printout looks like a proper scan.</p>
        <h3>Step 3 - Print</h3>
        <p>Press Print and the job is sent to your printer through the PrintPilot agent. Prefer the normal print dialog? Pick browser print instead.</p>

        <h2>Common Questions About Photo Copy and Printing From a Computer.</h2>
        {faqs.map(([question, answer]) => (
          <div key={question}>
            <h3>{question}</h3>
            <p>{answer}</p>
          </div>
        ))}

        <h2>More RepetiGo Tools for Your Counter.</h2>
        <ul className="tool-seo-list">
          <li>
            <a href="/photo-print-sheet">Photo Print Sheet Maker</a> - many photos, one sheet.
          </li>
          <li>
            <a href="/id-card-print">ID Card Print</a> - print Aadhaar, PAN and voter ID at true card size.
          </li>
          <li>
            <a href="/passport-photo">Passport Photo</a> - government-size photos with AI background help.
          </li>
          <li>
            <a href="/pdf-tools">PDF Tools</a> - merge, split, compress and more.
          </li>
        </ul>
      </article>
    </>
  );
}
