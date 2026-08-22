import type { Metadata } from "next";
import type React from "react";
import Link from "next/link";
import { LandingNavbar } from "../../LandingNavbar";
import { PublicFooter } from "../../PublicFooter";

const siteUrl = "https://repetigo.com";
const pageUrl = `${siteUrl}/tools/resume-maker/`;
const builderUrl = "/resume-builder";

export const metadata: Metadata = {
  title: "Resume Maker - Free Templates, Photo & Print-Ready PDF | RepetiGo",
  description:
    "Free resume maker with 9 professional templates and an ATS-safe design. Add your photo, fill your details, and download a print-ready PDF - online or at a nearby cyber cafe.",
  alternates: { canonical: pageUrl },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Resume Maker - Free Templates, Photo & Print-Ready PDF",
    description: "9 professional templates incl. an ATS-safe design. Fill your details and download a print-ready PDF.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume Maker - Free Templates & PDF",
    description: "Free resume maker: 9 templates, ATS-safe design, photo upload, print-ready PDF. Online or at a nearby shop.",
  },
};

const steps = [
  { title: "1. Pick a template", does: "Browse the nine, each shown with sample content.", result: "You start from a professional layout, ready to edit." },
  { title: "2. Fill in your details", does: "Add your information section by section; upload and crop your photo.", result: "Your resume updates live as you type." },
  { title: "3. Download", does: "Preview, then download the print-ready PDF.", result: "You get a clean resume to email or print." },
];

const templateRows = [
  ["Classic", "Traditional, single column", "Most roles; a safe, formal choice"],
  ["Modern", "Clean, contemporary", "Corporate and general applications"],
  ["Minimal", "Understated, lots of white space", "When you want the content to lead"],
  ["Elegant", "Refined and polished", "Senior or client-facing roles"],
  ["Bold", "Strong headings, high contrast", "Standing out in creative fields"],
  ["Sidebar Photo", "Photo and details in a side column", "A photo-forward, organised look"],
  ["Sidebar Photo (Right)", "The same, mirrored right", "The sidebar look, other way round"],
  ["ATS-Ultra", "Deliberately plain, ATS-safe", "Applications screened by software"],
  ["Timeline", "A visual career timeline", "Showing clear career progression"],
];

const sectionRows = [
  ["Personal details", "Photo, name, the role you want, email, phone, location, LinkedIn, website"],
  ["Professional summary", "A short paragraph on who you are and what you bring"],
  ["Skills", "Your key skills, in your own words"],
  ["Work experience", "Multiple roles, each with bullet points, plus a “currently working here” toggle"],
  ["Education", "Multiple entries - degree, school, dates, score"],
  ["Projects", "Multiple projects - name, tech stack, description, link"],
  ["Certifications", "Multiple certificates - name, issuer, year"],
];

const notDoRows = [
  ["AI to write the summary or bullet points", "No - the words are yours; there is no AI writing"],
  ["Grammar or spell check", "No - proofread your text yourself before downloading"],
  ["An ATS score or job-match report", "No - there’s an ATS-safe template, but no scoring tool"],
  ["Importing an old resume or LinkedIn", "No - you enter your details fresh"],
  ["A Word (DOCX) or image download", "No - the output is a print-ready PDF"],
  ["Changing the template colours", "No - each template keeps its own fixed accent colour"],
  ["A matching cover letter", "No - the tool builds the resume itself"],
];

const whoForRows = [
  ["Freshers", "A tidy first resume with room for projects and education, even with little experience"],
  ["Students", "A clean layout for internships and campus placements"],
  ["Job seekers", "Professional templates and an ATS-safe option for online applications"],
  ["Government-job applicants", "Plain, formal templates suited to sarkari applications"],
  ["Career switchers", "Reorder sections to lead with what matters for the new role"],
  ["Anyone near a cyber cafe", "A hand building it, and an instant printout, at a nearby shop"],
];

const faqs: [string, string][] = [
  [
    "Is this resume maker free?",
    "Building and previewing it, yes - completely. You can pick a template, fill every section, add your photo, and see the finished resume without paying a rupee. The clean, watermark-free download is free wherever the shop offers it that way; RepetiGo shops set their own pricing, and the tool stays free by default until one chooses to charge a small fee. No subscription, and you don’t need an account to begin.",
  ],
  [
    "How do I make a resume?",
    "Pick a template, then work down the sections - your details, a short summary, skills, work experience, education, projects, certifications - and upload a photo. It updates live as you type, and you can reorder items so your strongest points sit at the top. Once it looks right, download the PDF and you’re done.",
  ],
  [
    "Which resume template should I use?",
    "It depends where you’re applying. For most jobs, Classic or Modern is a safe, professional bet. Minimal and Elegant suit quieter, senior roles; Bold gets you noticed in creative fields; the sidebar templates put your photo front and centre. And if your resume is likely to be read by software first, go with ATS-Ultra - that’s what it’s for.",
  ],
  [
    "Is there an ATS-friendly template?",
    "That’s exactly what ATS-Ultra is: a plain, single-column layout with standard fonts and clear headings, and none of the graphics that make screening software stumble. Reach for it when you’re applying through big company portals or job boards. Do keep in mind it’s an ATS-safe template, not a tool that scores your resume against a specific job.",
  ],
  [
    "Can I make a resume at a shop near me?",
    "You can. The same builder runs at RepetiGo-powered cyber cafes, print shops, and CSC centres, so you can walk in, get help if you’d like it, and print on the spot. If “resume maker near me” is what brought you here, a nearby shop is set up for precisely this - real templates plus a printout, in a single visit.",
  ],
  [
    "How do I make a resume for a government (sarkari) job?",
    "Keep it plain. Choose ATS-Ultra or Classic for the simple, formal look sarkari applications expect, fill in your education, marks, and details clearly, add a photo where it’s asked for, and download a tidy PDF. And because the tool is available at cyber cafes, you can build and print it in the same visit you’d normally use for forms and printouts.",
  ],
  [
    "Does it write my resume for me with AI?",
    "No - the words are yours. The tool provides the templates, the structure, and every section to fill; it doesn’t generate your summary or bullet points, and there’s no grammar check, so write your own text and give it a proofread before downloading. What you get is a clean, well-organised frame to pour your experience into.",
  ],
  [
    "What format do I get, and can I get Word?",
    "A print-ready PDF - the format employers and portals accept, and the one that prints exactly as shown. There’s no Word (DOCX) or image export; the tool makes a PDF. If you need to adjust the file afterwards, RepetiGo’s PDF tools can compress or convert it for you.",
  ],
  [
    "Can I add a photo to my resume?",
    "Easily. Upload one, crop it right in the tool, and it’s auto-formatted to a neat square so it sits cleanly rather than stretched or off-centre. Photos are common on resumes in India, and templates like Sidebar Photo are built around one. No good photo on hand? RepetiGo’s passport photo tool can make you one.",
  ],
  [
    "Can I save my resume and edit it later?",
    "Your draft is kept in the browser as you work, so a refresh won’t wipe it. At a RepetiGo shop you can go further - save a resume to the shop’s account, keep several, and reopen or delete them whenever. Useful when a new opening means tweaking the same resume rather than starting from scratch.",
  ],
];

const relatedTools = [
  { label: "Resume Builder", text: "Build and print your resume - the tool itself.", href: builderUrl },
  { label: "Biodata Maker", text: "Make a marriage or job biodata.", href: "/biodata-maker" },
  { label: "Passport Photo", text: "Make a photo for your resume.", href: "/tools/photo/passport-photo/" },
  { label: "PDF Tools", text: "Compress or convert your resume PDF.", href: "/pdf-tools" },
  { label: "For Cyber Cafes & Print Shops", text: "Offer the resume maker to your customers.", href: "/print-automation" },
];

const schemaGraph = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "RepetiGo Resume Maker",
    description:
      "Free resume maker with 9 professional templates, including an ATS-safe design. Add a photo, fill in every section, and download a print-ready PDF - online or at a nearby cyber cafe.",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: pageUrl,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    featureList: [
      "9 professional resume templates, including an ATS-safe design",
      "Template gallery with sample content - switch templates anytime without losing your content",
      "Personal details, summary, skills, experience, education, projects and certifications sections",
      "Add, remove and reorder entries within each section",
      "Photo upload with in-browser cropping",
      "Live preview as you type",
      "Draft auto-saved in your browser",
      "Print-ready PDF download",
      "Save and reopen resumes from your account",
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
    name: "How to Make a Resume in 3 Steps",
    description: "Pick a resume template, fill in your details and photo, then download a print-ready PDF.",
    tool: {
      "@type": "HowToTool",
      name: "RepetiGo Resume Maker",
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
      { "@type": "ListItem", position: 3, name: "Resume Maker", item: pageUrl },
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

export default function ResumeMakerPage() {
  return (
    <div className="ai-landing-shell resume-maker-seo-shell">
      <LandingNavbar />
      <main className="tool-seo-page-wrap">
        <article className="tool-seo-content" id="resume-maker-guide">
          <section className="tool-seo-hero">
            <p className="tool-seo-kicker">9 Templates - ATS-Safe Design - Print-Ready PDF</p>
            <h1>Resume Maker - Build a Professional Resume, Free.</h1>
            <p>
              Most people don&apos;t need a clever resume. They need a clean one, fast - something that won&apos;t let
              them down in front of a recruiter, and ideally one they can print the same day rather than next week.
            </p>
            <p>
              That&apos;s the whole job here. You pick one of nine templates, type in your details, add a photo, and
              download a resume that&apos;s ready to print. No software to install, no design skills, no wrestling
              with margins in Word. It updates as you type, so you watch it take shape instead of guessing.
            </p>
            <p>
              And here&apos;s what most online builders can&apos;t offer: the same resume maker runs at cyber cafes
              and print shops near you. So you can build it yourself on your phone, or walk into a shop, get a hand
              from the staff, and leave with a printed copy. Either way it&apos;s the same set of templates -
              including one built to survive the automated systems that screen resumes before a human ever sees them.
            </p>
            <div className="tool-seo-badges">
              <span>&#10003; 9 professional templates, including an ATS-safe design</span>
              <span>&#10003; Photo, and every section a resume needs</span>
              <span>&#10003; Print-ready PDF</span>
              <span>&#10003; Online, or at a cyber cafe near you</span>
            </div>
            <div className="tool-seo-cta-stack">
              <Link className="tool-seo-inline-cta" href={builderUrl}>
                Make Your Resume Now - Free <span>&#8594;</span>
              </Link>
            </div>
          </section>

          <section>
            <h2>Why Your Resume Template Matters.</h2>
            <p>
              A recruiter gives your resume about six seconds before deciding whether to keep reading. In that
              window, layout quietly does a lot of the talking - a clean, organised design signals that you&apos;re
              serious before a single line is read, while a cramped or gaudy one works against you for reasons the
              recruiter may not even notice.
            </p>
            <p>
              There&apos;s a second reason, and it catches a lot of people out. Long before a person sees your
              resume, software often reads it first. These Applicant Tracking Systems scan the file, pull out your
              details, and rank you - and they stumble over anything unusual. Two columns, graphics, an unusual font:
              any of it can scramble what the software reads, and a resume it can&apos;t parse slips down the pile.
              So this tool gives you both - good-looking designs for when a human is reading, and a deliberately
              plain one for when a machine is. Choosing the right template is the easiest win on offer.
            </p>
          </section>

          <section>
            <h2>How to Make a Resume in 3 Steps.</h2>
            <p>Three steps, and none of them come with a manual.</p>
            <SeoTable headers={["Step", "What you do", "What happens"]} rows={steps.map((s) => [s.title, s.does, s.result])} />
            <p>
              Changed your mind about the look halfway through? Switch templates and everything you&apos;ve entered
              comes with you - nothing to redo. Your draft is also held in your browser as you work, so a stray
              refresh won&apos;t cost you anything.
            </p>
          </section>

          <section>
            <h2>9 Professional Resume Templates.</h2>
            <p>
              Nine templates, and they aren&apos;t just recolours of one design. Each has its own feel, so you can
              match it to the job - and to how you want to come across. Every one shows up in the gallery pre-filled
              with sample content, so you see exactly what you&apos;re getting before you commit.
            </p>
            <SeoTable headers={["Template", "Style", "Good for"]} rows={templateRows} />
            <p>
              Whichever you choose, the words you enter stay put - the template only changes how they&apos;re
              presented. So compare two or three and keep the one that makes you look best.
            </p>
          </section>

          <section>
            <h2>Every Section You Need.</h2>
            <p>
              A resume is only as strong as what goes into it, so the builder covers every section that earns its
              place - and lets you drag them into whatever order tells your story best.
            </p>
            <SeoTable headers={["Section", "What goes in it"]} rows={sectionRows} />
            <p>
              Add as many entries as you need in each section, drop the ones you don&apos;t, and reorder so the
              impressive stuff comes first. That&apos;s why the same tool fits a fresher with a single project and a
              professional with ten years of roles - you decide what leads.
            </p>
          </section>

          <section>
            <h2>Add Your Photo.</h2>
            <p>
              A photo on a resume is normal in India, and a bad one is more noticeable than you&apos;d think. Upload
              yours, crop it right inside the tool, and it&apos;s snapped to a clean square so it sits properly
              instead of stretched or off-centre. On the sidebar templates the photo leads; on the rest it tucks
              neatly into the header. If you don&apos;t have a decent one to hand, RepetiGo&apos;s{" "}
              <Link href="/tools/photo/passport-photo/">passport photo tool</Link> can make you one.
            </p>
          </section>

          <section>
            <h2>An ATS-Safe Resume Template.</h2>
            <p>
              One of the nine templates, ATS-Ultra, exists for a specific problem: getting past the software that
              screens resumes at larger companies. It&apos;s plain on purpose - single column, standard fonts, clear
              headings, none of the graphics or columns that confuse a parser. It won&apos;t win design awards, but
              the software reads it cleanly, your details land where they should, and you don&apos;t get filtered out
              over formatting you never knew was a problem.
            </p>
            <p>
              It&apos;s worth being straight about what this is, though. ATS-Ultra is a template designed to be
              ATS-friendly - the practical thing that matters for most applicants. It isn&apos;t a checker that
              scores your resume against a particular job ad; you pick the safe template and fill it with the right
              words yourself. If you&apos;re applying through a big careers portal or a job board, starting here is
              simply the sensible default.
            </p>
            <Callout emoji="✅">
              ATS-Ultra is a plain, single-column template built so screening software reads your resume correctly -
              a template, not a resume-scoring tool.
            </Callout>
          </section>

          <section>
            <h2>Resume Maker Near You - At Your Local Cyber Cafe.</h2>
            <p>
              Every other resume builder assumes you&apos;re doing this alone, on a screen. This one doesn&apos;t. The
              same tool runs at cyber cafes, print shops, and CSC centres near you - so you can walk in, build your
              resume with someone who does this all day, and walk out with it printed.
            </p>
            <p>
              That matters more than it sounds. If you&apos;ve got an interview tomorrow and need a hard copy
              tonight, or you&apos;d simply rather have a person guide you than tap through it on a small screen, a
              resume maker near me beats any app. The shop uses the same templates you&apos;d get online, and in many
              cases you can fill it in on your own phone through a link while you&apos;re standing there, then print.
              So it isn&apos;t a choice between a proper builder and a nearby shop - you get both in one trip. If a
              resume maker near you is what you&apos;re after, a RepetiGo-powered shop is built for exactly that.
            </p>
            <Callout emoji="📍">
              At nearby cyber cafes and print shops: get a hand building your resume and print it on the spot - the
              same nine templates you get online.
            </Callout>
          </section>

          <section>
            <h2>Making a Sarkari (Government Job) Resume.</h2>
            <p>
              Government job applications don&apos;t reward creativity. They reward clean and correct - a plain,
              formal resume with your qualifications, marks, and details laid out clearly, and nothing that gets in
              the way. Templates like ATS-Ultra and Classic give you exactly that.
            </p>
            <p>
              It&apos;s a natural fit for freshers and students chasing their first sarkari post, who usually just
              need something tidy and accurate, not flashy. And since cyber cafes are already where a lot of that
              crowd goes to fill forms and take printouts, a sarkari resume maker earns its keep there - build the
              resume and print it in the same sitting. Pick a plain template, enter your details, and you&apos;re
              set.
            </p>
          </section>

          <section>
            <h2>Download a Print-Ready PDF.</h2>
            <p>
              When it&apos;s ready, you get a PDF - the format every employer and portal accepts, and the one that
              prints exactly as it looks on your screen. You&apos;ll see a watermarked preview first to check
              nothing&apos;s out of place, then the clean version without the watermark, laid out to print neatly on
              standard paper.
            </p>
            <p>
              On cost, plainly: building and previewing your resume is free. The clean download is free wherever the
              shop keeps it free - RepetiGo shops set their own prices, and the tool stays free by default until a
              shop decides to charge a small amount for a finished build, usually alongside the printout. No
              subscription, and no account needed to start. Build first, decide later.
            </p>
          </section>

          <section>
            <h2>What This Resume Maker Does Not Do.</h2>
            <p>
              No tool does everything, and it&apos;s better to know the gaps now than to hit them at download.
              Here&apos;s where this one stops:
            </p>
            <SeoTable headers={["People sometimes expect…", "The honest answer"]} rows={notDoRows} />
          </section>

          <section>
            <h2>&#9733; Who It Is For.</h2>
            <p>
              If you want a clean resume without turning it into a weekend project, you&apos;re the reader this is
              for. More specifically:
            </p>
            <SeoTable headers={["Who", "Why it helps"]} rows={whoForRows} />
          </section>

          <section>
            <h2>Resume Maker - Frequently Asked Questions.</h2>
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
            <h2>Make Your Resume Now - Free</h2>
            <p>9 templates, every section you need, and a print-ready PDF. No sign-up required to start building.</p>
            <div className="tool-seo-cta-stack">
              <Link className="tool-seo-inline-cta" href={builderUrl}>
                Make Your Resume Free - 9 Templates + PDF <span>&#8594;</span>
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
