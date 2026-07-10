import type { Metadata } from "next";
import {
  AlertTriangle,
  BrainCircuit,
  Cookie,
  CreditCard,
  DatabaseZap,
  FileLock2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { LandingNavbar } from "../LandingNavbar";
import { PublicFooter } from "../PublicFooter";

export const metadata: Metadata = {
  title: "Privacy Policy - RepetiGo Print Shop Software",
  description:
    "RepetiGo privacy policy covering document handling, AI processing, cookies, payments, data retention, user rights, and security.",
  robots: {
    index: true,
    follow: true,
  },
};

const lastUpdated = "1 July 2025";

const sections = [
  ["introduction", "1. Introduction"],
  ["definitions", "2. Definitions"],
  ["information", "3. Information We Collect"],
  ["use", "4. How We Use Your Information"],
  ["ai-processing", "5. AI Processing"],
  ["document-security", "6. Document Security & Handling"],
  ["retention", "7. Data Retention"],
  ["cookies", "8. Cookies"],
  ["payments", "9. Payments"],
  ["third-party", "10. Third-Party Services"],
  ["transfers", "11. International Data Transfers"],
  ["rights", "12. Your Rights"],
  ["children", "13. Children's Privacy"],
  ["security", "14. Data Security"],
  ["compliance", "15. Compliance"],
  ["changes", "16. Changes to This Policy"],
  ["contact", "17. Contact Information"],
  ["faq", "18. Frequently Asked Questions"],
  ["conclusion", "19. Conclusion"],
] as const;

const definitions = [
  ["RepetiGo / we / us", "RepetiGo and its affiliated entities operating this platform."],
  ["Platform", "The RepetiGo website, software, APIs, and all services we provide."],
  ["Shop Owner / Business User", "A cyber cafe, print shop, CSC centre, or business that subscribes to RepetiGo."],
  ["End Customer", "A person who visits a shop and uses the QR-based upload service."],
  ["You / User", "Any person using the RepetiGo platform in any capacity."],
  ["Document", "Any file uploaded to the platform, including PDF, image, Office file, or other format."],
  ["Personal Data", "Any information that can identify you, directly or indirectly."],
  ["Processing", "Any operation on personal data, including collection, storage, use, deletion, and more."],
  ["Data Fiduciary", "Under India's DPDP Act, the entity that determines why and how data is processed."],
  ["Data Principal", "Under India's DPDP Act, the individual to whom the data belongs."],
  ["Retention Period", "The time we keep a specific type of data before deleting it."],
];

const informationCards = [
  {
    title: "Account Information",
    text: "For shop owners, we collect full name, email, phone, hashed password, business name, shop address, and GST number if applicable.",
  },
  {
    title: "Printer & Device Information",
    text: "We collect printer name, printer type, local network IP, print job logs, device operating system, and browser information.",
  },
  {
    title: "Uploaded Documents",
    text: "Customer uploads may include PDFs, images, Office files, file metadata, page count, file size, and file type. Content is processed only for the requested service.",
  },
  {
    title: "Payment Information",
    text: "We store transaction ID, payment status, amount, timestamp, and plan details. We never store card numbers, UPI PINs, CVV codes, or complete payment credentials.",
  },
  {
    title: "Usage & Analytics Data",
    text: "We collect pages visited, features used, time on platform, error logs, crash reports, performance metrics, browser, device type, and approximate region.",
  },
  {
    title: "Cookies & Tracking",
    text: "We use cookies and similar technologies for sessions, security, preferences, platform functionality, and optional analytics.",
  },
];

const useRows = [
  ["Create and manage your account", "Name, email, phone, password", "Contract"],
  ["Provide print and document services", "Uploaded documents, printer info", "Contract"],
  ["Process payments", "Transaction data", "Contract / Legal Obligation"],
  ["AI document processing", "Temporary uploaded files", "Consent / Contract"],
  ["Send service communications", "Email, phone number", "Contract / Legitimate Interest"],
  ["Improve and debug the platform", "Usage data, error logs", "Legitimate Interest"],
  ["Fraud prevention and security", "Usage data, device info", "Legitimate Interest / Legal Obligation"],
  ["Comply with legal obligations", "As required by law", "Legal Obligation"],
  ["Marketing with consent", "Email, phone", "Consent"],
];

const aiDoes = [
  "Image enhancement for brightness, contrast, sharpness, and cleaner print output.",
  "OCR for extracting text from scanned documents, images, and PDFs.",
  "Auto cropping, document boundary detection, and alignment correction.",
  "Page count detection, file optimisation, resizing, and compression.",
  "Passport photo preparation where enabled by the platform.",
];

const aiDoesNot = [
  "AI does not read or interpret the meaning of your document content.",
  "AI does not store document content beyond the retention period.",
  "AI does not use documents to train public AI models.",
  "AI does not build end-customer profiles from document content.",
  "AI does not share document data with third-party AI providers without disclosure.",
];

const documentCommitments = [
  ["Purpose limitation", "Documents are processed only to provide the service requested."],
  ["No profiling", "We do not analyse or profile individuals based on document content."],
  ["No advertising use", "Document content is never used for targeting, advertising, or marketing."],
  ["No unauthorised sharing", "Documents are not shared with parties outside service delivery."],
  ["No selling", "We will never sell document data under any circumstances."],
  ["Secure processing", "Processing occurs within secured infrastructure with access controls."],
  ["Automatic deletion", "Documents are deleted according to the configured retention policy."],
];

const retentionRows = [
  ["Active account data", "Duration of account + 30 days after closure", "Service delivery and account management"],
  ["Closed account data", "90 days after closure", "Fraud prevention and legal disputes"],
  ["Uploaded documents", "Deleted after print or within 24 hours", "Minimum retention and privacy protection"],
  ["Print job metadata", "30 days", "Shop owner business records"],
  ["Payment records", "7 years", "Tax and legal compliance"],
  ["Error and access logs", "90 days", "Security monitoring and debugging"],
  ["Anonymised analytics", "24 months", "Product improvement"],
  ["Backup data", "30-day rolling backups", "Disaster recovery"],
];

const cookieRows = [
  ["Essential", "Login sessions, security, and QR upload flow", "No"],
  ["Authentication", "Keeps users logged in securely", "No"],
  ["Preference", "Language, theme, and print preferences", "Yes"],
  ["Analytics", "Usage insights and product improvement", "Yes"],
  ["Marketing", "Future promotional use only with explicit consent", "Yes, consent required"],
];

const thirdPartyRows = [
  ["Cloud Infrastructure", "AWS, Google Cloud, Azure or equivalent", "Hosting, storage, and compute"],
  ["Analytics", "Google Analytics or equivalent", "Understanding platform usage"],
  ["Payment Gateway", "Razorpay, PhonePe Business, PayU, Cashfree or equivalent", "Payment processing"],
  ["Email Provider", "SendGrid, Amazon SES or equivalent", "Notifications, receipts, and OTPs"],
  ["SMS Provider", "MSG91, Twilio or equivalent", "OTPs and critical alerts"],
  ["Customer Support", "Freshdesk, Intercom or equivalent", "Support ticket management"],
  ["Error Monitoring", "Sentry, LogRocket or equivalent", "Diagnosing platform errors"],
  ["AI Services", "Disclosed when introduced", "AI-powered document processing"],
];

const rightsRows = [
  ["Access", "Request a summary of the personal data we hold about you."],
  ["Correction", "Ask us to correct inaccurate or incomplete data."],
  ["Erasure", "Request deletion of your personal data, subject to legal obligations."],
  ["Data Portability", "Request your account data in a machine-readable format."],
  ["Withdraw Consent", "Withdraw consent for consent-based processing at any time."],
  ["Grievance Redressal", "File a complaint with our privacy team or relevant authority."],
  ["Nominate a Representative", "Nominate someone to exercise rights on your behalf under the DPDP Act."],
  ["Close Account", "Close your account and have data deleted according to the retention policy."],
];

const contactRows = [
  ["Company Name", "RepetiGo Technologies Pvt. Ltd."],
  ["Registered Address", "[Full registered address, city, state, PIN code, India]"],
  ["General Email", "hello@repetigo.com"],
  ["Privacy & Data Requests", "privacy@repetigo.com"],
  ["Support Email", "support@repetigo.com"],
  ["Phone", "+91 XXXXXXXXXX"],
  ["Website", "https://repetigo.com"],
  ["Data Protection Officer", "Privacy Team"],
  ["DPO Contact", "dpo@repetigo.com"],
];

const faqItems = [
  ["Does RepetiGo see my documents?", "No. Documents are processed automatically for the requested service. Staff do not read document content during normal operations."],
  ["Are Aadhaar or PAN documents stored permanently?", "No. Uploaded documents are automatically deleted after printing or within the default retention window, typically 24 hours for unprocessed uploads."],
  ["Is my document sent to WhatsApp or email?", "No. RepetiGo is designed to avoid personal WhatsApp or email handling. Uploads go securely into the RepetiGo system."],
  ["Is my data sold to advertisers?", "Never. We do not sell personal data or document data to any third party."],
  ["Are documents used to train AI?", "No. Documents are not used to train any AI model without explicit informed consent."],
  ["Can I disable cookies?", "Essential cookies are required for the platform. Optional analytics and preference cookies can be managed through Cookie Settings."],
  ["Can I delete my account and data?", "Yes. Contact privacy@repetigo.com to request deletion. Some records may be retained where law requires it."],
  ["What happens if there is a data breach?", "We will notify affected users as required by applicable law and explain the issue, affected data, and response steps."],
  ["Is payment information safe?", "Yes. Full payment credentials are handled by certified payment partners. RepetiGo stores only transaction references and status."],
  ["Who handles privacy complaints?", "Contact the Privacy Team at privacy@repetigo.com or write to our registered address."],
];

function DataTable({ rows, headers }: { rows: string[][]; headers?: string[] }) {
  return (
    <div className="privacy-table-wrap">
      <table>
        {headers ? (
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
        ) : null}
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

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="privacy-check-list">
      {items.map((item) => (
        <li key={item}>
          <ShieldCheck size={17} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <main className="privacy-shell">
      <LandingNavbar />

      <section className="privacy-hero">
        <div className="privacy-container">
          <span className="privacy-kicker">
            <Sparkles size={14} /> Privacy Policy
          </span>
          <h1>Privacy Policy</h1>
          <p>
            How RepetiGo collects, uses, protects, and deletes data across AI-powered print workflows, secure uploads,
            document processing, payments, cookies, and support.
          </p>
          <div className="privacy-hero-meta">
            <span>Last Updated: {lastUpdated}</span>
            <span>DPDP Act 2023 Aligned</span>
            <span>No Document Profiling</span>
          </div>
        </div>
      </section>

      <section className="privacy-layout privacy-container">
        <aside className="privacy-toc">
          <strong>On this page</strong>
          <nav aria-label="Privacy policy sections">
            {sections.map(([id, title]) => (
              <a href={`#${id}`} key={id}>
                {title}
              </a>
            ))}
          </nav>
        </aside>

        <article className="privacy-content">
          <div className="privacy-alert">
            <AlertTriangle size={20} />
            <p>
              Replace bracketed business placeholders before publishing. This policy is production-ready content for
              RepetiGo, but it is not a substitute for advice from a qualified lawyer.
            </p>
          </div>

          <section className="privacy-section" id="introduction">
            <span className="privacy-section-label">Section 1</span>
            <h2>1. Introduction</h2>
            <p>
              RepetiGo is an AI-powered print shop software and secure document infrastructure platform. We help cyber
              cafes, print shops, Xerox centres, CSC centres, and businesses automate document workflows from secure
              customer uploads to AI-assisted processing and direct printer delivery.
            </p>
            <p>
              We understand that uploaded documents can be deeply personal, including Aadhaar cards, PAN cards,
              passports, medical reports, certificates, legal papers, and financial records. This policy explains what
              we collect, why we collect it, how we protect it, how long we keep it, and the rights users have over
              their information.
            </p>
            <p>
              This policy applies to all users of the RepetiGo platform, including shop owners and end customers who use
              a shop's RepetiGo-powered service.
            </p>
          </section>

          <section className="privacy-section" id="definitions">
            <span className="privacy-section-label">Section 2</span>
            <h2>2. Definitions</h2>
            <DataTable rows={definitions} headers={["Term", "Meaning"]} />
          </section>

          <section className="privacy-section" id="information">
            <span className="privacy-section-label">Section 3</span>
            <h2>3. Information We Collect</h2>
            <p>We only collect what is necessary to provide, improve, and secure RepetiGo services.</p>
            <div className="privacy-card-grid">
              {informationCards.map((card) => (
                <div className="privacy-mini-card" key={card.title}>
                  <DatabaseZap size={19} />
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="privacy-section" id="use">
            <span className="privacy-section-label">Section 4</span>
            <h2>4. How We Use Your Information</h2>
            <DataTable rows={useRows} headers={["Purpose", "What Data", "Legal Basis"]} />
            <div className="privacy-note">
              We do not sell personal data. We do not use data for targeted advertising. We do not use document content
              to build user profiles.
            </div>
          </section>

          <section className="privacy-section" id="ai-processing">
            <span className="privacy-section-label">Section 5</span>
            <h2>5. AI Processing</h2>
            <p>
              Some RepetiGo features use artificial intelligence for automatic document and image processing. AI is used
              only to complete requested platform services.
            </p>
            <div className="privacy-two-col">
              <div className="privacy-mini-card">
                <BrainCircuit size={20} />
                <h3>What AI Does</h3>
                <CheckList items={aiDoes} />
              </div>
              <div className="privacy-mini-card">
                <FileLock2 size={20} />
                <h3>What AI Does Not Do</h3>
                <CheckList items={aiDoesNot} />
              </div>
            </div>
            <p>
              Your documents are never used to train any AI model without explicit, informed consent. If trusted
              third-party AI services are used, documents are transmitted securely and providers are contractually
              restricted from storing or using documents for their own purposes.
            </p>
          </section>

          <section className="privacy-section" id="document-security">
            <span className="privacy-section-label">Section 6</span>
            <h2>6. Document Security & Handling</h2>
            <p>
              Uploaded files may contain government IDs, educational documents, legal documents, medical reports,
              financial files, and business records. RepetiGo treats every uploaded document with the same level of
              care, regardless of content.
            </p>
            <DataTable rows={documentCommitments} headers={["Commitment", "Details"]} />
            <p>
              Access is limited to the end customer during their session, the shop owner for pending print delivery,
              and authorised support access only when necessary and logged. Uploaded documents are deleted after
              successful printing or within the configured default retention window.
            </p>
          </section>

          <section className="privacy-section" id="retention">
            <span className="privacy-section-label">Section 7</span>
            <h2>7. Data Retention</h2>
            <DataTable rows={retentionRows} headers={["Data Type", "Retention Period", "Reason"]} />
            <p>
              When a retention period ends, data is permanently and securely deleted from active systems and backups
              according to our deletion schedule.
            </p>
          </section>

          <section className="privacy-section" id="cookies">
            <span className="privacy-section-label">Section 8</span>
            <h2>8. Cookies</h2>
            <p>
              Cookies help RepetiGo keep sessions secure, remember settings, support QR upload flows, and understand
              platform usage where optional consent is given.
            </p>
            <div className="privacy-icon-line">
              <Cookie size={19} />
              <span>Non-essential cookies can be managed through Cookie Settings without affecting core functionality.</span>
            </div>
            <DataTable rows={cookieRows} headers={["Cookie Type", "Purpose", "Can You Opt Out?"]} />
          </section>

          <section className="privacy-section" id="payments">
            <span className="privacy-section-label">Section 9</span>
            <h2>9. Payments</h2>
            <p>
              RepetiGo uses trusted, certified payment gateway partners. We do not store, see, or process debit card
              numbers, credit card numbers, CVV codes, UPI PINs, or complete payment credentials.
            </p>
            <div className="privacy-icon-line">
              <CreditCard size={19} />
              <span>
                We store only transaction ID, status, amount, date, time, and the service or plan paid for so we can
                issue receipts, resolve disputes, and meet tax obligations.
              </span>
            </div>
          </section>

          <section className="privacy-section" id="third-party">
            <span className="privacy-section-label">Section 10</span>
            <h2>10. Third-Party Services</h2>
            <DataTable rows={thirdPartyRows} headers={["Category", "Example Provider(s)", "Purpose"]} />
            <p>
              Third-party providers are selected based on security and privacy practices, bound by contractual
              obligations, and prohibited from using RepetiGo data for their own purposes.
            </p>
          </section>

          <section className="privacy-section" id="transfers">
            <span className="privacy-section-label">Section 11</span>
            <h2>11. International Data Transfers</h2>
            <p>
              RepetiGo primarily operates in India and aims to store data within Indian data centres where possible.
              Some service providers may process data on servers in other countries.
            </p>
            <CheckList
              items={[
                "Transfers are made only with adequate safeguards.",
                "Contractual protections are used with service providers.",
                "Sensitive document data is protected with encryption in transit and at rest.",
                "Specific cloud data residency details should be inserted once confirmed.",
              ]}
            />
          </section>

          <section className="privacy-section" id="rights">
            <span className="privacy-section-label">Section 12</span>
            <h2>12. Your Rights</h2>
            <DataTable rows={rightsRows} headers={["Your Right", "What It Means"]} />
            <p>
              To exercise your rights, contact privacy@repetigo.com. We respond to valid requests within 30 days and
              may ask you to verify your identity before processing the request.
            </p>
          </section>

          <section className="privacy-section" id="children">
            <span className="privacy-section-label">Section 13</span>
            <h2>13. Children's Privacy</h2>
            <p>
              RepetiGo is primarily intended for adults, including shop owners and adult customers. We do not knowingly
              collect personal data from children under 18 without verifiable parental or guardian consent.
            </p>
            <p>
              Where minors use a print shop service, appropriate supervision is the responsibility of the shop owner
              and the parent or guardian.
            </p>
          </section>

          <section className="privacy-section" id="security">
            <span className="privacy-section-label">Section 14</span>
            <h2>14. Data Security</h2>
            <div className="privacy-card-grid">
              {[
                ["Technical Safeguards", "TLS encryption in transit, encryption at rest, hashed passwords, secure cloud infrastructure, role-based access, and MFA for shop owner accounts."],
                ["Operational Safeguards", "Audit logs, automated document deletion, rate limiting, abuse detection, fraud prevention, and security updates."],
                ["Incident Response", "We maintain breach response processes and notify users as required by applicable law."],
              ].map(([title, text]) => (
                <div className="privacy-mini-card" key={title}>
                  <LockKeyhole size={19} />
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              ))}
            </div>
            <p>
              No system is 100% secure. We encourage users to use strong passwords and keep account credentials
              confidential.
            </p>
          </section>

          <section className="privacy-section" id="compliance">
            <span className="privacy-section-label">Section 15</span>
            <h2>15. Compliance</h2>
            <CheckList
              items={[
                "India Digital Personal Data Protection Act, 2023: lawful purpose, clear notice, consent where required, user rights, reasonable safeguards, and purpose-based retention.",
                "GDPR-equivalent principles where applicable: transparency, purpose limitation, data minimisation, accuracy, storage limitation, integrity, and confidentiality.",
                "Industry practices: PCI-DSS through certified payment gateways, ISO 27001-aligned security practices, and OWASP principles in application development.",
              ]}
            />
          </section>

          <section className="privacy-section" id="changes">
            <span className="privacy-section-label">Section 16</span>
            <h2>16. Changes to This Policy</h2>
            <p>
              We may update this policy as services evolve or legal requirements change. Material changes may include
              updating the Last Updated date, notifying active shop owners by email at least 14 days before the change,
              posting a platform dashboard notice, and requesting fresh consent for significant changes affecting user
              rights.
            </p>
          </section>

          <section className="privacy-section" id="contact">
            <span className="privacy-section-label">Section 17</span>
            <h2>17. Contact Information</h2>
            <DataTable rows={contactRows} headers={["Field", "Details"]} />
            <p>
              We aim to respond to privacy-related requests within 30 business days. For urgent security concerns, use
              the subject line "URGENT: Security Concern".
            </p>
          </section>

          <section className="privacy-section" id="faq">
            <span className="privacy-section-label">Section 18</span>
            <h2>18. Frequently Asked Questions</h2>
            <div className="privacy-faq-list">
              {faqItems.map(([question, answer]) => (
                <div className="privacy-faq-item" key={question}>
                  <h3>{question}</h3>
                  <p>{answer}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="privacy-section privacy-conclusion" id="conclusion">
            <span className="privacy-section-label">Section 19</span>
            <h2>19. Conclusion</h2>
            <p>
              Privacy is not a legal formality for RepetiGo. It is the foundation of what we built. Print shops and
              cyber cafes handle some of the most sensitive documents in people's lives every day, and RepetiGo is
              designed to make that trust safer for customers and shop owners.
            </p>
            <p>
              By removing personal documents from WhatsApp chats, automating secure processing, and deleting files after
              printing, RepetiGo reduces one of the biggest privacy risks in the Indian document printing industry.
            </p>
          </section>
        </article>
      </section>
      <PublicFooter />
    </main>
  );
}
