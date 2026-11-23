import Link from "next/link";
import { shopChargeSentence, type ToolCharge } from "@/lib/toolCharge";

// Crawlable guide shown below the family photo tool. Claims match the tool:
// 2-6 people, one JPG/PNG per person (FamilyPassportPhotoClient), no attire
// picker and a plain light studio background (lib/family-photo-prompt.ts),
// and Print / Download opening the Photo Print Sheet Maker. The shop charge is
// the live "family_passport_photo" price passed in by page.tsx.

const steps = [
  ["Upload one photo per person", "JPG or PNG, 2 to 6 people. You can drop several photos at once and they fill the empty slots."],
  ["Choose a package", "How many prints of the family photo you need."],
  ["Generate the family photo", "The AI places everyone together as a natural group, front and back row for bigger families, all facing the camera. This can take up to a minute."],
  ["Print or download", "Tap Print / Download to open the photo in the Photo Print Sheet Maker, choose your paper and print."],
] as const;

const firstFaq = ["How many people can be in one family photo?", "2 to 6 people. Upload one photo for each person."] as const;

const otherFaqs = [
  ["Can I choose the clothes?", "No. There is no attire picker - everyone keeps the clothes from their own photo. For a formal single passport photo with a blazer or burqa, use the Passport Photo Maker."],
  ["What kind of background does it use?", "A plain, light, evenly lit studio background."],
  ["How do I print it?", "Tap Print / Download after the photo is ready. It opens in the Photo Print Sheet Maker, where you pick the paper size and print."],
] as const;

export default function FamilyPassportPhotoSeoContent({ charge }: { charge: ToolCharge }) {
  const chargeSentence = shopChargeSentence(charge, "family photo");
  const faqs: (readonly [string, string])[] = [
    firstFaq,
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
    <section className="tool-seo-content" aria-label="About the family passport photo maker">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />

      <h2>One Family Photo From Separate Photos</h2>
      <p>
        Getting the whole family together for a studio photo is hard - someone is always away. RepetiGo&apos;s family
        passport photo maker solves that: upload one photo of each person, and the AI combines them into a single family
        group photo with a plain, light studio background. It works for 2 to 6 people and is built for cyber cafes, print
        shops and families at home.
      </p>

      <h2>How It Works - 4 Steps</h2>
      <ol className="tool-seo-list">
        {steps.map(([title, text]) => (
          <li key={title}>
            <strong>{title}</strong> - {text}
          </li>
        ))}
      </ol>

      <h2>What the AI Keeps the Same</h2>
      <ul className="tool-seo-list">
        <li>Every uploaded person appears exactly once - no one is left out or repeated.</li>
        <li>Each person&apos;s face, skin tone and hairstyle stay as in their own photo.</li>
        <li>Everyone gets even, shadow-free studio lighting on a plain, light background.</li>
      </ul>
      <p className="tool-seo-callout">
        💡 Unlike the single passport photo tool, there is no attire picker here - everyone keeps the clothes from their
        own photo.
      </p>

      <h2>Tips for the Best Result</h2>
      <ul className="tool-seo-list">
        <li>Use a clear, front-facing photo of each person, looking straight at the camera.</li>
        <li>Neutral expression, mouth closed.</li>
        <li>Avoid blurry or low-resolution photos.</li>
        <li>Avoid photos with shadows across the face.</li>
        <li>Use a separate photo for each person - not a photo that already has several people in it.</li>
      </ul>

      <h2>For Cyber Cafes and Print Shops</h2>
      <p>
        A family photo is a quick add-on sale at the counter: collect one photo of each family member on WhatsApp or a pen
        drive, generate the group photo and print it on the spot. {chargeSentence}{" "}
        <Link href="/pricing">See current rates</Link>.
      </p>

      <h2>Family Photo FAQs</h2>
      {faqs.map(([question, answer]) => (
        <div key={question}>
          <h3>{question}</h3>
          <p>{answer}</p>
        </div>
      ))}

      <h2>More Photo Tools</h2>
      <ul className="tool-seo-list">
        <li>
          <Link href="/passport-photo">Passport Photo Maker</Link>
        </li>
        <li>
          <Link href="/photo-print-sheet">Photo Print Sheet Maker</Link>
        </li>
        <li>
          <Link href="/image-tools/background-remover">Background Remover</Link>
        </li>
        <li>
          <Link href="/image-tools/photo-editor">Photo Editor</Link>
        </li>
      </ul>
    </section>
  );
}
