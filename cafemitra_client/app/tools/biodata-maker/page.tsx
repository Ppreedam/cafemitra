import type { Metadata } from "next";
import type React from "react";
import Link from "next/link";
import { LandingNavbar } from "../../LandingNavbar";
import { PublicFooter } from "../../PublicFooter";

const siteUrl = "https://repetigo.com";
const pageUrl = `${siteUrl}/tools/biodata-maker/`;
const builderUrl = "/biodata-maker";

export const metadata: Metadata = {
  title: "Marriage Biodata Maker - Free Templates & PDF | RepetiGo",
  description:
    "Free marriage biodata maker - pick a template, add your photo and details, and download a print-ready PDF. Matrimonial and simple formats, online or at a cyber cafe near you.",
  alternates: { canonical: pageUrl },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Marriage Biodata Maker - Free Templates & PDF",
    description: "Pick a template, add your photo and details, and download a print-ready marriage biodata PDF. Free.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Marriage Biodata Maker - Free Templates & PDF",
    description: "Free marriage biodata maker: templates, photo, print-ready PDF. Online or at a nearby shop.",
  },
};

const steps = [
  { title: "1. Pick a template", does: "Choose Classic, Modern, or Simple - each shown with sample content.", result: "You start from a tidy, ready-made format." },
  { title: "2. Fill in your details", does: "Add your information and upload a photo; the right fields appear for the template.", result: "Your biodata takes shape as you type." },
  { title: "3. Download", does: "Preview, then download the print-ready PDF.", result: "You get a clean biodata to print or share." },
];

const templateRows = [
  ["Classic", "Traditional matrimonial layout", "The familiar, formal shaadi biodata"],
  ["Modern", "Matrimonial with a coloured header band", "A cleaner, contemporary look"],
  ["Simple", "General-purpose, non-matrimonial", "A plain biodata without marriage fields"],
];

const sectionRows = [
  ["Personal details", "Photo, full name, date of birth, gender, religion, caste"],
  ["Matrimonial details", "Marital status, height, complexion, gotra, rashi / nakshatra"],
  ["Education & occupation", "Your studies and work, with annual income where relevant"],
  ["Family details", "Father’s and mother’s names and occupations, and siblings"],
  ["Contact details", "Phone, email, native place, current and permanent address"],
  ["Hobbies & interests", "A short, personal note on what you enjoy"],
];

const notDoRows = [
  ["A full kundli / horoscope or matching", "No - you can enter rashi/nakshatra as text, but there’s no kundli block or matching"],
  ["A government / job form biodata (tabular)", "No - only matrimonial and a plain “Simple” biodata"],
  ["A ready-made Marathi/Hindi template", "No - labels are English; you can type your own language into the fields"],
  ["A partner-preference section", "No - that section isn’t part of the tool"],
  ["Community-specific decorative designs", "No - there are three generic templates"],
  ["A Word (DOCX) or single-image download", "No - the output is a print-ready PDF"],
  ["AI to write your hobbies or intro", "No - you write your own text"],
];

const faqs: [string, string][] = [
  [
    "Is this biodata maker free?",
    "Building and previewing your biodata is free - pick a template, fill in every detail, add your photo, and see the finished result without paying anything. The clean, watermark-free download is free wherever the shop offers it that way; RepetiGo shops set their own pricing, and the tool stays free by default until one chooses to charge a small fee. No subscription, and no account needed to start.",
  ],
  [
    "How do I make a marriage biodata?",
    "Choose the Classic or Modern template, then fill in your details - personal information, the matrimonial details like height and gotra, education and occupation, family details, contact information, and hobbies - and upload a photo. It takes shape as you type, and when it looks right you download a print-ready PDF to print or share.",
  ],
  [
    "What should a marriage biodata include?",
    "The essentials are your personal details (name, date of birth, religion, caste), matrimonial specifics families look for (height, marital status, gotra, rashi or nakshatra), your education and occupation, family details such as your parents’ names and occupations and siblings, contact information, and a short note on hobbies. The matrimonial templates already lay all of this out, so you just fill in the blanks.",
  ],
  [
    "Can I make a biodata in Marathi or Hindi?",
    "You can type your details in Marathi, Hindi, or any language your keyboard supports, and they’ll appear that way on the biodata and in the PDF. What isn’t available yet is a ready-made Marathi or Devanagari template with translated labels and fonts - the three templates and their labels are in English. So you can produce a biodata in your language by typing the content yourself; a fully regional-language template isn’t offered here yet.",
  ],
  [
    "Is there a simple biodata without marriage details?",
    "Yes - the Simple template is a plain, general-purpose biodata. Select it and the matrimonial fields drop away, leaving your basic personal, education, and contact details. It’s handy when you need a straightforward biodata rather than a marriage one. Do note it’s a plain format, not the tabular year-wise layout that some government or job forms specifically require.",
  ],
  [
    "Can I make a biodata at a shop near me?",
    "You can. The same biodata maker runs at RepetiGo-powered cyber cafes, print shops, and CSC centres, so you can walk in, get help building it, and print it on the spot. If a biodata maker near you is what you’re after, a nearby shop is set up for exactly that - the same templates plus a printout, in one visit.",
  ],
  [
    "Does it include a kundli or horoscope matching?",
    "No - the tool is for the biodata itself. You can enter your rashi or nakshatra as text where it belongs, but there’s no full kundli block (birth time and place, manglik status) and no horoscope matching. It focuses on producing a clean, complete biodata; kundli and matching are handled separately, outside this tool.",
  ],
  [
    "What format do I get, and can I get Word?",
    "You download a print-ready PDF, which prints cleanly on a single page and is easy to share. There’s no Word (DOCX) or single-image export - the tool makes a PDF. If you need to adjust the file afterwards, RepetiGo’s PDF tools can compress or convert it for you.",
  ],
  [
    "Can I add a photo to my biodata?",
    "Yes - upload one and crop it right in the tool, and it’s auto-formatted to a neat square so it sits cleanly at the top of the template. A clear, well-framed photo makes a real difference on a biodata. If you don’t have a suitable one, RepetiGo’s passport photo tool can help you make it.",
  ],
  [
    "Can I save my biodata and edit it later?",
    "Your draft is kept in the browser as you work, so a refresh won’t lose it. At a RepetiGo shop you can also save a biodata to the shop’s account, keep several, and reopen or delete them later - useful when you’re making biodatas for more than one family member, or updating details before printing another copy.",
  ],
];

const relatedTools = [
  { label: "Biodata Maker", text: "Build and print your biodata - the tool itself.", href: builderUrl },
  { label: "Resume Maker", text: "Make a job resume (not a marriage biodata).", href: "/tools/resume-maker/" },
  { label: "Passport Photo", text: "Make a photo for your biodata.", href: "/tools/photo/passport-photo/" },
  { label: "PDF Tools", text: "Compress or convert your biodata PDF.", href: "/pdf-tools" },
  { label: "For Cyber Cafes & Print Shops", text: "Offer the biodata maker to your customers.", href: "/print-automation" },
];

const schemaGraph = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "RepetiGo Biodata Maker",
    description:
      "Free marriage biodata maker with matrimonial and simple templates. Add a photo, fill in every detail, and download a print-ready PDF - online or at a nearby cyber cafe.",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: pageUrl,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    featureList: [
      "3 biodata templates - Classic and Modern (matrimonial), Simple (general-purpose)",
      "Fields adapt to the template - matrimonial fields hide automatically on the Simple template",
      "Personal, matrimonial, education & occupation, family, contact and hobbies sections",
      "Template gallery with sample content - switch templates anytime without losing your content",
      "Photo upload with in-browser cropping",
      "Type details in any language, including Marathi and Hindi",
      "Draft auto-saved in your browser",
      "Print-ready PDF download",
      "Save and reopen biodatas from your account",
      "Available online and at RepetiGo-powered cyber cafes and print shops",
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
    name: "How to Make a Marriage Biodata in 3 Steps",
    description: "Pick a biodata template, fill in your details and photo, then download a print-ready PDF.",
    tool: {
      "@type": "HowToTool",
      name: "RepetiGo Biodata Maker",
      url: pageUrl,
    },
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.title.replace(/^\d+\.\s*/, ""),
      text: `${step.does} ${step.result}`,
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
      { "@type": "ListItem", position: 3, name: "Biodata Maker", item: pageUrl },
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

export default function BiodataMakerSeoPage() {
  return (
    <div className="ai-landing-shell biodata-maker-seo-shell">
      <LandingNavbar />
      <main className="tool-seo-page-wrap">
        <article className="tool-seo-content" id="biodata-maker-guide">
          <section className="tool-seo-hero">
            <p className="tool-seo-kicker">Matrimonial &amp; Simple Templates - Print-Ready PDF</p>
            <h1>Make a Marriage Biodata in Minutes, Free.</h1>
            <p>
              A marriage biodata is often the first thing a prospective family sees, so it&apos;s worth getting right
              - neat, complete, and easy to read. The good news is you don&apos;t need a designer or a day off to
              make one. Pick a template, fill in your details, add a photo, and download a print-ready PDF.
              That&apos;s it.
            </p>
            <p>
              This biodata maker keeps the whole thing simple. It gives you clean, ready-made formats built for
              exactly this - the personal, family, and matrimonial details that belong on a shaadi biodata - and
              arranges them properly so nothing looks cramped or out of place. You can do it yourself on your phone,
              or, if you&apos;d rather have help and a printout in hand, at a cyber cafe near you that runs the same
              tool.
            </p>
            <div className="tool-seo-badges">
              <span>&#10003; Ready-made biodata templates (marriage &amp; simple)</span>
              <span>&#10003; Photo + all the right fields</span>
              <span>&#10003; Print-ready PDF</span>
              <span>&#10003; Online, or at a cyber cafe near you</span>
            </div>
            <div className="tool-seo-cta-stack">
              <Link className="tool-seo-inline-cta" href={builderUrl}>
                Make Your Biodata Now - Free <span>&#8594;</span>
              </Link>
            </div>
          </section>

          <section>
            <h2>What Goes Into a Good Marriage Biodata.</h2>
            <p>
              A biodata is really a snapshot: who you are, your background, and how to reach your family. A good one
              covers the expected ground without turning into an essay. Personal details come first - name, date of
              birth, religion, caste - followed by the matrimonial specifics families look for, like height, marital
              status, gotra, and rashi or nakshatra.
            </p>
            <p>
              After that comes education and occupation (with income, where it&apos;s relevant), then family details
              - parents&apos; names and occupations, and siblings - because in most matches the family matters as
              much as the individual. Contact details and a line or two on hobbies round it off. The point isn&apos;t
              to list everything under the sun; it&apos;s to present the right things clearly. This tool already
              knows which fields belong where, so you fill in the blanks and it handles the layout.
            </p>
          </section>

          <section>
            <h2>How to Make a Biodata in 3 Steps.</h2>
            <p>Start to finish, it&apos;s three steps.</p>
            <SeoTable headers={["Step", "What you do", "What happens"]} rows={steps.map((s) => [s.title, s.does, s.result])} />
            <p>
              Switch templates whenever you like and your details come along - no retyping. Your draft is also saved
              in the browser as you go, so you won&apos;t lose your work if you step away.
            </p>
          </section>

          <section>
            <h2>Three Biodata Templates.</h2>
            <p>There are three templates, and they cover the situations most people are here for.</p>
            <SeoTable headers={["Template", "What it is", "Good for"]} rows={templateRows} />
            <p>
              Classic and Modern are both built for marriage biodatas, with all the matrimonial fields in place - the
              difference is purely the look. Simple is the odd one out: choose it and the marriage-specific fields
              drop away, leaving a plain biodata (more on that below). Whichever you pick, the details you enter stay
              the same, so it&apos;s easy to try one and switch.
            </p>
          </section>

          <section>
            <h2>Every Detail, in the Right Place.</h2>
            <p>
              What makes this quicker than a blank document is that the fields adapt to the template. Choose a
              matrimonial template and you get everything a marriage biodata needs, grouped sensibly:
            </p>
            <SeoTable headers={["Section", "What goes in it"]} rows={sectionRows} />
            <p>
              You don&apos;t have to wrestle with any of this structure - it&apos;s already laid out. If you switch
              to the Simple template, the matrimonial rows quietly disappear, so you&apos;re never staring at fields
              that don&apos;t apply to you.
            </p>
          </section>

          <section>
            <h2>Add Your Photo.</h2>
            <p>
              A photo carries a lot of weight on a biodata, so the tool makes it easy to add a good one. Upload your
              picture, crop it right there, and it&apos;s set to a clean square that sits neatly at the top of the
              template - no stretching, no awkward framing. If you need a proper photo to begin with, RepetiGo&apos;s{" "}
              <Link href="/tools/photo/passport-photo/">passport photo tool</Link> can help you make one.
            </p>
          </section>

          <section>
            <h2>A Simple (Non-Matrimonial) Biodata.</h2>
            <p>
              Not every biodata is for marriage. Sometimes you just need a plain personal biodata - your basic
              details, education, and contact information - without any of the matrimonial fields. That&apos;s what
              the Simple template is for. Select it and the marriage-specific sections drop away, leaving a clean,
              general-purpose biodata you can fill in and print.
            </p>
            <p>
              One thing to be clear about: Simple is a plain, general biodata, not a government-form layout. If
              you&apos;re after the tabular, year-wise format some job or panchayat forms ask for - with an education
              table, a declaration line, and a signature space - that specific format isn&apos;t part of this tool.
              For a straightforward personal biodata, though, Simple does the job neatly.
            </p>
          </section>

          <section>
            <h2>Typing in Marathi, Hindi or Your Language.</h2>
            <p>
              People often ask for a biodata in Marathi, Hindi, or another regional language, so here&apos;s exactly
              how it works. The template designs and the field labels are in English, but the content is yours - you
              can type your details in Marathi, Hindi, or any language your keyboard supports, right into the
              fields, and they&apos;ll appear that way on your biodata and in the PDF.
            </p>
            <p>
              What the tool doesn&apos;t yet offer is a ready-made Marathi or Devanagari template with translated
              labels and matching fonts - the layouts are the three English ones. So if you&apos;re comfortable
              typing your own text in your language, you can absolutely produce a biodata in it; if you specifically
              need a fully Marathi-styled template, that isn&apos;t available here yet. Being upfront about that
              saves you a surprise at the download step.
            </p>
            <Callout emoji="💡">
              In your language: type your details in Marathi, Hindi or any script into the fields and they print as
              typed. The templates and labels themselves are in English (no dedicated regional-script template yet).
            </Callout>
          </section>

          <section>
            <h2>Biodata Maker Near You - At Your Local Cyber Cafe.</h2>
            <p>
              You don&apos;t have to do this on your own phone if you&apos;d rather not. The same biodata maker runs
              at cyber cafes, print shops, and CSC centres near you, so you can walk in, build the biodata with a
              staff member&apos;s help, and take a printed copy with you.
            </p>
            <p>
              For a lot of families that&apos;s the easier route - especially when you want a proper printout to hand
              over or post, and want it today. The shop uses the same three templates and the same fields; often you
              can fill it in on your own phone through a link while you&apos;re there, then print. So you get a real
              biodata maker and a nearby place that can print it, in one visit. If you searched for a biodata maker
              near you, a RepetiGo-powered shop is set up for exactly this.
            </p>
            <Callout emoji="📍">
              At nearby cyber cafes and print shops: build your biodata with a hand from the staff and print it on
              the spot - the same templates you&apos;d use online.
            </Callout>
          </section>

          <section>
            <h2>Download a Print-Ready PDF.</h2>
            <p>
              When it&apos;s ready, you download a PDF - the format that prints cleanly and shares easily, and the
              one families expect. You&apos;ll see a watermarked preview first so you can check every detail, then
              the clean version without the watermark, laid out to print neatly on a single page.
            </p>
            <p>
              On cost, plainly: building and previewing your biodata is free. The clean download is free wherever the
              shop keeps it free - RepetiGo shops set their own prices, and the tool stays free by default until a
              shop decides to charge a small amount for a finished build, usually with the printout. No subscription,
              no account needed to start. Build it, look it over, then decide.
            </p>
          </section>

          <section>
            <h2>What This Biodata Maker Does Not Do.</h2>
            <p>A quick, honest list of what it won&apos;t do - better to know now than at the download screen:</p>
            <SeoTable headers={["People sometimes expect…", "The honest answer"]} rows={notDoRows} />
          </section>

          <section>
            <h2>Biodata Maker - Frequently Asked Questions.</h2>
            <div className="tool-seo-faq-list">
              {faqs.map(([question, answer]) => (
                <details key={question}>
                  <summary>{question}</summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section>
            <h2>Related Tools.</h2>
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
            <h2>Make Your Marriage Biodata Now - Free</h2>
            <p>Matrimonial and simple templates, every field in the right place, and a print-ready PDF. No sign-up required to start building.</p>
            <div className="tool-seo-cta-stack">
              <Link className="tool-seo-inline-cta" href={builderUrl}>
                Make Your Marriage Biodata Free - Templates + PDF <span>&#8594;</span>
              </Link>
              <Link className="tool-seo-inline-cta" href="/print-automation">
                Find a RepetiGo Shop Near You <span>&#8594;</span>
              </Link>
            </div>
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
