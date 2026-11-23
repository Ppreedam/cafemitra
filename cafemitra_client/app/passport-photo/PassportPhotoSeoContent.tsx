import Link from "next/link";
import { shopChargeSentence, type ToolCharge } from "@/lib/toolCharge";

// Crawlable guide shown below the passport photo tool. Every claim here matches
// the tool: attire list (lib/passport-attire.ts), print sheet sizes and default
// tile (./printSheet.ts) and the good/avoid photo examples in the client.
// The shop charge is the live "passport_photo" price passed in by page.tsx.

const steps = [
  ["Upload a photo", "Any clear, front-facing photo from a phone or camera. Crop it first if there is a lot of extra space around the person."],
  ["Choose an attire", "Same as Photo, Blazer & Tie (Men), Blazer & Tie (Women) or Burqa."],
  ["Choose a package", "How many photos you want on the print sheet, for example 6 photos."],
  ["Generate", "The AI removes the background, adds a plain white one and frames the face and shoulders."],
  ["Preview, edit and print", "Fine-tune the result in the built-in photo editor if needed, then print on A4 or 4x6 paper."],
] as const;

const attires = [
  ["Same as Photo", "keeps the clothes in your photo exactly as they are."],
  ["Blazer & Tie (Men)", "a dark formal blazer, white shirt and tie."],
  ["Blazer & Tie (Women)", "the same formal blazer, white shirt and tie look, for women."],
  ["Burqa", "a black burqa and hijab, with the full face clearly visible."],
] as const;

const otherFaqs = [
  ["Can I keep my own clothes?", "Yes. Choose Same as Photo and the AI keeps your clothing unchanged - only the background and framing are fixed."],
  ["What paper sizes can I print on?", "A4 and 4x6 inch photo paper. The default photo size is 1.2 x 1.6 inches, and you can set a custom size."],
  ["Will the background be white?", "Yes. The AI replaces the background with plain white."],
  ["Can I edit the photo after it is generated?", "Yes. Open it in the built-in photo editor to adjust it before printing."],
  ["Can I make one photo of the whole family?", "Use the Family Passport Photo Maker, which puts several people into one photo."],
] as const;

export default function PassportPhotoSeoContent({ charge }: { charge: ToolCharge }) {
  const chargeSentence = shopChargeSentence(charge, "AI passport photo");
  const faqs: (readonly [string, string])[] = [
    [
      "How much does it cost?",
      `The price your customer pays is set by the shop. ${chargeSentence} Printing on your own printer is free. See the Pricing page for current rates.`,
    ],
    ...otherFaqs,
  ];
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };

  return (
    <section className="tool-seo-content" aria-label="About the passport photo maker">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />

      <h2>Turn Any Photo Into a Passport Size Photo</h2>
      <p>
        RepetiGo&apos;s passport size photo maker is built for cyber cafes, print shops and anyone who needs passport
        photos without visiting a studio. Upload a clear photo, pick an attire, and the AI replaces the background with
        plain white and frames the face to passport photo standards. Then print a full sheet on A4 or 4x6 paper from the
        same screen.
      </p>

      <h2>How It Works - 5 Steps</h2>
      <ol className="tool-seo-list">
        {steps.map(([title, text]) => (
          <li key={title}>
            <strong>{title}</strong> - {text}
          </li>
        ))}
      </ol>

      <h2>Attire Options</h2>
      <ul className="tool-seo-list">
        {attires.map(([title, text]) => (
          <li key={title}>
            <strong>{title}</strong> - {text}
          </li>
        ))}
      </ul>
      <p className="tool-seo-callout">💡 The AI changes only the clothing and the background. The face and expression stay as they are in your photo.</p>

      <h2>Tips for a Photo That Works First Time</h2>
      <p>
        <strong>Do:</strong>
      </p>
      <ul className="tool-seo-list">
        <li>Face clearly visible, looking straight at the camera</li>
        <li>Both ears visible</li>
        <li>Neutral expression, mouth closed</li>
        <li>Even light on the face</li>
      </ul>
      <p>
        <strong>Avoid:</strong>
      </p>
      <ul className="tool-seo-list">
        <li>Blurry or low-resolution photos</li>
        <li>Shadows across the face</li>
        <li>Angled or side poses</li>
      </ul>

      <h2>Print a Full Sheet on A4 or 4x6 Paper</h2>
      <p>
        Each photo prints at 1.2 x 1.6 inches by default. A4 paper holds 6 photos per row and 4x6 photo paper holds 3 per
        row. You can also set a custom photo size, and the sheet re-fits the photos automatically. Need photos of
        different people on one sheet? Use the <Link href="/photo-print-sheet">Photo Print Sheet Maker</Link>.
      </p>

      <h2>For Cyber Cafes and Print Shops</h2>
      <p>
        Set your own customer price for each package in Pricing Settings, so the price on screen matches what you charge
        at the counter. {chargeSentence} Printing on your own printer is free.{" "}
        <Link href="/pricing">See current rates</Link>.
      </p>

      <h2>Passport Photo FAQs</h2>
      {faqs.map(([question, answer]) => (
        <div key={question}>
          <h3>{question}</h3>
          <p>{answer}</p>
        </div>
      ))}

      <h2>More Photo Tools</h2>
      <ul className="tool-seo-list">
        <li>
          <Link href="/family-passport-photo">Family Passport Photo Maker</Link>
        </li>
        <li>
          <Link href="/photo-print-sheet">Photo Print Sheet Maker</Link>
        </li>
        <li>
          <Link href="/image-tools/background-remover">Background Remover</Link>
        </li>
        <li>
          <Link href="/id-card-print">ID Card Print</Link>
        </li>
        <li>
          <Link href="/tools/photo/passport-photo">Full passport photo guide</Link>
        </li>
      </ul>
    </section>
  );
}
