import type { Metadata } from "next";
import Link from "next/link";
import { DashboardShell } from "../../DashboardShell";
import ConversionTool from "../ConversionTool";

const pageUrl = "https://repetigo.com/pdf-tools/markdown-to-pdf";

export const metadata: Metadata = {
  title: "Markdown to PDF Converter Free Online - No Pandoc | RepetiGo",
  description:
    "Convert Markdown to PDF free online - paste .md content or upload a file, get a clean PDF instantly. No Pandoc, no CLI, no setup. Also: PDF to Markdown. No sign-up. Files deleted in 60 minutes.",
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
  ["Headings (H1-H6)", "# Heading 1, ## Heading 2, ### Heading 3, etc.", "Bold headings with font size hierarchy - H1 largest, H6 smallest. PDF includes a bookmark outline."],
  ["Paragraphs", "Plain text with a blank line between paragraphs", "Standard paragraph text with correct spacing between blocks."],
  ["Bold and italic", "**bold**, *italic*, ***bold italic***", "Bold, italic, and combined emphasis rendered in the output font."],
  ["Bullet lists", "- Item or * Item or + Item", "Indented bullet point lists, nested to multiple levels."],
  ["Numbered lists", "1. First item, 2. Second item", "Numbered lists with correct sequential numbering preserved."],
  ["Code blocks", "``` language ... ``` (fenced) or indented 4 spaces", "Monospace font code block with syntax-aware background shading. Language label shown if specified."],
  ["Inline code", "`code snippet`", "Inline monospace code with light background highlighting."],
  ["Tables", "| Col 1 | Col 2 | / |---|---| / | Data | Data |", "Formatted tables with header row, borders, and alternating row shading."],
  ["Links", "[Link text](https://url.com)", "Clickable hyperlinks preserved in the PDF with underlined link text."],
  ["Images", "![alt text](image-path.png)", "Images embedded in the PDF. Linked images fetched and embedded at conversion time."],
  ["Blockquotes", "> Quoted text", "Indented block with left border rule - standard blockquote styling."],
  ["Horizontal rules", "--- or ***", "Full-width horizontal line separator in the PDF."],
  ["Strikethrough", "~~strikethrough~~", "Strikethrough text rendered in the output."],
];

const developerMethods = [
  ["RepetiGo (browser)", "Paste or upload Markdown in the browser, download PDF instantly. No configuration.", "Quick one-off conversions, non-technical users, CI/CD without local tooling, sharing with non-developers.", "None - browser only. No install, no config."],
  ["Pandoc (CLI)", "Command: pandoc input.md -o output.pdf. Produces high-quality PDF via LaTeX. Highly customisable with templates, CSS, and metadata.", "Automated pipelines, academic writing with citations, custom-styled documentation output, R Markdown rendering.", "Install Pandoc + a LaTeX distribution (TeX Live, MiKTeX). Several hundred MB of dependencies."],
  ["VSCode Extension", "markdown-pdf or other extensions convert the current .md file to PDF from inside the editor with one click.", "Developers already working in VSCode who want quick in-editor conversion without leaving the IDE.", "Install VSCode + the markdown-pdf extension. Works only inside VSCode."],
  ["Python (WeasyPrint / md2pdf)", "import md2pdf; md2pdf.convert() or Markdown -> HTML -> WeasyPrint -> PDF pipeline.", "Batch processing, programmatic conversion in web apps, custom Python pipelines that already use Markdown.", "pip install md2pdf / weasyprint. Python environment required. Platform-specific rendering dependencies."],
  ["R Markdown (knitr/rmarkdown)", "Render Rmd file to PDF via rmarkdown::render(). Uses knitr to execute R code chunks and Pandoc for conversion.", "Data science reports with embedded R code, statistical analysis documents, academic papers with R outputs.", "R + rmarkdown package + Pandoc + LaTeX. Full data science environment."],
];

const safetyRows = [
  ["Encrypted upload", "TLS encryption in transit. Your .md file cannot be intercepted."],
  ["Isolated processing", "Your file processes in a temporary session with no link to any account or persistent identifier."],
  ["Auto-deleted in 60 minutes", "Both your uploaded Markdown file and the PDF output are permanently deleted within 60 minutes."],
  ["Content never stored", "The conversion engine renders your Markdown to PDF. It does not index, store, or analyse the content of your documents."],
  ["No account = no data", "No sign-up means we hold zero information about you or your documents."],
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
  ["Q1: How do I convert a Markdown file to PDF online for free?", "Paste your Markdown content into RepetiGo's editor or upload a .md file, check the preview, and click Download PDF. It is free, no account is required, files are deleted in 60 minutes, and it works in any browser on Mac, Windows, iPhone, and Android."],
  ["Q2: What Markdown formatting is preserved when converting to PDF?", "All standard Markdown elements are preserved: headings (H1-H6) with correct size hierarchy, bold, italic, inline code, fenced code blocks with syntax highlighting, bullet and numbered lists, tables, images, blockquotes, links, horizontal rules, and strikethrough. GitHub Flavored Markdown (GFM) including task lists is also supported."],
  ["Q3: How do I convert Markdown to PDF using Pandoc?", "Install Pandoc and a LaTeX distribution such as TeX Live on Mac/Linux or MiKTeX on Windows, then run pandoc input.md -o output.pdf. For styled output with custom fonts, add --pdf-engine=xelatex --variable mainfont='Arial'. For a browser-based alternative that requires no installation, use RepetiGo."],
  ["Q4: How do I convert Markdown to PDF in Python?", "Two common approaches are md2pdf and markdown plus WeasyPrint. With md2pdf, install it and convert the input file to an output PDF. With WeasyPrint, parse Markdown to HTML with the markdown library, then render that HTML to PDF. For quick conversions without a Python environment, use RepetiGo's browser tool."],
  ["Q5: How do I convert a GitHub README to PDF?", "Copy the raw content of your README.md file from GitHub, paste it into RepetiGo's Markdown editor, and download the PDF. Alternatively, clone the repository and upload the README.md file directly. RepetiGo supports GitHub Flavored Markdown including GFM tables and task lists."],
  ["Q6: How do I convert PDF to Markdown?", "Use the same page and toggle to PDF to Markdown conversion direction. Upload your PDF and RepetiGo extracts the text content as a structured Markdown file (.md) with headings, lists, and code blocks detected from the PDF's formatting. Download the .md file and edit it in any Markdown editor."],
  ["Q7: Does the PDF preserve my code blocks with syntax highlighting?", "Yes. Fenced code blocks are converted to formatted code blocks in the PDF with a monospace font and syntax-aware background shading. Specifying the language after the opening fence, such as python or javascript, enables language-specific formatting in the output."],
  ["Q8: Can I convert a Markdown file with images to PDF?", "Yes. For locally referenced images, include the image file when uploading or upload the .md file and images as a zip archive. For images with external URLs, they are fetched and embedded at conversion time. All images are embedded directly in the PDF output file."],
  ["Q9: How do I convert R Markdown to PDF?", "Standard R Markdown files with YAML header and R code chunks should be rendered in RStudio with rmarkdown::render() first. This executes the R code and produces a standard Markdown output. Upload that rendered Markdown to RepetiGo for PDF conversion. Alternatively, install Pandoc and render the Rmd to PDF directly."],
  ["Q10: Is it safe to upload a confidential .md file to convert online?", "With RepetiGo, yes. Your file uploads over TLS encryption, processes in an isolated temporary session, and is permanently deleted within 60 minutes. The conversion engine renders your Markdown content to PDF without reading, indexing, or storing it. No sign-up means we hold no information about you or your files."],
];

export default function MarkdownToPdfPage() {
  return (
    <DashboardShell activePath="/pdf-tools">
      <div className="dashboard generic-pdf-tool-page">
        <ConversionTool
          slug="markdown-to-pdf"
          uploadTitle="Convert Markdown to PDF Free Online. Paste or Upload - Get a Clean PDF Instantly. No Pandoc."
          uploadDescription="Paste your Markdown content or upload a .md file, then download a clean, properly formatted PDF in seconds. No installation, no command line, no account."
          uploadHeadingLevel="h1"
        >
          <JsonLd />
          <article className="tool-seo-content" id="markdown-to-pdf-guide">
            <HeroIntro />
            <section><h2>What Is Markdown and Why Convert It to PDF?</h2><MarkdownIntro /></section>
            <section><h2>What Markdown Elements Are Supported in the PDF?</h2><p>When you convert Markdown to PDF with RepetiGo, the following elements are preserved and formatted correctly in the output PDF:</p><SeoTable headers={["Markdown Element", "Markdown Syntax", "How It Appears in the PDF"]} rows={markdownElements} /><Callout>For best results with code-heavy Markdown files, specify the language after the opening fence, such as python, javascript, or bash. This enables syntax-aware formatting in the PDF output.</Callout></section>
            <HowToSection />
            <UseCases />
            <ReverseDirection />
            <DeveloperSection />
            <NoInstallSection />
            <IndiaSection />
            <SafetySection />
            <FaqSection />
            <RelatedTools />
            <section className="tool-seo-cta"><h2>Convert Markdown to PDF Free Now</h2><p>No Pandoc. No LaTeX. No setup. Paste and download. Auto-deleted in 60 minutes.</p><Link href="/pdf-tools/markdown-to-pdf">Convert Markdown to PDF Free Now</Link></section>
          </article>
        </ConversionTool>
      </div>
    </DashboardShell>
  );
}

function HeroIntro() {
  return <section className="tool-seo-hero"><p>You wrote your documentation, README, report, or notes in Markdown. Now you need a PDF - for sharing, printing, submitting, or archiving. The usual options mean setting up Pandoc on the command line, installing a VSCode extension, or running a Python script. All of that takes time you don't have right now.</p><p>RepetiGo's free Markdown to PDF converter works in your browser - paste your Markdown content or upload a .md file, and download a clean, properly formatted PDF in seconds. No installation, no command line, no account.</p><div className="tool-seo-badges"><span>✓ Paste Markdown or upload .md file</span><span>✓ Headings, code blocks, tables, images preserved</span><span>✓ Also: convert PDF to Markdown</span><span>✓ No sign-up</span><span>✓ Files deleted in 60 minutes</span></div><div className="tool-seo-cta-stack"><Link className="tool-seo-inline-cta" href="/pdf-tools/markdown-to-pdf">Convert Markdown to PDF Free <span>→</span></Link></div></section>;
}

function MarkdownIntro() {
  return <><p>Markdown is a lightweight text formatting language that uses plain text symbols to define structure:</p><ul className="tool-seo-list"><li># for headings, ## for sub-headings</li><li>**bold**, *italic*, `inline code`</li><li>- or * for bullet lists, 1. 2. 3. for numbered lists</li><li>| col | col | for tables</li><li>``` ``` for code blocks</li><li>![alt](image.png) for images</li></ul><p>Markdown is used everywhere - GitHub READMEs, technical documentation, Jekyll and Hugo blogs, note-taking apps (Obsidian, Notion), academic writing (Pandoc), and developer documentation sites (Docusaurus, MkDocs). It is human-readable as plain text and renders beautifully when converted.</p><p>The problem: Markdown files (.md) are not universally readable. A client, employer, university, or government office cannot open a .md file in Word or a PDF reader. Converting Markdown to PDF gives you a professionally formatted document that anyone can open, print, and read without any special software.</p><Callout>You do not need to understand Markdown to use this tool. If someone has sent you a .md file, or you exported one from a note-taking app, just upload it - RepetiGo converts it to a clean PDF automatically.</Callout></>;
}

function HowToSection() {
  return <section><h2>How to Convert Markdown to PDF Free Online.</h2><p>Three steps. Under a minute for most documents.</p><h3>Step 1 - Paste Your Markdown or Upload a .md File</h3><p>Either paste your Markdown content directly into the text editor, or click Upload to select a .md file from your device. You can also drag a .md file directly into the upload area. Accepts any standard Markdown - CommonMark, GitHub Flavored Markdown (GFM), and standard extensions.</p><h3>Step 2 - Preview and Adjust</h3><p>A live preview shows how your Markdown will render in the PDF. Check that headings, code blocks, tables, and images appear as expected. Adjust the page settings if needed:</p><ul className="tool-seo-list"><li>Page size: A4, Letter, or custom</li><li>Margins: Standard, narrow, or wide</li><li>Font size and font family</li><li>Code block theme: light or dark syntax highlighting</li><li>Include or exclude a table of contents generated from your headings</li></ul><h3>Step 3 - Download Your PDF</h3><p>Click Convert to PDF and Download. Your formatted PDF saves to your device - all Markdown elements rendered correctly, headings structured, code blocks formatted, tables drawn, images embedded. Your uploaded file is deleted from our servers within 60 minutes.</p><Callout>Converting a GitHub README.md? Upload the file directly from your repository clone, or paste the raw content. RepetiGo handles GitHub Flavored Markdown (GFM) including task lists, tables, and fenced code blocks.</Callout><div className="tool-seo-cta-stack"><Link className="tool-seo-inline-cta" href="/pdf-tools/markdown-to-pdf">Convert Markdown to PDF Now - Free <span>→</span></Link></div></section>;
}

function UseCases() {
  const items = ["GitHub README to PDF: Your repository README is a .md file. Convert it to PDF to share project documentation with non-technical stakeholders, for a project report submission, or to archive a version of your documentation.", "Technical documentation export: Documentation written in Markdown for sites like Docusaurus, MkDocs, or Jekyll needs to be distributed as a PDF for offline reading, compliance archiving, or client handover.", "Markdown resume or CV: Many developers write their resume in Markdown for version control and easy editing. Convert to PDF for job application submissions - clean, consistent formatting without wrestling with Word's layout engine.", "Academic and research notes: Research notes, literature reviews, and academic writing in Markdown converted to PDF for submission, sharing with supervisors, or personal archiving.", "Meeting notes and reports: Quick notes written in Markdown in tools like Obsidian, Bear, or Notion exported to PDF for distribution to team members or clients who cannot access the original note-taking app.", "Student project reports: University assignments and project reports written in Markdown converted to PDF for submission via portal or email. Consistent PDF formatting regardless of the student's device or operating system."];
  return <section><h2>Common Use Cases - When You Need Markdown as a PDF.</h2><ul className="tool-seo-list">{items.map((item) => <li key={item}>{item}</li>)}</ul></section>;
}

function ReverseDirection() {
  return <section><h2>Convert PDF to Markdown - The Reverse Direction.</h2><p>Need to go the other way? Upload a PDF and extract its content as Markdown - structured headings, paragraphs, and formatted text in a clean .md file you can edit, version-control, or republish.</p><p>RepetiGo's PDF to Markdown converter extracts the text layer of your PDF and formats it as GitHub Flavored Markdown. Headings are mapped from the PDF's font size hierarchy, lists are detected from indentation patterns, and code blocks are identified from monospace font sections.</p><ul className="tool-seo-list"><li>Upload any PDF - exported from Word, LaTeX, a website, or a scanned document. OCR is required for scans.</li><li>Download a .md file with the extracted content structured as Markdown.</li><li>Edit in any Markdown editor - VSCode, Obsidian, Typora, or a plain text editor.</li><li>Re-convert back to PDF once edited using the Markdown to PDF direction.</li></ul><Callout>PDF to Markdown is particularly useful for extracting content from old PDFs for documentation sites, converting published reports into editable Markdown for updating, and migrating content from PDF archives into modern Markdown-based content systems.</Callout><div className="tool-seo-cta-stack"><Link className="tool-seo-inline-cta" href="/pdf-tools/pdf-to-markdown">Convert PDF to Markdown - Free <span>→</span></Link></div><p>Use the same page - toggle to PDF to Markdown direction.</p></section>;
}

function DeveloperSection() {
  return <section><h2>For Developers: Convert Markdown to PDF with Common Tools.</h2><p>If you are a developer, there are several established ways to convert Markdown to PDF programmatically. Here is how the main options compare - and when the RepetiGo browser tool is the faster choice:</p><SeoTable headers={["Method", "How It Works", "Best For", "Setup Required"]} rows={developerMethods} /><h3>Pandoc: The CLI Standard</h3><p>Pandoc is the most powerful free tool for Markdown to PDF conversion. The basic command is straightforward:</p><pre><code>pandoc input.md -o output.pdf</code></pre><p>For better styling and font control, use the --pdf-engine option and a custom CSS or LaTeX template:</p><pre><code>pandoc input.md -o output.pdf --pdf-engine=xelatex --variable mainfont='Arial'</code></pre><p>Pandoc requires a LaTeX installation (TeX Live on Linux/Mac, MiKTeX on Windows) for PDF output - the download can be 1-4GB. For quick conversions without the installation overhead, RepetiGo runs the same conversion pipeline in the browser.</p><h3>Python Libraries</h3><p>Two common Python approaches for Markdown to PDF in Python:</p><pre><code>{`# md2pdf: simple one-liner
pip install md2pdf
md2pdf input.md output.pdf

# WeasyPrint: full control via HTML intermediate
pip install markdown weasyprint
import markdown, weasyprint
html = markdown.markdown(open('input.md').read())
weasyprint.HTML(string=html).write_pdf('output.pdf')`}</code></pre><h3>VSCode Extension</h3><p>Install the 'markdown-pdf' extension in VSCode (by yzane). Open your .md file, press Ctrl+Shift+P, search 'Markdown PDF: Export (pdf)'. The PDF is saved in the same folder as your .md file. Configuration is via settings.json for custom headers, footers, and CSS styles.</p><Callout>For automated pipelines and batch processing, Pandoc and Python libraries are the right tools. For one-off quick conversions without any setup, RepetiGo is faster - paste your Markdown and download the PDF in under 30 seconds.</Callout></section>;
}

function NoInstallSection() {
  return <section><h2>Markdown to PDF Without Installing Anything.</h2><p>The fastest path from Markdown to PDF requires nothing on your machine. No Pandoc, no LaTeX, no Python environment, no VSCode, no npm packages.</p><ul className="tool-seo-list"><li>Pandoc: Excellent tool, but requires installing Pandoc plus a full LaTeX distribution (1-4GB). Not practical for quick one-off conversions or on shared/managed machines.</li><li>VSCode extension: Works great if you already use VSCode, but requires VSCode installed and the extension configured. Cannot be used from a browser or by someone without VSCode.</li><li>Python library: Requires Python environment, pip, and often platform-specific rendering libraries like WeasyPrint's Cairo dependencies.</li><li>RepetiGo: Open a browser tab. Paste your Markdown or drag in a .md file. Download your PDF. Nothing to install, configure, or maintain.</li></ul><p>For developers who need a quick conversion without pulling in a local toolchain, or for non-technical users who just received a .md file and need to share a PDF - RepetiGo is the zero-friction path.</p></section>;
}

function IndiaSection() {
  return <section><h2>Markdown to PDF for Free in India.</h2><p>India's growing developer and technical writing community generates significant demand for Markdown to PDF conversion - particularly around GitHub documentation, student project submissions, and technical content exports:</p><ul className="tool-seo-list"><li>GitHub README exports: Indian open-source contributors, hackathon participants, and engineering students frequently need to submit their GitHub README.md as a PDF - for project evaluations, internship applications, and hackathon documentation submissions.</li><li>Technical documentation: Engineering teams at Indian startups, product companies, and IT services firms increasingly write documentation in Markdown and need PDF exports for client handover, audit submissions, and internal knowledge base distribution.</li><li>Student project reports: Computer science and engineering students at IITs, NITs, and other institutions writing project reports in Markdown need clean PDF outputs for faculty submission, without the complexity of setting up Pandoc on university lab systems.</li><li>Resume and portfolio: Developers writing their resume in Markdown for version control and applying to Indian companies that require PDF resumes. Converting Markdown to PDF gives consistent, professional formatting across devices.</li><li>Data science and research reports: Indian data science community members using R Markdown or Jupyter Notebook-style documentation needing PDF export for publication, conference submission, or stakeholder reporting.</li></ul><p>With RepetiGo you can convert Markdown to PDF free online in India - paste your .md content or upload the file, customise the layout, and download a publication-ready PDF in seconds. No Pandoc installation, no LaTeX dependency, no account.</p><Callout>For IIT/NIT/university project report submissions that specify PDF format: write your report in Markdown, convert it here, and download a clean, consistently formatted PDF that works across all university submission portals.</Callout></section>;
}

function SafetySection() {
  return <section><h2>Your Files Are Safe. Always.</h2><p>Markdown files often contain code, proprietary documentation, unreleased product specifications, or personal project data. Here is what happens:</p><SeoTable headers={["Protection Layer", "What It Means in Practice"]} rows={safetyRows} /><div className="tool-seo-cta-stack"><Link className="tool-seo-inline-cta" href="/privacy-policy">Privacy Policy <span>→</span></Link><Link className="tool-seo-inline-cta" href="/privacy-policy">Auto-Delete <span>→</span></Link></div></section>;
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
      description: "Free online Markdown to PDF converter with no Pandoc, no CLI, and no setup.",
      url: pageUrl,
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to Convert Markdown to PDF Free Online",
      step: [
        { "@type": "HowToStep", name: "Paste or upload Markdown", text: "Paste your Markdown content or upload a .md file." },
        { "@type": "HowToStep", name: "Preview and adjust", text: "Preview headings, code blocks, tables, images, and PDF settings." },
        { "@type": "HowToStep", name: "Download PDF", text: "Convert and download your formatted PDF." },
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
