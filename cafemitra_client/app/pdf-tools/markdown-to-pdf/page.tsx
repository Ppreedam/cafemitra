import type { Metadata } from "next";
import Link from "next/link";
import { DashboardShell } from "../../DashboardShell";
import MarkdownToPdfClient from "./MarkdownToPdfClient";

const pageUrl = "https://repetigo.com/pdf-tools/markdown-to-pdf";

export const metadata: Metadata = {
  title: "Markdown to PDF Converter Free Online - No Pandoc | RepetiGo",
  description:
    "Convert Markdown to PDF free online - paste .md content or upload a file, get a clean PDF instantly. No Pandoc, no CLI, no setup. Also: PDF to Markdown. No sign-up. Browser-only - files never uploaded.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Markdown to PDF Converter Free Online - No Pandoc | RepetiGo",
    description:
      "Convert Markdown to PDF free online - paste .md or upload file, get clean PDF. No Pandoc, no CLI, no setup. Also PDF to Markdown. No sign-up.",
    type: "website",
    url: pageUrl,
    images: ["https://repetigo.com/og-markdown-to-pdf.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Markdown to PDF Free Online - RepetiGo",
    description: "Paste Markdown, get PDF. No Pandoc, no setup. Also PDF to Markdown.",
  },
  robots: { index: true, follow: true },
};

const markdownElements = [
  ["Headings (H1-H6)", "# Heading 1, ## Heading 2, ### Heading 3, etc.", "Bold headings with three size tiers - H1 largest, H2 medium, H3-H6 share a smaller size. No PDF bookmark outline is generated."],
  ["Paragraphs", "Plain text with a blank line between paragraphs", "Standard paragraph text with correct spacing between blocks."],
  ["Bold and italic", "**bold**, *italic*, ***bold italic***", "The markers are stripped and the text renders in the regular body font - visual emphasis is not applied in the downloaded PDF (headings are the exception - they're always bold)."],
  ["Bullet lists", "- Item or * Item or + Item", "Bullet points with a dash marker; nested/indented sub-lists are not detected - all items render at the same level."],
  ["Numbered lists", "1. First item, 2. Second item", "Your typed numbers pass through as plain text; the tool does not automatically renumber or restyle them as a list."],
  ["Code blocks", "``` language ... ``` (fenced) or indented 4 spaces", "Monospace font code block with syntax-aware colour highlighting when a language is specified."],
  ["Inline code", "`code snippet`", "The backticks are stripped and the text renders as regular body text - no monospace font or background highlight is applied in the downloaded PDF."],
  ["Tables", "| Col 1 | Col 2 | / |---|---| / | Data | Data |", "Formatted tables with a shaded header row and cell borders; data rows are plain white, not alternately shaded."],
  ["Links", "[Link text](https://url.com)", "Link text is shown, but the URL is discarded - links are not clickable in the downloaded PDF."],
  ["Images", "![alt text](image-path.png)", "Images referenced by an https:// URL or a data: URI are fetched and embedded. A locally referenced image path cannot be embedded - it appears as a text placeholder with the alt text and path instead, since there's no way to upload a separate image file."],
  ["Blockquotes", "> Quoted text", "Indented block with left border rule - standard blockquote styling."],
  ["Horizontal rules", "--- or ***", "Not rendered as a line in the downloaded PDF - currently prints as literal text."],
  ["Strikethrough", "~~strikethrough~~", "The ~~ markers are stripped and the text renders as plain, unstruck text in the downloaded PDF."],
];

const developerMethods = [
  ["RepetiGo (browser)", "Paste your Markdown in the browser, download PDF instantly. No configuration.", "Quick one-off conversions, non-technical users, CI/CD without local tooling, sharing with non-developers.", "None - browser only. No install, no config."],
  ["Pandoc (CLI)", "Command: pandoc input.md -o output.pdf. Produces high-quality PDF via LaTeX. Highly customisable with templates, CSS, and metadata.", "Automated pipelines, academic writing with citations, custom-styled documentation output, R Markdown rendering.", "Install Pandoc + a LaTeX distribution (TeX Live, MiKTeX). Several hundred MB of dependencies."],
  ["VSCode Extension", "markdown-pdf or other extensions convert the current .md file to PDF from inside the editor with one click.", "Developers already working in VSCode who want quick in-editor conversion without leaving the IDE.", "Install VSCode + the markdown-pdf extension. Works only inside VSCode."],
  ["Python (WeasyPrint / md2pdf)", "import md2pdf; md2pdf.convert() or Markdown -> HTML -> WeasyPrint -> PDF pipeline.", "Batch processing, programmatic conversion in web apps, custom Python pipelines that already use Markdown.", "pip install md2pdf / weasyprint. Python environment required. Platform-specific rendering dependencies."],
  ["R Markdown (knitr/rmarkdown)", "Render Rmd file to PDF via rmarkdown::render(). Uses knitr to execute R code chunks and Pandoc for conversion.", "Data science reports with embedded R code, statistical analysis documents, academic papers with R outputs.", "R + rmarkdown package + Pandoc + LaTeX. Full data science environment."],
];

const safetyRows = [
  ["Stays in your browser", "Your Markdown content is processed entirely within your browser and is never uploaded to any server."],
  ["Local processing", "Your content is processed locally inside your browser tab - no server session, no upload."],
  ["Content never stored", "The conversion engine renders your Markdown to PDF. It does not index, store, or analyse the content of your documents."],
  ["No account, no server, no data", "No sign-up, no server upload - we hold no information about you or your documents whatsoever."],
];

const relatedTools = [
  ["Compress PDF", "Reduce the size of your converted PDF", "/pdf-tools/compress-pdf"],
  ["Merge PDF", "Combine multiple converted PDFs into one", "/pdf-tools/merge-pdf"],
  ["Word to PDF", "Convert .docx documents to PDF", "/pdf-tools/word-to-pdf"],
  ["JPG to PDF", "Convert images to PDF", "/pdf-tools/jpg-to-pdf"],
  ["Edit PDF", "Edit the converted PDF after downloading", "/pdf-tools/edit-pdf"],
  ["Protect PDF", "Add a password to the converted PDF", "/pdf-tools/protect-pdf"],
  ["Sign PDF", "Sign the converted document", "/pdf-tools/sign-pdf"],
  ["All PDF Tools", "Complete free PDF tools library", "/pdf-tools"],
];

const faqs = [
  ["Q1: How do I convert a Markdown file to PDF online for free?", "Go to repetigo.com/pdf-tools/markdown-to-pdf, open your .md file in any text editor, copy the content, paste it into RepetiGo's editor, check the preview, and click Generate PDF. Free, no account required, browser-only processing. Works in any browser on Mac, Windows, iPhone, and Android."],
  ["Q2: What Markdown formatting is preserved when converting to PDF?", "Headings, fenced code blocks with syntax-aware colouring, tables, blockquotes, and images referenced by a URL all render with real formatting in the PDF. Plain paragraph text, list items, and blockquote text render as plain body text - bold, italic, inline code, strikethrough, and link markup are stripped rather than styled, and horizontal rules currently print as literal text rather than a line. See the 'What Markdown Elements Are Supported' table above for the full, honest breakdown."],
  ["Q3: How do I convert Markdown to PDF using Pandoc?", "Install Pandoc and a LaTeX distribution such as TeX Live on Mac/Linux or MiKTeX on Windows, then run pandoc input.md -o output.pdf. For styled output with custom fonts, add --pdf-engine=xelatex --variable mainfont='Arial'. For a browser-based alternative that requires no installation, use RepetiGo."],
  ["Q4: How do I convert Markdown to PDF in Python?", "Two common approaches are md2pdf and markdown plus WeasyPrint. With md2pdf, install it and convert the input file to an output PDF. With WeasyPrint, parse Markdown to HTML with the markdown library, then render that HTML to PDF. For quick conversions without a Python environment, use RepetiGo's browser tool."],
  ["Q5: How do I convert a GitHub README to PDF?", "Copy the raw content of your README.md file from GitHub (click Raw on the file view), paste it into RepetiGo's Markdown editor, and download the PDF. RepetiGo doesn't accept a file upload here - paste is the only way in - but it does support GitHub Flavored Markdown tables and fenced code blocks in the parts of the output that render with full formatting."],
  ["Q6: How do I convert PDF to Markdown?", "Go to RepetiGo's PDF to Markdown tool at /pdf-tools/pdf-to-markdown - a separate page from this one - upload your PDF, select the pages you want, and click Convert. It extracts the text, detects headings from font size and boldness, turns visible links into Markdown syntax, and lets you copy or download the result as a .md file. Scanned PDFs need OCR PDF first, since there's no text layer to extract from an image."],
  ["Q7: Does the PDF preserve my code blocks with syntax highlighting?", "Yes. Fenced code blocks are converted to formatted code blocks in the PDF with a monospace font and syntax-aware colour highlighting. Specifying the language after the opening fence, such as python or javascript, enables language-specific formatting in the output."],
  ["Q8: Can I convert a Markdown file with images to PDF?", "Only images referenced by a full https:// URL or a data: URI can appear in the PDF - those are fetched and embedded automatically. A locally referenced image path (like ./photo.png) cannot be embedded, since there's no way to upload a separate image file alongside your Markdown text; it shows as a text placeholder with the alt text and path instead. If your images need to appear, either host them online and reference the full URL, or convert them to a data: URI before pasting."],
  ["Q9: How do I convert R Markdown to PDF?", "Standard R Markdown files with YAML header and R code chunks should be rendered in RStudio with rmarkdown::render() first. This executes the R code and produces a standard Markdown output. Paste that rendered Markdown into RepetiGo for PDF conversion. Alternatively, install Pandoc and render the Rmd to PDF directly."],
  ["Q10: Is it safe to paste a confidential .md file's content to convert online?", "With RepetiGo, yes. Your Markdown is processed entirely within your browser and never uploaded to any server. The conversion engine renders your content to PDF without reading, indexing, or storing it. No sign-up means we hold no information about you or your content."],
];

export default function MarkdownToPdfPage() {
  return (
    <DashboardShell activePath="/pdf-tools">
      <div className="dashboard generic-pdf-tool-page">
        <JsonLd />
        <article className="tool-seo-content" id="markdown-to-pdf-guide">
          <h1>Convert Markdown to PDF Free Online. Paste Your Markdown - Get a Clean PDF Instantly. No Pandoc.</h1>
          <HeroIntro />
          <section><h2>What Is Markdown and Why Convert It to PDF?</h2><MarkdownIntro /></section>
          <section><h2>What Markdown Elements Are Supported in the PDF?</h2><p>When you convert Markdown to PDF with RepetiGo, here is honestly what happens to each element in the downloaded PDF:</p><SeoTable headers={["Markdown Element", "Markdown Syntax", "How It Appears in the PDF"]} rows={markdownElements} /><Callout>Good to know: the live preview panel renders full Markdown styling (bold, italic, links, strikethrough) using real HTML. The downloaded PDF is generated separately - it supports headings, code blocks, tables, blockquotes, and URL-based images with real formatting, but currently strips bold, italic, inline code, strikethrough, and link markup to plain text, and doesn't render horizontal rules as a line. What you see in the preview and what you get in the PDF can differ for those specific elements.</Callout><Callout>For best results with code-heavy Markdown files, specify the language after the opening fence, such as python, javascript, or bash. This enables syntax-aware colour highlighting in the PDF output.</Callout></section>
          <HowToSection />
          <UseCases />
          <ReverseDirection />
          <DeveloperSection />
          <NoInstallSection />
          <IndiaSection />
          <SafetySection />
          <FaqSection />
          <RelatedTools />
          <section className="tool-seo-cta"><h2>Convert Markdown to PDF Free Now</h2><p>No Pandoc. No LaTeX. No setup. Paste and download. Browser-only processing.</p><Link href="/pdf-tools/markdown-to-pdf">Convert Markdown to PDF Free Now</Link></section>
        </article>
        <MarkdownToPdfClient />
      </div>
    </DashboardShell>
  );
}

function HeroIntro() {
  return <section className="tool-seo-hero"><p>You wrote your documentation, README, report, or notes in Markdown. Now you need a PDF - for sharing, printing, submitting, or archiving. The usual options mean setting up Pandoc on the command line, installing a VSCode extension, or running a Python script. All of that takes time you don't have right now.</p><p>RepetiGo's free Markdown to PDF converter works in your browser - type or paste your Markdown content directly into the editor, and download a clean, formatted PDF in seconds. No installation, no command line, no account.</p><div className="tool-seo-badges"><span>✓ Type or paste Markdown in the editor</span><span>✓ Headings, code blocks, tables, images preserved</span><span>✓ Also: convert PDF to Markdown</span><span>✓ No sign-up</span><span>✓ Files never uploaded - processed in your browser</span></div><div className="tool-seo-cta-stack"><Link className="tool-seo-inline-cta" href="/pdf-tools/markdown-to-pdf">Convert Markdown to PDF Free <span>→</span></Link></div></section>;
}

function MarkdownIntro() {
  return <><p>Markdown is a lightweight text formatting language that uses plain text symbols to define structure:</p><ul className="tool-seo-list"><li># for headings, ## for sub-headings</li><li>**bold**, *italic*, `inline code`</li><li>- or * for bullet lists, 1. 2. 3. for numbered lists</li><li>| col | col | for tables</li><li>``` ``` for code blocks</li><li>![alt](image.png) for images</li></ul><p>Markdown is used everywhere - GitHub READMEs, technical documentation, Jekyll and Hugo blogs, note-taking apps (Obsidian, Notion), academic writing (Pandoc), and developer documentation sites (Docusaurus, MkDocs). It is human-readable as plain text and renders beautifully when converted.</p><p>The problem: Markdown files (.md) are not universally readable. A client, employer, university, or government office cannot open a .md file in Word or a PDF reader. Converting Markdown to PDF gives you a formatted document that anyone can open, print, and read without any special software.</p><Callout>You do not need to understand Markdown to use this tool. Open your .md file in any text editor, copy the content, and paste it into the RepetiGo editor - RepetiGo converts it to a PDF automatically.</Callout></>;
}

function HowToSection() {
  return <section><h2>How to Convert Markdown to PDF Free Online.</h2><p>Three steps. Under a minute for most documents.</p><h3>Step 1 - Paste Your Markdown in the Editor</h3><p>Click into the Markdown tab and paste or type your content directly into the editor - there's no file upload here, only paste or type. The editor starts with sample content you can select and replace. Accepts any standard Markdown - CommonMark, GitHub Flavored Markdown syntax, and common extensions - though see the table above for exactly which elements carry through into the downloaded PDF.</p><h3>Step 2 - Preview and Adjust</h3><p>A live preview on the right shows how your Markdown renders as HTML, updating as you type. There's a Custom CSS tab where you can edit the preview's styling directly - useful for checking how your content is structured, though this CSS only affects the on-screen preview, not the downloaded PDF's appearance. There are no page size, margin, or font settings to configure for the PDF output itself.</p><h3>Step 3 - Download Your PDF</h3><p>Click Generate PDF. Your PDF downloads automatically to your device, with headings, code blocks, tables, blockquotes, and URL-based images rendered - see the table above for exactly which elements carry through. Nothing is uploaded - the file is generated and saved locally in your browser.</p><Callout>Converting a GitHub README.md? Copy the raw content (click Raw on the file view in GitHub) and paste it into the editor - there's no file upload, so paste is the way in. RepetiGo handles GitHub Flavored Markdown tables and fenced code blocks in the elements that render with full formatting.</Callout><div className="tool-seo-cta-stack"><Link className="tool-seo-inline-cta" href="/pdf-tools/markdown-to-pdf">Convert Markdown to PDF Now - Free <span>→</span></Link></div></section>;
}

function UseCases() {
  const items = ["GitHub README to PDF: Your repository README is a .md file. Convert it to PDF to share project documentation with non-technical stakeholders, for a project report submission, or to archive a version of your documentation.", "Technical documentation export: Documentation written in Markdown for sites like Docusaurus, MkDocs, or Jekyll needs to be distributed as a PDF for offline reading, compliance archiving, or client handover.", "Markdown resume or CV: Many developers write their resume in Markdown for version control and easy editing. Convert to PDF for job application submissions - clean, consistent formatting without wrestling with Word's layout engine.", "Academic and research notes: Research notes, literature reviews, and academic writing in Markdown converted to PDF for submission, sharing with supervisors, or personal archiving.", "Meeting notes and reports: Quick notes written in Markdown in tools like Obsidian, Bear, or Notion exported to PDF for distribution to team members or clients who cannot access the original note-taking app.", "Student project reports: University assignments and project reports written in Markdown converted to PDF for submission via portal or email. Consistent PDF formatting regardless of the student's device or operating system."];
  return <section><h2>Common Use Cases - When You Need Markdown as a PDF.</h2><ul className="tool-seo-list">{items.map((item) => <li key={item}>{item}</li>)}</ul></section>;
}

function ReverseDirection() {
  return <section><h2>Convert PDF to Markdown - The Reverse Direction.</h2><p>Need to go the other way? RepetiGo's PDF to Markdown tool extracts your PDF's text and turns it into clean, editable Markdown - available now, as a separate page from this one.</p><p>Upload a PDF and it renders every page as a preview thumbnail while reading the underlying text layer. You choose which pages to include, then convert. Headings are detected automatically from font size and boldness (you can turn this off to keep everything as plain paragraphs instead), visible web links are turned into proper Markdown link syntax, and you can choose to separate each page with a --- divider in the output. Scanned pages with no text layer are flagged so you know to run OCR PDF first.</p><ul className="tool-seo-list"><li>Upload any PDF with a text layer - exported from Word, LaTeX, a website, or already OCR-processed. Scanned PDFs need OCR PDF first.</li><li>Choose which pages to include, then convert - the result opens in a built-in preview/source toggle you can edit directly.</li><li>Copy the Markdown to your clipboard or download it as a .md file.</li><li>Edit further in any Markdown editor - VSCode, Obsidian, Typora, or a plain text editor.</li></ul><Callout>PDF to Markdown is particularly useful for extracting content from old PDFs for documentation sites, converting a published report into editable Markdown for updating, and migrating content from a PDF archive into a modern Markdown-based content system.</Callout><div className="tool-seo-cta-stack"><Link className="tool-seo-inline-cta" href="/pdf-tools/pdf-to-markdown">Convert PDF to Markdown - Free <span>→</span></Link></div></section>;
}

function DeveloperSection() {
  return <section><h2>For Developers: Convert Markdown to PDF with Common Tools.</h2><p>If you are a developer, there are several established ways to convert Markdown to PDF programmatically. Here is how the main options compare - and when the RepetiGo browser tool is the faster choice:</p><SeoTable headers={["Method", "How It Works", "Best For", "Setup Required"]} rows={developerMethods} /><h3>Pandoc: The CLI Standard</h3><p>Pandoc is the most powerful free tool for Markdown to PDF conversion. The basic command is straightforward:</p><pre><code>pandoc input.md -o output.pdf</code></pre><p>For better styling and font control, use the --pdf-engine option and a custom CSS or LaTeX template:</p><pre><code>pandoc input.md -o output.pdf --pdf-engine=xelatex --variable mainfont='Arial'</code></pre><p>Pandoc requires a LaTeX installation (TeX Live on Linux/Mac, MiKTeX on Windows) for PDF output - the download can be 1-4GB. For quick conversions without the installation overhead, RepetiGo runs in the browser instead.</p><h3>Python Libraries</h3><p>Two common Python approaches for Markdown to PDF in Python:</p><pre><code>{`# md2pdf: simple one-liner
pip install md2pdf
md2pdf input.md output.pdf

# WeasyPrint: full control via HTML intermediate
pip install markdown weasyprint
import markdown, weasyprint
html = markdown.markdown(open('input.md').read())
weasyprint.HTML(string=html).write_pdf('output.pdf')`}</code></pre><h3>VSCode Extension</h3><p>Install the 'markdown-pdf' extension in VSCode (by yzane). Open your .md file, press Ctrl+Shift+P, search 'Markdown PDF: Export (pdf)'. The PDF is saved in the same folder as your .md file. Configuration is via settings.json for custom headers, footers, and CSS styles.</p><Callout>For automated pipelines and batch processing, Pandoc and Python libraries are the right tools. For one-off quick conversions without any setup, RepetiGo is faster - paste your Markdown and download the PDF in under 30 seconds.</Callout></section>;
}

function NoInstallSection() {
  return <section><h2>Markdown to PDF Without Installing Anything.</h2><p>The fastest path from Markdown to PDF requires nothing on your machine. No Pandoc, no LaTeX, no Python environment, no VSCode, no npm packages.</p><ul className="tool-seo-list"><li>Pandoc: Excellent tool, but requires installing Pandoc plus a full LaTeX distribution (1-4GB). Not practical for quick one-off conversions or on shared/managed machines.</li><li>VSCode extension: Works great if you already use VSCode, but requires VSCode installed and the extension configured. Cannot be used from a browser or by someone without VSCode.</li><li>Python library: Requires Python environment, pip, and often platform-specific rendering libraries like WeasyPrint's Cairo dependencies.</li><li>RepetiGo: Open a browser tab. Paste your Markdown into the editor. Download your PDF. Nothing to install, configure, or maintain.</li></ul><p>For developers who need a quick conversion without pulling in a local toolchain, or for non-technical users who just received a .md file and need to share a PDF - RepetiGo is the zero-friction path.</p></section>;
}

function IndiaSection() {
  return <section><h2>Markdown to PDF for Free in India.</h2><p>India's growing developer and technical writing community generates significant demand for Markdown to PDF conversion - particularly around GitHub documentation, student project submissions, and technical content exports:</p><ul className="tool-seo-list"><li>GitHub README exports: Indian open-source contributors, hackathon participants, and engineering students frequently need to submit their GitHub README.md as a PDF - for project evaluations, internship applications, and hackathon documentation submissions.</li><li>Technical documentation: Engineering teams at Indian startups, product companies, and IT services firms increasingly write documentation in Markdown and need PDF exports for client handover, audit submissions, and internal knowledge base distribution.</li><li>Student project reports: Computer science and engineering students at IITs, NITs, and other institutions writing project reports in Markdown need clean PDF outputs for faculty submission, without the complexity of setting up Pandoc on university lab systems.</li><li>Resume and portfolio: Developers writing their resume in Markdown for version control and applying to Indian companies that require PDF resumes. Converting Markdown to PDF gives consistent, formatting across devices.</li><li>Data science and research reports: Indian data science community members using R Markdown or Jupyter Notebook-style documentation needing PDF export for publication, conference submission, or stakeholder reporting.</li></ul><p>With RepetiGo you can convert Markdown to PDF free online in India - paste your .md content into the editor and download a PDF in seconds. No Pandoc installation, no LaTeX dependency, no account.</p><Callout>For IIT/NIT/university project report submissions that specify PDF format: write your report in Markdown, paste it in here, and download a clean, consistently formatted PDF that works across all university submission portals.</Callout></section>;
}

function SafetySection() {
  return <section><h2>Your Files Never Leave Your Browser.</h2><p>Markdown files often contain code, proprietary documentation, unreleased product specifications, or personal project data. Here is what happens:</p><SeoTable headers={["Protection Layer", "What It Means in Practice"]} rows={safetyRows} /><div className="tool-seo-cta-stack"><Link className="tool-seo-inline-cta" href="/privacy-policy">Privacy Policy <span>→</span></Link></div></section>;
}

function FaqSection() {
  return <section><h2>Common Questions About Markdown to PDF Conversion.</h2><div className="tool-seo-faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>;
}

function RelatedTools() {
  return <section><h2>More Free PDF Tools from RepetiGo.</h2><SeoTable headers={["Tool", "What It Does", "Link"]} rows={relatedTools.map(([tool, does, href]) => [tool, does, labelFor(href)])} /><div className="tool-seo-related-grid">{relatedTools.map(([tool, does, href]) => <Link href={href} key={tool}>{tool}<span>{does}</span></Link>)}</div></section>;
}

function Callout({ children }: { children: React.ReactNode }) {
  return <aside className="tool-seo-callout"><p>{children}</p></aside>;
}

function SeoTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return <div className="tool-seo-table-wrap"><table><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.join("|")}>{row.map((cell, index) => <td key={`${cell}-${index}`}>{cell}</td>)}</tr>)}</tbody></table></div>;
}

function labelFor(href: string) {
  const labels: Record<string, string> = {
    "/pdf-tools/compress-pdf": "Open Compress PDF",
    "/pdf-tools/merge-pdf": "Open Merge PDF",
    "/pdf-tools/word-to-pdf": "Open Word to PDF",
    "/pdf-tools/jpg-to-pdf": "Open JPG to PDF",
    "/pdf-tools/edit-pdf": "Open Edit PDF",
    "/pdf-tools/protect-pdf": "Open Protect PDF",
    "/pdf-tools/sign-pdf": "Open Sign PDF",
    "/pdf-tools": "Explore All PDF Tools",
  };
  return labels[href] || "Open PDF Tool";
}

function JsonLd() {
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "RepetiGo Markdown to PDF Converter",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
      description: "Free online Markdown to PDF converter with no Pandoc, no CLI, and no setup. Paste Markdown into the editor and download a PDF - headings, code blocks, tables, blockquotes, and URL-based images render with real formatting.",
      url: pageUrl,
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to Convert Markdown to PDF Free Online",
      step: [
        { "@type": "HowToStep", name: "Paste your Markdown", text: "Paste your Markdown content into the editor." },
        { "@type": "HowToStep", name: "Preview and adjust", text: "Check the live preview of headings, code blocks, tables, and images." },
        { "@type": "HowToStep", name: "Download PDF", text: "Click Generate PDF and download your formatted PDF." },
      ],
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
        { "@type": "ListItem", position: 2, name: "PDF Tools", item: "https://repetigo.com/pdf-tools" },
        { "@type": "ListItem", position: 3, name: "Markdown to PDF", item: pageUrl },
      ],
    },
  ];
  return <>{schemas.map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>;
}
