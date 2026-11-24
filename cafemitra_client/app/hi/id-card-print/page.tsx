import type { Metadata } from "next";
import Link from "next/link";
import { LandingNavbar } from "../../LandingNavbar";
import { PublicFooter } from "../../PublicFooter";
import { ogStaticImage } from "@/lib/og";

// Hindi guide for ID Card Print (/id-card-print stays English). Facts match the
// tool: CR80 85.6 x 53.98 mm, front/back, ratio-locked crop, rotate,
// brightness/contrast/saturation, batch cards, colour/B&W, Print A4 Sheet;
// printing needs a login; the tool is free (wallet config).

const pageUrl = "https://repetigo.com/hi/id-card-print";
const englishUrl = "https://repetigo.com/id-card-print";
const title = "आधार और पैन कार्ड सही साइज़ में प्रिंट करें | RepetiGo";
const description =
  "आधार, पैन, वोटर ID और ड्राइविंग लाइसेंस का साइज़ 85.6 × 54 mm है। आगे-पीछे दोनों तरफ, असली कार्ड साइज़ में A4 पर प्रिंट करें - बिना खिंचाव के।";
const shareImage = ogStaticImage("id-card-print.jpg", "A4 शीट पर असली साइज़ में आगे-पीछे प्रिंट किए गए ID कार्ड");

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: pageUrl,
    languages: { "hi-IN": pageUrl, "en-IN": englishUrl },
  },
  openGraph: { images: [shareImage], title, description, type: "website", url: pageUrl, locale: "hi_IN" },
  twitter: { images: [shareImage], card: "summary_large_image", title, description },
  robots: { index: true, follow: true },
};

const steps = [
  ["कार्ड के आगे की फोटो अपलोड करें", "JPG या PNG - फोन फोटो, DigiLocker स्क्रीनशॉट या स्कैन।"],
  ["पीछे की फोटो अपलोड करें", "अगर उस पर काम की जानकारी है (आधार का पता और QR, वोटर ID की जानकारी)।"],
  ["फोटो ठीक करें", "क्रॉप बॉक्स असली कार्ड के आकार में लॉक रहता है, ज़रूरत हो तो 90° घुमाएं, और ब्राइटनेस, कॉन्ट्रास्ट, सैचुरेशन ठीक करें।"],
  ["और कार्ड जोड़ें", "हर कार्ड के आगे-पीछे अलग से।"],
  ["कलर या ब्लैक एंड व्हाइट चुनें", "और Print A4 Sheet दबाएं। हर कार्ड 85.6 × 53.98 mm में, आगे-पीछे साथ-साथ।"],
] as const;

const faqs = [
  ["आधार कार्ड प्रिंट का साइज़ क्या है?", "85.6 × 53.98 mm - क्रेडिट कार्ड वाला स्टैंडर्ड साइज़।"],
  ["क्या पैन और आधार का साइज़ एक है?", "हाँ, पैन, आधार, वोटर ID और ड्राइविंग लाइसेंस - सबका साइज़ 85.6 × 53.98 mm है।"],
  ["प्रिंट किया कार्ड छोटा क्यों आता है?", "प्रिंट डायलॉग में \"Fit to page\" चुना होगा। उसे 100% या \"Actual size\" करें।"],
  ["आगे और पीछे एक साथ प्रिंट हो सकता है?", "हाँ - दोनों एक ही शीट पर साथ-साथ प्रिंट होते हैं।"],
] as const;

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  inLanguage: "hi-IN",
  mainEntity: faqs.map(([question, answer]) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
};

export default function HindiIdCardPrintPage() {
  return (
    <div className="ai-landing-shell" lang="hi">
      <LandingNavbar />
      <main className="tool-seo-page-wrap">
        <article className="tool-seo-content">
          <section className="tool-seo-hero">
            <p className="tool-seo-kicker">आगे-पीछे - असली कार्ड साइज़ - A4 पर कई कार्ड</p>
            <h1>आधार और पैन कार्ड सही साइज़ में प्रिंट करें</h1>
            <p>
              फोन में आधार या पैन कार्ड की फोटो है, प्रिंट किया - और साइज़ गलत आ गया, खिंच गया या लैमिनेशन के लिए छोटा पड़ गया।
              ऐसा इसलिए होता है क्योंकि सामान्य फोटो प्रिंट को असली कार्ड का साइज़ पता नहीं होता। यहाँ सही साइज़ और आसान तरीका है।
            </p>
            <div className="tool-seo-cta-stack">
              <Link className="tool-seo-inline-cta" href="/id-card-print">
                ID कार्ड प्रिंट करें →
              </Link>
            </div>
          </section>

          <section>
            <h2>आधार / पैन कार्ड का साइज़</h2>
            <div className="tool-seo-table-wrap">
              <table>
                <tbody>
                  <tr>
                    <td>चौड़ाई</td>
                    <td>
                      <strong>85.6 mm</strong> (8.56 cm)
                    </td>
                  </tr>
                  <tr>
                    <td>ऊँचाई</td>
                    <td>
                      <strong>53.98 mm</strong> (लगभग 5.4 cm)
                    </td>
                  </tr>
                  <tr>
                    <td>स्टैंडर्ड</td>
                    <td>CR80 / ISO 7810 ID-1</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              आधार, पैन, वोटर ID, ड्राइविंग लाइसेंस, ATM कार्ड और ज़्यादातर कर्मचारी ID कार्ड - सबका यही साइज़ है। इस साइज़ का
              प्रिंट लैमिनेशन पाउच में सही बैठता है।
            </p>
          </section>

          <section>
            <h2>5 स्टेप में सही साइज़ प्रिंट</h2>
            <ol className="tool-seo-list">
              {steps.map(([heading, text]) => (
                <li key={heading}>
                  <strong>{heading}</strong> - {text}
                </li>
              ))}
            </ol>
            <p>
              प्रिंट डायलॉग में स्केल <strong>100% / Actual size</strong> रखें, &quot;Fit to page&quot; नहीं।
            </p>
            <p className="tool-seo-callout">
              📋 प्रिंट करने के लिए फ्री RepetiGo अकाउंट चाहिए (एक बार लॉगिन)। ID कार्ड प्रिंट टूल फ्री है।
            </p>
          </section>

          <section>
            <h2>टिप्स</h2>
            <ul className="tool-seo-list">
              <li>
                फोन फोटो <strong>सीधे ऊपर से</strong> लें, अच्छी रोशनी में, पूरा कार्ड दिखे।
              </li>
              <li>
                सिर्फ फॉर्म के लिए कॉपी चाहिए तो <strong>ब्लैक एंड व्हाइट</strong> चुनें - कलर इंक बचेगी।
              </li>
              <li>ज़्यादा प्रिंट से पहले पहली शीट असली कार्ड या रूलर से मिलाकर देखें।</li>
            </ul>
          </section>

          <section>
            <h2>साइबर कैफे और प्रिंट शॉप के लिए</h2>
            <p>
              कई ग्राहकों के कार्ड एक ही बैच में जोड़ें और एक A4 शीट पर साथ प्रिंट करें - फिर काटकर दे दें। RepetiGo PrintPilot
              से ग्राहक अपनी कार्ड फोटो आपकी दुकान के QR अपलोड पेज से भी भेज सकते हैं, फोन देने की ज़रूरत नहीं।
            </p>
          </section>

          <section>
            <h2>अक्सर पूछे जाने वाले सवाल</h2>
            {faqs.map(([question, answer]) => (
              <div key={question}>
                <h3>{question}</h3>
                <p>{answer}</p>
              </div>
            ))}
          </section>

          <section className="tool-seo-cta">
            <h2>अभी ID कार्ड प्रिंट करें</h2>
            <p>कार्ड की फोटो अपलोड करें, ठीक करें और असली साइज़ में प्रिंट करें।</p>
            <Link className="tool-seo-inline-cta" href="/id-card-print">
              ID कार्ड प्रिंट करें →
            </Link>
            <p>
              <Link href="/id-card-print" hrefLang="en">
                Read this page in English
              </Link>
            </p>
          </section>
        </article>
      </main>
      <PublicFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />
    </div>
  );
}
