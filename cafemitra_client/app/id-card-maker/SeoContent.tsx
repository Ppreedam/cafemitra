import { DOC_TYPES } from "./docTypes";

const routeMap: Record<string, string> = {
  "/id-card-maker": "/id-card-maker",
  ...Object.fromEntries(DOC_TYPES.map((doc) => [`/id-card-maker/${doc.key}`, `/id-card-maker/${doc.key}`])),
};

const routeLabels: Record<string, string> = {
  "/id-card-maker": "See All ID Card Types",
  ...Object.fromEntries(DOC_TYPES.map((doc) => [`/id-card-maker/${doc.key}`, `Open ${doc.label} Maker`])),
};

function mapSeoRoute(route: string) {
  const cleanRoute = route
    .trim()
    .replace(/^https?:\/\/(www\.)?repetigo\.com/i, "")
    .replace(/\/$/, "");
  return routeMap[cleanRoute] || "";
}

function getRouteLabel(href: string) {
  return routeLabels[href] || "Open Tool";
}

function renderInlineMappedLinks(text: string) {
  const parts = text.split(/(repetigo\.com\/id-card-maker\/[a-z-]*\/?|\/id-card-maker\/?[a-z-]*\/?)/g);
  return parts.map((part, index) => {
    const href = mapSeoRoute(part.startsWith("repetigo.com") ? `https://${part}` : part);
    if (!href) return part;
    return (
      <a href={href} key={`${part}-${index}`}>
        {getRouteLabel(href)}
      </a>
    );
  });
}

function CtaLine({ text }: { text: string }) {
  const content = text.slice(2, -2);
  const [, label = content, href = ""] = content.match(/^(.*?)\s*(?:→|\?)\s*(.+)$/) || [];
  const mappedHref = mapSeoRoute(href || "");
  return (
    <a className="tool-seo-inline-cta" href={mappedHref || "#"}>
      {label}
      {mappedHref ? <span>{"→"}</span> : null}
    </a>
  );
}

export function StructuredSeoCopy({ content }: { content: string }) {
  return (
    <>
      {content.split(/\r?\n(?:\r?\n)+/).map((block, index) => {
        const text = block.trim();
        if (!text) return null;

        if (text.startsWith("H1: ")) {
          return <h1 key={index}>{text.slice(4)}</h1>;
        }

        if (text.startsWith("H2: ")) {
          return <h2 key={index}>{text.slice(4)}</h2>;
        }

        if (text.startsWith("H3: ")) {
          const [heading, ...body] = text.split(/\r?\n/);
          return (
            <section className="tool-seo-copy-block" key={index}>
              <h3>{heading.slice(4)}</h3>
              {body.length ? <p>{renderInlineMappedLinks(body.join("\n"))}</p> : null}
            </section>
          );
        }

        const ctaLines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
        if (ctaLines.length && ctaLines.every((line) => line.startsWith("[ ") && line.endsWith(" ]"))) {
          return (
            <div className="tool-seo-cta-stack" key={index}>
              {ctaLines.map((line) => (
                <CtaLine key={line} text={line} />
              ))}
            </div>
          );
        }

        return (
          <p className="tool-seo-copy-paragraph" key={index}>
            {renderInlineMappedLinks(text)}
          </p>
        );
      })}
    </>
  );
}

export function JsonLd({
  toolName,
  description,
  pageUrl,
  breadcrumbLabel,
  faqSchemaQuestions,
}: {
  toolName: string;
  description: string;
  pageUrl: string;
  breadcrumbLabel: string;
  faqSchemaQuestions: readonly (readonly [string, string])[];
}) {
  const softwareApplication = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: toolName,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    description,
    url: pageUrl,
  };
  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqSchemaQuestions.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://repetigo.com/" },
      { "@type": "ListItem", position: 2, name: "ID Card Maker", item: "https://repetigo.com/id-card-maker" },
      { "@type": "ListItem", position: 3, name: breadcrumbLabel, item: pageUrl },
    ],
  };

  return (
    <>
      {[softwareApplication, faqPage, breadcrumb].map((schema) => (
        <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
    </>
  );
}
