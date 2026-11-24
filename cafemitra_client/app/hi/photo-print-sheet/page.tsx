import type { Metadata } from "next";
import Link from "next/link";
import { LandingNavbar } from "../../LandingNavbar";
import { PublicFooter } from "../../PublicFooter";
import { ogStaticImage } from "@/lib/og";

// Hindi guide for the Photo Print Sheet Maker. The tool itself stays in English
// (/photo-print-sheet); this page targets Hindi searches and links to it.
// Facts match the tool: size presets, paper sizes, Download HD 300 DPI, no login.

const pageUrl = "https://repetigo.com/hi/photo-print-sheet";
const englishUrl = "https://repetigo.com/photo-print-sheet";
const title = "एक पेज पर कई पासपोर्ट फोटो प्रिंट करें - फ्री | RepetiGo";
const description =
  "A4 या 4x6 पेपर पर अलग-अलग लोगों और साइज़ की पासपोर्ट फोटो एक साथ प्रिंट करें। लाइव प्रीव्यू, सही साइज़, कोई साइन-अप नहीं। फ्री ऑनलाइन टूल।";
const shareImage = ogStaticImage("photo-print-sheet.jpg", "एक शीट पर अलग-अलग लोगों की पासपोर्ट फोटो");

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
  ["फोटो अपलोड करें", "एक साथ कई JPG या PNG फोटो चुनें, ड्रैग-ड्रॉप करें, या क्लिपबोर्ड से पेस्ट करें। हर फोटो लिस्ट में अलग आइटम बनती है।"],
  ["हर फोटो का साइज़ और संख्या चुनें", "नीचे दिए साइज़ में से चुनें या अपना साइज़ डालें, और बताएं कि कितनी कॉपी चाहिए। फोटो टेढ़ी हो तो 90° घुमा सकते हैं।"],
  ["पेपर चुनें और प्रीव्यू देखें", "A4, 4×6, 5×7, A5, Letter या अपना साइज़। लाइव प्रीव्यू असली नाप में दिखाता है। गैप और मार्जिन स्लाइडर से काटने की जगह रखें।"],
  ["प्रिंट करें", "Print दबाएं, या Download HD से हर पेज 300 DPI PNG में सेव करें।"],
] as const;

const sizes = [
  ["पासपोर्ट साइज़ (भारत)", "3.5 × 4.5 cm"],
  ["स्टूडियो 6-पिक टाइल", "3.05 × 4.06 cm (1.2 × 1.6 inch)"],
  ["PAN / वोटर ID फॉर्म", "2.5 × 3.5 cm"],
  ["स्टैम्प साइज़", "2.0 × 2.5 cm"],
  ["US वीज़ा", "5.1 × 5.1 cm (2 × 2 inch)"],
] as const;

const faqs = [
  ["क्या यह टूल फ्री है?", "हाँ, और इसके लिए लॉगिन नहीं चाहिए। फोटो आपके ब्राउज़र में ही सेट होती हैं।"],
  ["क्या अलग-अलग लोगों की फोटो एक शीट पर आ सकती हैं?", "हाँ - हर फोटो का अपना साइज़ और संख्या होती है, इसलिए अलग लोग और अलग साइज़ एक साथ प्रिंट हो सकते हैं।"],
  ["भारत में पासपोर्ट साइज़ फोटो का साइज़ क्या है?", "आमतौर पर 3.5 × 4.5 cm।"],
  ["प्रिंट की गई फोटो छोटी या बड़ी क्यों आती है?", "प्रिंट डायलॉग में \"Fit to page\" चुना होगा। उसे 100% या \"Actual size\" करें।"],
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

export default function HindiPhotoPrintSheetPage() {
  return (
    <div className="ai-landing-shell" lang="hi">
      <LandingNavbar />
      <main className="tool-seo-page-wrap">
        <article className="tool-seo-content">
          <section className="tool-seo-hero">
            <p className="tool-seo-kicker">फ्री टूल - कोई साइन-अप नहीं</p>
            <h1>एक पेज पर कई पासपोर्ट फोटो प्रिंट करें</h1>
            <p>
              हर पासपोर्ट फोटो के लिए अलग शीट प्रिंट करना पेपर की बर्बादी है - और फोटो पेपर की एक शीट ₹15-25 की आती है।
              बेहतर तरीका है कि सारी फोटो <strong>एक ही शीट</strong> पर प्रिंट करें: एक फोटो की कई कॉपी, या अलग-अलग लोगों की
              फोटो अलग-अलग साइज़ में, काटने के लिए सही गैप के साथ।
            </p>
            <p>
              RepetiGo का फ्री <strong>Photo Print Sheet Maker</strong> यही काम करता है। यह आपके ब्राउज़र में चलता है और इसके
              लिए कोई साइन-अप नहीं चाहिए।
            </p>
            <div className="tool-seo-cta-stack">
              <Link className="tool-seo-inline-cta" href="/photo-print-sheet">
                टूल खोलें →
              </Link>
            </div>
          </section>

          <section>
            <h2>4 आसान स्टेप</h2>
            <ol className="tool-seo-list">
              {steps.map(([heading, text]) => (
                <li key={heading}>
                  <strong>{heading}</strong> - {text}
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2>फोटो के साइज़</h2>
            <div className="tool-seo-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>फोटो</th>
                    <th>साइज़</th>
                  </tr>
                </thead>
                <tbody>
                  {sizes.map(([name, size]) => (
                    <tr key={name}>
                      <td>{name}</td>
                      <td>{size}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="tool-seo-callout">📋 किसी फॉर्म या परीक्षा में अलग साइज़ माँगा हो तो उसका नोटिस ज़रूर पढ़ें।</p>
          </section>

          <section>
            <h2>सही साइज़ में प्रिंट कैसे करें</h2>
            <ul className="tool-seo-list">
              <li>टूल में और प्रिंट डायलॉग में <strong>एक ही पेपर साइज़</strong> चुनें।</li>
              <li>
                स्केल <strong>100% / Actual size</strong> रखें - &quot;Fit to page&quot; नहीं, वरना फोटो छोटी-बड़ी हो जाएगी।
              </li>
              <li>पहली शीट को रूलर से नापकर देखें, फिर बाकी प्रिंट करें।</li>
              <li>पासपोर्ट फोटो के लिए फोटो पेपर इस्तेमाल करें।</li>
            </ul>
          </section>

          <section>
            <h2>साइबर कैफे और प्रिंट शॉप के लिए</h2>
            <p>
              एक ग्राहक की फोटो जोड़ें, फिर अगले ग्राहक की - दोनों एक ही शीट पर प्रिंट हो जाएंगी। प्रीव्यू खाली जगह अपने-आप भर
              देता है, इसलिए रोज़ कम शीट लगती हैं।
            </p>
            <p>
              अगर आप ग्राहकों के लिए पासपोर्ट फोटो बनाते हैं, तो RepetiGo का <Link href="/passport-photo">Passport Photo Maker</Link>{" "}
              तैयार फोटो सीधे प्रिंट शीट में भेज देता है।
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
            <h2>अभी फ्री में प्रिंट शीट बनाएं</h2>
            <p>फोटो अपलोड करें, साइज़ चुनें और एक ही शीट पर प्रिंट करें।</p>
            <Link className="tool-seo-inline-cta" href="/photo-print-sheet">
              टूल खोलें →
            </Link>
            <p>
              <Link href="/photo-print-sheet" hrefLang="en">
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
