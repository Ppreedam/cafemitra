import type { Metadata } from "next";
import type React from "react";
import Link from "next/link";
import { LandingNavbar } from "../../../LandingNavbar";
import { PublicFooter } from "../../../PublicFooter";
import { PassportPhotoCta } from "./PassportPhotoCta";

const siteUrl = "https://repetigo.com";
const pageUrl = `${siteUrl}/tools/photo/passport-photo/`;

export const metadata: Metadata = {
  title: "Passport Size Photo Maker Free - AI Attire Selection | RepetiGo",
  description:
    "Make a passport size photo at home - upload a selfie, choose your look (Casual, Normal or Official), let AI process it, then print on any paper size. Free. No studio visit.",
  alternates: {
    canonical: pageUrl,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Passport Size Photo Maker Free - AI Attire Selection | RepetiGo",
    description:
      "Make a passport size photo at home - upload selfie, choose Casual/Normal/Official look, AI processes it, print on any paper size. No studio.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Passport Size Photo Maker Free - RepetiGo",
    description: "Upload selfie -> choose look -> AI processes -> print at home. Passport photo in minutes.",
  },
};

const attireLooks = [
  {
    title: "Casual Look",
    text: "For informal ID cards, college IDs, and internal employee cards where a relaxed, approachable appearance is appropriate. The AI applies a neat casual attire to your photo - clean, presentable, but not overly formal.",
  },
  {
    title: "Normal Look",
    text: "The balanced option. Suitable for most official documents - driving licence, PAN card, Aadhaar update, school admission forms. A neat, presentable look that reads as professional without being too formal.",
  },
  {
    title: "Official Look",
    text: "For government passport applications, visa submissions, and formal government ID documents. The AI applies professional formal attire - the clean, authoritative look that official document checkers expect.",
  },
];

const steps = [
  {
    title: "Step 1 - Upload Your Photo",
    text: "Click the Upload button or drag your photo into the tool. You can upload a selfie taken on your phone, a photo taken by someone else, or any existing photo where your face is clearly visible. Supported formats: JPG, PNG, HEIC, WEBP. Minimum recommended resolution: 600x600 pixels.",
  },
  {
    title: "Step 2 - Select Your Attire Look",
    text: "Choose one of three AI-powered attire styles: Casual, Normal, or Official. This determines the look and formality of your final passport photo. If you are applying for an Indian passport, visa, or government document, select Official. For ID cards and institutional photos, Normal works for most cases.",
  },
  {
    title: "Step 3 - Click Generate Image",
    text: "Click the Generate button. RepetiGo sends your photo to the AI processing pipeline.",
  },
  {
    title: "Step 4 - AI Processes Your Photo",
    text: "The AI engine handles the technical work automatically:",
    bullets: [
      "Background removed and replaced with a clean white background",
      "Face detected, centred, and framed to official passport specifications",
      "Chosen attire style applied to the photo",
      "Brightness, contrast, and sharpness adjusted for print quality",
      "Image cropped and sized to your target country's passport photo dimensions",
    ],
  },
  {
    title: "Step 5 - Validate and Compare",
    text: "Your generated passport photo is shown alongside your original photo. Review the result carefully - check that your face is centred, the background is clean white, and the attire looks natural. If you need to adjust, go back to Step 2 and try a different attire option or re-upload a different source photo.",
    callout: {
      emoji: "✅",
      text: "Take your time on Step 5. Once you are happy with the preview, you cannot easily change the photo without starting again. Compare it against a sample passport photo if you have one - the framing, background, and overall look should match.",
    },
  },
  {
    title: "Step 6 - Select Paper Size",
    text: "Once you confirm the preview, click the paper size button. Choose from:",
    bullets: [
      "4x6 inch (10x15 cm) - the standard photo printing size, fits 4-6 passport photos per sheet",
      "A4 - standard printer paper, fits 8-12 passport photos in a tile layout",
      "Letter (8.5x11 inch) - US standard, similar tile layout to A4",
    ],
  },
  {
    title: "Step 7 - Print Your Photos",
    text: "A print dialog opens showing your photos arranged in a tile layout - multiple passport-size photos arranged to fill the selected paper size. This means one print gives you 4, 6, or more identical passport photos. Select your printer in the dialog, confirm the page size, and click Print. Your passport photos print directly from the browser - no software download required.",
    callout: {
      emoji: "🖨️",
      text: "For best results, use photo paper (glossy or matte) in your printer and set the print quality to 'High' or 'Best'. Most passport photo submissions accept standard printer output on plain paper for initial applications - check your specific institution's requirements.",
    },
  },
];

const dimensionRows = [
  ["India (Passport)", "51 x 51 mm (2x2 in)", "600 x 600 px", "White", "Face: 25-35mm height. Neutral expression. Eyes open."],
  ["India (Aadhaar / PAN / Voter ID)", "35 x 45 mm", "413 x 531 px", "White", "Standard Indian ID photo dimensions."],
  ["USA (Passport / Visa)", "51 x 51 mm (2x2 in)", "600 x 600 px", "White", "Head 1-1 3/8 in (22-35mm). Direct front-facing."],
  ["UK (Passport)", "35 x 45 mm", "413 x 531 px", "Light grey or cream", "Head 29-34mm. Neutral expression."],
  ["EU (Schengen Visa)", "35 x 45 mm", "413 x 531 px", "White or off-white", "Face must cover 70-80% of frame."],
  ["Canada (Passport)", "50 x 70 mm", "591 x 827 px", "White", "Head 31-36mm. Taken within last 6 months."],
  ["Australia (Passport)", "35 x 45 mm", "413 x 531 px", "White or light grey", "Face 32-36mm. Eyes open, looking at camera."],
];

const printBullets = [
  "Tile layout: Your passport photo is repeated in a grid across the selected paper size. A 4x6 print gives you 4 passport photos. An A4 sheet gives you up to 9 photos. Print once - get multiple copies for different applications.",
  "Direct browser print: The print dialog opens directly in your browser. No software download. No additional apps. Select your printer and click Print.",
  "Any printer supported: Use your home inkjet, a laser printer, or bring the file to any print shop. HP, Canon, Epson, Brother, and Xerox printers all work.",
  "Download option: You can also download the processed photo as a JPG or PNG and take it to a print shop or email it for professional photo printing.",
];

const whyAtHome = [
  {
    title: "No studio visit needed.",
    text: "A passport photo studio charges ₹50-₹200 per set and requires you to travel, wait, and often repeat the process if you dislike the result. Making it at home takes two minutes.",
  },
  {
    title: "Retake as many times as you want.",
    text: "At a studio, you get one or two shots. At home, you can upload a different photo or adjust the attire selection until the result is exactly right - no extra cost.",
  },
  {
    title: "AI handles the technical requirements.",
    text: "Background colour, face framing, size specifications, and print layout - the tool handles all of it automatically. You do not need to know that an Indian passport photo requires 51x51mm at 300 DPI.",
  },
  {
    title: "Immediate availability.",
    text: "Many government forms and institutional admissions require a passport photo the same day. Making one at home means you never need to delay a submission because you could not reach a studio.",
  },
  {
    title: "Multiple copies at once.",
    text: "One print on A4 paper gives you 9 identical passport photos - enough for multiple applications, form submissions, and ID cards from a single ₹5-₹10 print job.",
  },
];

const tips = [
  "Face the camera directly. Look straight at the lens, not up, down, or to the side. Your ears should be equally visible on both sides.",
  "Neutral expression. Keep your mouth closed and your expression relaxed. Avoid wide smiles - most government passport standards require a neutral or slight natural expression.",
  "Good natural light. Avoid harsh shadows on your face. Natural daylight from a window is ideal. Face the light source, not away from it.",
  "Simple background. Although the AI removes the background, the cleaner the original background, the better the AI result. A plain wall behind you works best.",
  "Remove glasses. Most current government standards (including Indian passport guidelines) require photos without glasses.",
  "Hair away from your face. Your face should be fully visible - hairline, forehead, and both cheeks.",
  "High resolution. Use the highest resolution setting on your phone camera. Modern smartphone cameras produce more than sufficient quality for a 51x51mm printed photo.",
];

const indiaRows = [
  ["Indian Passport", "51 x 51 mm", "300 DPI", "White", "Face must be 25-35 mm height. No glasses. Taken within 6 months."],
  ["Aadhaar Card", "35 x 45 mm", "200 DPI min", "White", "Clear face. No shadows. Looking directly at camera."],
  ["PAN Card", "25 x 35 mm", "200 DPI min", "White", "Photo printed on grey background in some forms."],
  ["Voter ID (EPIC)", "35 x 45 mm", "200 DPI min", "Light", "Electoral Commission standard format."],
  ["Driving Licence", "35 x 35 mm", "200 DPI min", "White", "Face visible, neutral expression."],
  ["Government Service Forms", "35 x 45 mm", "200 DPI min", "White", "Standard for most central and state government form submissions."],
];

const privacyPoints = [
  { emoji: "🔒", title: "Encrypted in transit.", text: "Your photo uploads over TLS (HTTPS) encryption. It cannot be intercepted between your device and our servers." },
  { emoji: "🤖", title: "Processed by AI, not viewed by staff.", text: "Your photo goes directly into the AI processing pipeline. No human employee reviews, accesses, or views your uploaded photo." },
  { emoji: "🗑️", title: "Deleted after processing.", text: "Your uploaded photo and the generated passport photo are permanently deleted from our servers after your session ends - typically within 60 minutes of upload." },
  { emoji: "🚫", title: "Never stored, trained on, or shared.", text: "Your photo is not used to train AI models, shared with third parties, or retained in any database. The DPDP Act 2023 personal data protections apply to all photos uploaded." },
  { emoji: "📵", title: "No account required.", text: "Because no account is created, we hold no identity information linking you to the photo you uploaded." },
];

const printShopBullets = [
  "No dedicated passport photo camera required - any decent webcam or phone camera works",
  "Customer approves the photo before printing - no reprints due to customer dissatisfaction",
  "Multiple passport photos printed per sheet - ₹5-₹10 print cost for 9 photos per A4 sheet",
  "Supports all Indian document sizes - passport, Aadhaar, PAN, voter ID, driving licence",
];

const faqs: [string, string][] = [
  [
    "Can I take my own passport photo with my phone?",
    "Yes. RepetiGo's AI processes any photo taken on a modern smartphone into a government-compliant passport size photo. Take a photo in good natural light, looking directly at the camera with a neutral expression. Upload it to the tool, choose your attire look, and the AI handles the background removal, framing, and sizing automatically.",
  ],
  [
    "What is the difference between Casual, Normal, and Official look?",
    "These are three AI-powered attire styles. Casual is for informal ID cards and institutional photos where a relaxed appearance is appropriate. Normal is the standard choice for most official documents - PAN, Aadhaar, voter ID. Official is for government passport and visa applications where a formal, professional look is required. The AI applies the chosen attire style to your photo while keeping your face and expression unchanged.",
  ],
  [
    "What size is a passport photo in India?",
    "The standard Indian size passport photo for a passport application is 51x51 mm (2x2 inches) at 300 DPI with a white background. For Aadhaar, PAN, and voter ID, the standard is 35x45 mm. RepetiGo applies the correct dimensions automatically when you select your document type.",
  ],
  [
    "How do I validate my passport photo for an Indian application?",
    "In Step 5 of the RepetiGo process, you can validate Indian passport photo online by comparing the AI-generated result against your original photo and checking it against the official guidelines. The tool ensures the face is centred, the background is white, and the photo meets the required proportions. For formal validation before an official submission, you can also upload the generated photo to the Passport Seva portal's photo validation tool.",
  ],
  [
    "How do I print multiple passport photos on one sheet?",
    "After confirming your passport photo in Step 5, select your paper size in Step 6 - A4, 4x6, or Letter. The print dialog (Step 7) automatically arranges your passport photo in a tile layout across the page - 4 to 9 photos per sheet depending on the paper size chosen. Print once and get multiple copies. Use photo paper for best quality.",
  ],
  [
    "Is it safe to upload my face photo to an online tool?",
    "With RepetiGo, yes. Your photo uploads over TLS encryption, processes in an isolated AI session, and is permanently deleted within 60 minutes. No human views your photo. It is not used for AI training, not stored in any database, and not shared with any third party. Under India's DPDP Act 2023, your photo is classified as personal data and receives the full protections that law requires.",
  ],
  [
    "Can I use this for a US visa or UK passport photo?",
    "Yes. The dimensions table in the tool includes US passport (2x2 inch), UK passport (35x45mm), EU Schengen visa, Canada, and Australia photo specifications. Select your country when setting up the photo and the dimensions are applied automatically. The AI attire selection and background processing work the same way for all countries.",
  ],
  [
    "Is RepetiGo's passport photo accepted at government offices?",
    "RepetiGo generates photos that meet all official technical specifications - correct dimensions, white background, proper face framing, and print-ready resolution. Whether a specific government office accepts a digitally processed photo depends on the office's requirements. For Passport Seva, the digital photo format is accepted for the online application. For in-person submission at the Passport Seva Kendra, the printed photo is submitted - print on quality photo paper for best results.",
  ],
];

const relatedTools = [
  { label: "Visa Photo Maker", text: "Country-specific visa photo dimensions - use the same AI passport photo maker.", href: "/passport-photo" },
  { label: "Enhance Document Photo", text: "AI crop, deskew, and brightness fix for phone-captured documents.", href: "/image-tools" },
  { label: "Remove Background", text: "Remove background from any photo for use in documents or design.", href: "/image-tools/background-remover" },
  { label: "All PDF Tools", text: "30+ free PDF tools for converting, editing, signing, and securing documents.", href: "/pdf-tools" },
];

const schemaGraph = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "RepetiGo Passport Size Photo Maker",
    description:
      "AI-powered passport size photo maker. Upload a selfie, choose Casual, Normal or Official look, AI processes and frames the photo, print on any paper size. Free, no sign-up, files deleted after processing.",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    url: pageUrl,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    featureList: [
      "AI attire selection - Casual, Normal, Official",
      "Automatic white background removal",
      "Face detection and centring",
      "India passport dimensions (51x51mm)",
      "US passport dimensions (2x2 inch)",
      "Tile print layout for multiple photos per sheet",
      "Files auto-deleted after processing",
      "No account required",
    ],
    publisher: {
      "@type": "Organization",
      name: "RepetiGo",
      url: siteUrl,
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Make a Passport Size Photo at Home in 7 Steps",
    description:
      "Make a government-compliant passport size photo using AI. Upload a selfie, choose your attire look, let AI process it, validate the result, and print multiple photos on one sheet.",
    totalTime: "PT2M",
    tool: {
      "@type": "HowToTool",
      name: "RepetiGo Passport Size Photo Maker",
      url: pageUrl,
    },
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.title.replace(/^Step \d+ - /, ""),
      text: step.text,
      url: `${pageUrl}#step-${index + 1}`,
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Tools", item: `${siteUrl}/tools/` },
      { "@type": "ListItem", position: 3, name: "Photo Tools", item: `${siteUrl}/tools/photo/` },
      { "@type": "ListItem", position: 4, name: "Passport Size Photo Maker", item: pageUrl },
    ],
  },
];

function SeoTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="tool-seo-table-wrap">
      <table>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join("|")}>
              {row.map((cell, index) => (
                <td key={`${cell}-${index}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Callout({ emoji, children }: { emoji: string; children: React.ReactNode }) {
  return (
    <aside className="tool-seo-callout">
      <p>
        {emoji} {children}
      </p>
    </aside>
  );
}

export default function PassportPhotoMakerPage() {
  return (
    <div className="ai-landing-shell passport-photo-seo-shell">
      <LandingNavbar />
      <main className="tool-seo-page-wrap">
        <article className="tool-seo-content" id="passport-photo-guide">
          <section className="tool-seo-hero">
            <p className="tool-seo-kicker">AI-Powered - Attire Selection - Direct Print</p>
            <h1>Make Your Passport Size Photo at Home. Upload a Selfie, Choose Your Look, Print in Minutes.</h1>
            <p>
              No photo studio visit. No appointment. No awkward poses under a bright light. RepetiGo&apos;s passport
              size photo maker lets you create a government-compliant passport photo using your phone camera or any
              existing photo - right from your browser.
            </p>
            <p>
              What makes it different: you choose your look. Casual, Normal, or Official - our AI adjusts your
              attire, fixes the background to a clean white, corrects the framing, and produces a print-ready
              passport size photo that meets official requirements.
            </p>
            <div className="tool-seo-badges">
              <span>&#10003; Upload any selfie or photo</span>
              <span>&#10003; Choose Casual, Normal or Official look</span>
              <span>&#10003; AI processes and frames</span>
              <span>&#10003; Print at home or at a print shop</span>
              <span>&#10003; Government-compliant dimensions</span>
              <span>&#10003; Files deleted after processing</span>
            </div>
            <div className="tool-seo-cta-stack">
              <PassportPhotoCta className="tool-seo-inline-cta" label="Make Your Passport Photo Now - Free" />
            </div>
          </section>

          <section>
            <h2>What Is a Passport Size Photo Maker?</h2>
            <p>
              A passport size photo maker is an online tool that converts any ordinary photograph into a
              government-compliant passport or ID photo - with the correct dimensions, background colour, and
              framing requirements applied automatically.
            </p>
            <p>
              Traditional passport photos require a trip to a photo studio, specific lighting, a neutral expression,
              and a white background - all for a small 51x51mm photograph. A good online passport photo maker
              eliminates the studio visit by handling the technical requirements automatically: background removal,
              face framing, size formatting, and quality optimisation.
            </p>
            <p>
              RepetiGo&apos;s version goes one step further: it adds AI-powered attire selection, so the look of your
              photo - Casual, Normal, or Official - can be adjusted to suit the context, whether it is an internal ID
              card, a visa application, or a formal government document.
            </p>
            <Callout emoji="📋">
              Passport size photos are required for: Indian passport applications, Aadhaar enrolment updates, PAN
              card applications, driving licence, voter ID, employee ID cards, school and college admissions, visa
              applications, and hundreds of government and private forms across India.
            </Callout>
          </section>

          <section>
            <h2>Choose Your Look - Casual, Normal, or Official Attire. Our AI Does the Rest.</h2>
            <p>
              The most common reason people hesitate to take their own passport photo at home is simple: &quot;I&apos;m
              not dressed for it.&quot; A selfie taken on a Tuesday afternoon in a t-shirt doesn&apos;t look like a
              passport photo. RepetiGo solves this with AI attire selection.
            </p>
            <p>When you upload your photo, you choose one of three looks before generating:</p>
            <div className="tool-seo-step-grid">
              {attireLooks.map((look) => (
                <div key={look.title}>
                  <h3>{look.title}</h3>
                  <p>{look.text}</p>
                </div>
              ))}
            </div>
            <Callout emoji="💡">
              Not sure which to choose? Use Normal for most purposes. Use Official for passport and visa applications
              where strict government checkers review the photo. Use Casual for student IDs, gym memberships, and
              informal workplace cards.
            </Callout>
          </section>

          <section>
            <h2>How to Make a Passport Size Photo in 7 Steps.</h2>
            <p>The entire process takes under two minutes. Here is exactly how it works:</p>
            <div className="tool-seo-step-grid">
              {steps.map((step, index) => (
                <div id={`step-${index + 1}`} key={step.title}>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                  {step.bullets ? (
                    <ul className="tool-seo-list">
                      {step.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                  {step.callout ? <Callout emoji={step.callout.emoji}>{step.callout.text}</Callout> : null}
                </div>
              ))}
            </div>
            <div className="tool-seo-cta-stack">
              <PassportPhotoCta className="tool-seo-inline-cta" label="Make Your Passport Photo Now - Free" />
            </div>
          </section>

          <section>
            <h2>Passport Photo Dimensions - India, US, UK, EU, and More.</h2>
            <p>
              Different countries require different passport photo dimensions. RepetiGo automatically formats your
              photo to the selected country&apos;s specifications. Here are the most common standards:
            </p>
            <SeoTable
              headers={["Country / Document", "Width x Height", "In Pixels (300 DPI)", "Background", "Key Notes"]}
              rows={dimensionRows}
            />
            <Callout emoji="📊">
              The most common Indian passport size photo is 51x51 mm (2x2 inches). For Aadhaar card enrollment
              updates, voter ID, and PAN card - the standard is 35x45 mm. RepetiGo auto-sizes your photo to whichever
              format you select.
            </Callout>
          </section>

          <section>
            <h2>How to Print Passport Photos from RepetiGo.</h2>
            <p>
              The printing workflow in RepetiGo is designed to minimise waste and maximise the number of photos you
              get from one print job. Here is how it works:
            </p>
            <ul className="tool-seo-list">
              {printBullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            <p>
              If you are printing at a print shop or CSC centre, share the downloaded JPG - the print shop can print
              it on photo paper using any standard photo printing software. The dimensions are already set correctly.
            </p>
            <Callout emoji="💡">
              For government applications that require a physical printed photo, print on glossy photo paper for the
              best result. For digital submissions (many Indian government portals now accept digital passport
              photos), use the downloaded JPG directly - no printing required.
            </Callout>
          </section>

          <section>
            <h2>Why Make Your Passport Photo at Home?</h2>
            <ul className="tool-seo-list">
              {whyAtHome.map((item) => (
                <li key={item.title}>
                  <strong>{item.title}</strong> {item.text}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2>Tips for a Good Passport Photo - Get It Right the First Time.</h2>
            <p>
              The quality of your source photo affects the quality of the final passport photo. Follow these tips
              when taking or choosing the photo you upload:
            </p>
            <ul className="tool-seo-list">
              {tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
            <Callout emoji="💡">
              If the AI preview does not look quite right on the first try, the most common fix is to upload a photo
              taken in better lighting with a cleaner background. The AI works best when your face is clearly defined
              and well-lit in the source photo.
            </Callout>
          </section>

          <section>
            <h2>Passport Size Photo for India - Requirements and Specifications.</h2>
            <p>
              Indian government documents each have specific passport photo dimensions and quality requirements. Here
              is what you need to know for the most common Indian documents:
            </p>
            <SeoTable
              headers={["Indian Document", "Photo Size", "DPI", "Background", "Special Requirements"]}
              rows={indiaRows}
            />
            <p>
              RepetiGo&apos;s AI processes your photo to the correct size for each document type automatically.
              Select your document type in the tool and the dimensions are applied - no manual calculations needed.
            </p>
            <p>
              For Indian passport applications specifically: the Passport Seva portal accepts digital photos for
              initial online applications. Upload the digital passport photo generated by RepetiGo directly to the
              portal. For the physical application submission at the Passport Seva Kendra, print the photo on quality
              glossy paper.
            </p>
            <Callout emoji="⚠️">
              Under India&apos;s DPDP Act 2023, photos uploaded to online services for processing are considered
              personal data. RepetiGo processes your photo for the duration of your session and deletes it after
              processing - no facial data or photo is stored beyond your active session.
            </Callout>
          </section>

          <section>
            <h2>Your Photos Are Safe. Always.</h2>
            <p>
              Your passport photo contains your face - one of the most sensitive forms of personal data. Here is
              exactly what happens to your photo when you upload it to RepetiGo:
            </p>
            <ul className="tool-seo-list">
              {privacyPoints.map((point) => (
                <li key={point.title}>
                  {point.emoji} <strong>{point.title}</strong> {point.text}
                </li>
              ))}
            </ul>
            <Callout emoji="🔒">
              Your face is your identity. RepetiGo&apos;s 60-minute auto-deletion policy means your photo is never at
              risk of exposure after your session ends. Read our full security policy at repetigo.com/privacy-policy.
            </Callout>
            <div className="tool-seo-cta-stack">
              <Link className="tool-seo-inline-cta" href="/privacy-policy">
                Privacy Policy <span>&#8594;</span>
              </Link>
              <Link className="tool-seo-inline-cta" href="/privacy-policy">
                Auto-Delete <span>&#8594;</span>
              </Link>
            </div>
          </section>

          <section>
            <h2>For Print Shops - Passport Photos as a Service.</h2>
            <p>
              Print shops, cyber cafe operators, and CSC centres can offer professional passport photo service to
              customers using RepetiGo - without buying a dedicated passport photo kiosk or camera setup.
            </p>
            <p>
              The workflow: the customer sits at a counter camera or uploads a selfie from their phone via QR code.
              The operator uses RepetiGo&apos;s passport photo maker to process the photo with the correct attire and
              dimensions, preview it with the customer, and print directly - all without any specialist photography
              equipment.
            </p>
            <ul className="tool-seo-list">
              {printShopBullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            <Callout emoji="🖨️">
              PrintPilot - RepetiGo&apos;s print shop management platform - integrates passport photo creation
              directly into the shop workflow. Customers upload via QR code, photos are processed and printed
              automatically, and the print job is complete in minutes.
            </Callout>
            <div className="tool-seo-cta-stack">
              <Link className="tool-seo-inline-cta" href="/print-automation">
                Try PrintPilot Free - Passport Photos + Full Print Shop Automation <span>&#8594;</span>
              </Link>
            </div>
          </section>

          <section>
            <h2>Common Questions About Passport Size Photo Makers.</h2>
            <div className="tool-seo-faq-list">
              {faqs.map(([question, answer], index) => (
                <details key={question}>
                  <summary>
                    Q{index + 1}: {question}
                  </summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section>
            <h2>More Free Photo Tools from RepetiGo.</h2>
            <div className="tool-seo-related-grid">
              {relatedTools.map((tool) => (
                <Link href={tool.href} key={tool.label}>
                  <strong>{tool.label}</strong>
                  <span>{tool.text}</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="tool-seo-cta">
            <h2>Make Your Passport Size Photo Now - Free</h2>
            <p>Upload a selfie, choose your look, let AI do the rest. No studio, no sign-up required to try.</p>
            <PassportPhotoCta label="Make Your Passport Photo Now" />
          </section>
        </article>
      </main>
      <PublicFooter />
      {schemaGraph.map((schema) => (
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          key={schema["@type"]}
          type="application/ld+json"
        />
      ))}
    </div>
  );
}
