import type { Metadata } from "next";
import Link from "next/link";
import { LandingNavbar } from "../../LandingNavbar";
import { PublicFooter } from "../../PublicFooter";
import { ogStaticImage } from "@/lib/og";

// Hindi guide for the AI Passport Photo Maker (/passport-photo stays English).
// Facts match the tool: attire list (lib/passport-attire.ts), print sheet sizes
// (passport-photo/printSheet.ts), shop login + per-photo charge from service
// credits (no amount here - prices are dynamic, see /pricing), 24-hour deletion.

const pageUrl = "https://repetigo.com/hi/passport-photo";
const englishUrl = "https://repetigo.com/passport-photo";
const title = "पासपोर्ट साइज़ फोटो ऑनलाइन बनाएं - AI से | RepetiGo";
const description =
  "सेल्फी से पासपोर्ट साइज़ फोटो बनाएं - AI सफेद बैकग्राउंड लगाता है, फ्रेम ठीक करता है और ब्लेज़र या बुर्का पहनाता है। A4 या 4x6 पर प्रिंट करें।";
const shareImage = ogStaticImage("passport-photo.jpg", "सेल्फी से सफेद बैकग्राउंड वाली पासपोर्ट फोटो");

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
  ["फोटो अपलोड करें", "फोन या कैमरे की कोई साफ, सामने से ली गई फोटो। आसपास ज़्यादा जगह हो तो पहले क्रॉप कर लें।"],
  ["कपड़े चुनें", "Same as Photo, Blazer & Tie (पुरुष), Blazer & Tie (महिला) या बुर्का।"],
  ["पैकेज चुनें", "शीट पर कितनी फोटो चाहिए, जैसे 6 फोटो।"],
  ["Generate दबाएं", "AI बैकग्राउंड हटाकर सफेद लगाता है और चेहरा-कंधे फ्रेम करता है।"],
  ["देखें, एडिट करें और प्रिंट करें", "ज़रूरत हो तो फोटो एडिटर में ठीक करें, फिर A4 या 4×6 पर प्रिंट करें।"],
] as const;

const attires = [
  ["Same as Photo", "फोटो वाले कपड़े ही रहते हैं।"],
  ["Blazer & Tie (पुरुष / महिला)", "गहरे रंग का फॉर्मल ब्लेज़र, सफेद शर्ट और टाई।"],
  ["बुर्का", "काला बुर्का और हिजाब, पूरा चेहरा साफ दिखता रहता है।"],
] as const;

const faqs = [
  ["क्या मैं अपने ही कपड़े रख सकता हूँ?", "हाँ। Same as Photo चुनें - सिर्फ बैकग्राउंड और फ्रेमिंग ठीक होगी।"],
  ["बैकग्राउंड सफेद होगा?", "हाँ, AI बैकग्राउंड को सादा सफेद कर देता है।"],
  ["किस पेपर पर प्रिंट कर सकते हैं?", "A4 और 4×6 इंच फोटो पेपर। डिफ़ॉल्ट फोटो साइज़ 1.2 × 1.6 इंच है, अपना साइज़ भी डाल सकते हैं।"],
  ["पूरे परिवार की एक फोटो बन सकती है?", "हाँ - Family Passport Photo Maker 2 से 6 लोगों की अलग-अलग फोटो से एक ग्रुप फोटो बनाता है।"],
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

export default function HindiPassportPhotoPage() {
  return (
    <div className="ai-landing-shell" lang="hi">
      <LandingNavbar />
      <main className="tool-seo-page-wrap">
        <article className="tool-seo-content">
          <section className="tool-seo-hero">
            <p className="tool-seo-kicker">AI पासपोर्ट फोटो - सफेद बैकग्राउंड - सीधा प्रिंट</p>
            <h1>सेल्फी से पासपोर्ट साइज़ फोटो बनाएं</h1>
            <p>
              फोटो स्टूडियो जाने की ज़रूरत नहीं। RepetiGo का <strong>Passport Photo Maker</strong> साइबर कैफे, प्रिंट शॉप और
              घर से फोटो बनाने वालों के लिए है। एक साफ फोटो अपलोड करें, कपड़े चुनें - AI बैकग्राउंड को सादा सफेद कर देता है और
              चेहरे को पासपोर्ट फोटो के हिसाब से फ्रेम करता है। फिर उसी स्क्रीन से A4 या 4×6 पेपर पर पूरी शीट प्रिंट करें।
            </p>
            <div className="tool-seo-cta-stack">
              <Link className="tool-seo-inline-cta" href="/passport-photo">
                पासपोर्ट फोटो बनाएं →
              </Link>
            </div>
          </section>

          <section>
            <h2>5 स्टेप</h2>
            <ol className="tool-seo-list">
              {steps.map(([heading, text]) => (
                <li key={heading}>
                  <strong>{heading}</strong> - {text}
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2>कपड़ों के विकल्प</h2>
            <ul className="tool-seo-list">
              {attires.map(([heading, text]) => (
                <li key={heading}>
                  <strong>{heading}</strong> - {text}
                </li>
              ))}
            </ul>
            <p className="tool-seo-callout">💡 AI सिर्फ कपड़े और बैकग्राउंड बदलता है - चेहरा और भाव वैसे ही रहते हैं।</p>
          </section>

          <section>
            <h2>अच्छी फोटो के लिए</h2>
            <p>
              <strong>करें:</strong> चेहरा सीधा कैमरे की ओर, दोनों कान दिखें, चेहरे पर सामान्य भाव और मुँह बंद, चेहरे पर बराबर
              रोशनी।
            </p>
            <p>
              <strong>न करें:</strong> धुंधली या कम क्वालिटी फोटो, चेहरे पर परछाईं, तिरछा या साइड पोज़।
            </p>
          </section>

          <section>
            <h2>A4 या 4×6 पर प्रिंट</h2>
            <p>
              हर फोटो डिफ़ॉल्ट रूप से 1.2 × 1.6 इंच की प्रिंट होती है। A4 पर एक लाइन में 6 और 4×6 पर 3 फोटो आती हैं। अपना
              साइज़ भी डाल सकते हैं। अलग-अलग लोगों की फोटो एक शीट पर चाहिए तो{" "}
              <Link href="/hi/photo-print-sheet">Photo Print Sheet Maker</Link> इस्तेमाल करें।
            </p>
          </section>

          <section>
            <h2>दुकानदारों के लिए</h2>
            <ul className="tool-seo-list">
              <li>
                हर पैकेज के लिए <strong>ग्राहक का रेट आप खुद तय करते हैं</strong> (Pricing Settings में)।
              </li>
              <li>
                हर AI फोटो पर आपके RepetiGo सर्विस क्रेडिट से एक छोटा चार्ज लगता है - कोई मासिक फीस नहीं। मौजूदा रेट के लिए{" "}
                <Link href="/pricing">Pricing पेज</Link> देखें।
              </li>
              <li>AI पासपोर्ट फोटो बनाने के लिए शॉप अकाउंट से लॉगिन ज़रूरी है।</li>
            </ul>
          </section>

          <section>
            <h2>प्राइवेसी</h2>
            <p className="tool-seo-callout">
              🔒 अपलोड की गई और बनाई गई पासपोर्ट फोटो <strong>24 घंटे के अंदर हमारे सर्वर से अपने-आप डिलीट</strong> हो जाती हैं।
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
            <p>
              परिवार की ग्रुप फोटो के लिए: <Link href="/family-passport-photo">Family Passport Photo Maker</Link>
            </p>
          </section>

          <section className="tool-seo-cta">
            <h2>अभी पासपोर्ट फोटो बनाएं</h2>
            <p>फोटो अपलोड करें, कपड़े चुनें और प्रिंट करें - स्टूडियो जाने की ज़रूरत नहीं।</p>
            <Link className="tool-seo-inline-cta" href="/passport-photo">
              पासपोर्ट फोटो बनाएं →
            </Link>
            <p>
              <Link href="/passport-photo" hrefLang="en">
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
