import Link from "next/link";

// Crawlable guide shown below the UPI QR tool. Claims match UpiQrGeneratorClient:
// fixed / any-amount QR, UPI ID check, 50-character note, auto order reference,
// branded card download, share, counter standee print; saving accounts and QRs
// needs a login, everything else is free. The QR is a plain upi://pay link, so
// money goes straight to the UPI ID on it.

const steps = [
  ["Enter your UPI ID and shop name", "For example yourshop@okaxis. The tool checks that the UPI ID looks valid before making the QR."],
  ["Choose the amount", "Fixed amount for a set price (the payer's app opens with the amount filled in), or Any amount so the customer types what they owe."],
  ["Add a note (optional)", "A short note of up to 50 characters, like \"Xerox\" or \"Passport photo\", shows in the payer's app."],
  ["Download, share or print", "Get a ready-to-use QR card, share it straight from your phone, or print a standee for your counter."],
] as const;

const faqs = [
  ["Is it free?", "Yes. Making, downloading, sharing and printing UPI QR codes is free. You only need to sign in if you want to save accounts or QRs for later."],
  ["Which apps can scan this QR?", "Any UPI app - Google Pay, PhonePe, Paytm, BHIM, Amazon Pay and bank apps."],
  ["Does RepetiGo take any commission on payments?", "No. The money goes directly to the UPI ID on the QR; RepetiGo is not part of the payment."],
  ["Can I make a QR with a fixed amount?", "Yes. Choose Fixed amount and enter the price - the payer's app opens with that amount filled in."],
  ["Can I use one QR for all customers?", "Yes. Choose Any amount and print it as a counter standee; each customer enters their own amount."],
] as const;

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(([question, answer]) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
};

export default function UpiQrSeoContent() {
  return (
    <section className="tool-seo-content" aria-label="About the UPI QR code generator">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />

      <h2>Make a UPI Payment QR for Your Shop in Seconds</h2>
      <p>
        RepetiGo&apos;s UPI QR code generator turns your UPI ID into a scannable payment QR that customers can pay with
        any UPI app - Google Pay, PhonePe, Paytm, BHIM or their bank&apos;s app. Add your shop name, choose a fixed amount
        or let customers enter any amount, then download it, share it on WhatsApp or print it as a counter standee. It is
        free to use.
      </p>

      <h2>How It Works - 4 Steps</h2>
      <ol className="tool-seo-list">
        {steps.map(([title, text]) => (
          <li key={title}>
            <strong>{title}</strong> - {text}
          </li>
        ))}
      </ol>

      <h2>Fixed Amount or Any Amount?</h2>
      <ul className="tool-seo-list">
        <li>
          <strong>Fixed amount</strong> - best for a single bill or a set-price service. The customer scans and only has to
          confirm.
        </li>
        <li>
          <strong>Any amount</strong> - best for a permanent counter QR. One QR works for every customer and every bill.
        </li>
      </ul>

      <h2>A Clean QR Card, Ready to Share</h2>
      <p>
        The downloaded image is a branded card, not just a bare QR: it shows your shop name, the QR code, your UPI ID and
        the amount (if fixed), so customers can see who they are paying before they scan. Each QR also carries its own
        order reference, which helps you match payments later.
      </p>

      <h2>Print a Counter Standee</h2>
      <p>
        Print the QR as a standee and keep it on your counter or wall. Customers scan, pay and show you the payment screen -
        no cash, no change problems.
      </p>

      <h2>Save Your Accounts (Free Account)</h2>
      <p>
        If you use more than one UPI ID - for example a shop account and a personal one - sign in to save them and switch
        with one click. Signed-in users can also save QRs they make and reopen them later.
      </p>

      <h2>Your Money Goes Straight to You</h2>
      <p className="tool-seo-callout">
        🔒 The QR only opens the customer&apos;s own UPI app with your UPI ID filled in. The payment goes directly from the
        customer&apos;s bank to yours - RepetiGo never receives, holds or touches the money.
      </p>

      <h2>UPI QR FAQs</h2>
      {faqs.map(([question, answer]) => (
        <div key={question}>
          <h3>{question}</h3>
          <p>{answer}</p>
        </div>
      ))}

      <h2>More Tools for Your Shop</h2>
      <ul className="tool-seo-list">
        <li>
          <Link href="/photo-print-sheet">Photo Print Sheet Maker</Link>
        </li>
        <li>
          <Link href="/passport-photo">Passport Photo Maker</Link>
        </li>
        <li>
          <Link href="/id-card-print">ID Card Print</Link>
        </li>
        <li>
          <Link href="/pdf-tools">PDF Tools</Link>
        </li>
      </ul>
    </section>
  );
}
