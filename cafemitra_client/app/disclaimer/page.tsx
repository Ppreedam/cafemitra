import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, FileWarning, ShieldCheck, Sparkles } from "lucide-react";
import { LandingNavbar } from "../LandingNavbar";
import { PublicFooter } from "../PublicFooter";

export const metadata: Metadata = {
  title: "Disclaimer - RepetiGo Print Shop Software",
  description:
    "RepetiGo disclaimer. Limitations of liability, no warranty, AI processing, document verification, and platform use terms for Indian print shops and cyber cafes.",
  robots: {
    index: true,
    follow: true,
  },
};

const lastUpdated = "1 July 2025";

const sections = [
  {
    id: "introduction",
    title: "1. Introduction",
    body: [
      'This Disclaimer governs your use of the RepetiGo platform, including the website at repetigo.com, the PrintPilot application, and all related software, APIs, tools, and services operated by RepetiGo Technologies Pvt. Ltd. ("RepetiGo", "we", "us", or "our").',
      "This Disclaimer is incorporated into, and forms part of, our Terms of Service. By using the Platform, you agree to be bound by both this Disclaimer and our Terms of Service.",
    ],
  },
  {
    id: "platform-purpose",
    title: "2. Platform Purpose - What RepetiGo Is",
    body: [
      "RepetiGo is a technology platform that provides software infrastructure for document upload, AI-assisted processing, print queue management, and printer integration for print shops, cyber cafes, CSC centres, and similar businesses in India.",
      "RepetiGo is a software intermediary. We provide tools that facilitate document handling between your customers and your printing equipment. We are not a printing service, a document verification service, a legal document handler, or a government-authorised identity processing centre.",
      "RepetiGo does not print documents on your behalf. We provide the software infrastructure that enables you to offer printing services to your customers.",
    ],
  },
  {
    id: "no-warranty",
    title: "3. No Warranty",
    warning: "READ CAREFULLY - This section significantly limits our obligations to you.",
    body: [
      'The Platform is provided on an "as is" and "as available" basis without any warranty of any kind, express or implied.',
      "To the maximum extent permitted by applicable law, RepetiGo expressly disclaims all warranties, including warranties of merchantability, fitness for a particular purpose, uninterrupted operation, accuracy, reliability, completeness, virus-free operation, defect correction, print output quality, or suitability for your specific business requirements.",
      "Some jurisdictions do not allow the exclusion of implied warranties. In such jurisdictions, the above exclusions apply to the maximum extent permitted by law.",
    ],
  },
  {
    id: "liability",
    title: "4. Limitation of Liability",
    warning: "READ CAREFULLY - This section limits the financial liability of RepetiGo to you.",
    body: [
      "To the maximum extent permitted by applicable Indian law, RepetiGo, its directors, employees, agents, licensors, and service providers shall not be liable for indirect, incidental, special, consequential, punitive damages, loss of revenue, loss of profits, loss of business, loss of data beyond gross negligence, substitute service costs, downtime, or damage to reputation or goodwill.",
      "This applies even if RepetiGo has been advised of the possibility of such damages and regardless of the theory of liability.",
      "Our total liability for any claim arising from your use of the Platform shall not exceed the greater of the total amount you paid to RepetiGo in the three months immediately preceding the event giving rise to the claim, or INR 1,000.",
    ],
  },
  {
    id: "document-content",
    title: "5. Document Content - No Verification",
    body: [
      "RepetiGo does not verify, authenticate, or validate the content of any document uploaded through the Platform.",
      "We do not confirm uploader identity, verify document ownership, authenticate government-issued documents including Aadhaar, PAN, or passports, check for forgery, or verify legal or regulatory compliance.",
      "Shop owners and business users are solely responsible for ensuring that they have the legal right to print any document processed through the Platform. RepetiGo is not responsible for consequences arising from fraudulent, forged, illegal, or unauthorised documents.",
      "Uploading a forged or fraudulent document through the Platform is a violation of our Terms of Service and applicable Indian law.",
    ],
  },
  {
    id: "ai-processing",
    title: "6. AI Processing Disclaimer",
    body: [
      "Certain Platform features use artificial intelligence to process and enhance uploaded documents. AI functions may include image enhancement, auto-cropping, de-skewing, contrast optimisation, OCR, and print-setting optimisation.",
      "AI processing is not infallible. AI-generated results may be imperfect or unexpected, AI enhancements do not guarantee perfect print quality, OCR may contain errors, and passport photo generation may not meet every issuing authority's requirements.",
      "Final responsibility for reviewing and approving print output lies with the shop owner, not RepetiGo. Always preview documents before submitting a print job.",
    ],
  },
  {
    id: "print-quality",
    title: "7. Print Quality Disclaimer",
    body: [
      "Print output quality depends on factors outside RepetiGo's control, including printer make, model, age, condition, maintenance, paper, ink, toner, source document quality, printer drivers, firmware, USB or network stability, and environmental conditions.",
      "RepetiGo is not liable for print quality differences between printers, shops, or locations. We are not responsible for re-print costs, wasted paper, ink, or toner resulting from factors outside Platform software control.",
    ],
  },
  {
    id: "third-party-services",
    title: "8. Third-Party Services",
    body: [
      "The Platform integrates with and relies on third-party services including cloud infrastructure providers, payment gateways, AI processing services, email delivery services, and SMS providers.",
      "RepetiGo does not control the availability, performance, accuracy, or security practices of third-party services. We are not responsible for downtime, errors, data loss, third-party changes, third-party privacy practices beyond our Privacy Policy, or harm resulting from linked third-party websites or services.",
      "Third-party services operate under their own terms and privacy policies. We encourage you to review those policies.",
    ],
  },
  {
    id: "accuracy",
    title: "9. Accuracy of Information",
    body: [
      "RepetiGo makes reasonable efforts to ensure that information published on repetigo.com is accurate and current. However, we do not warrant that website information is complete, accurate, up to date, free from errors, or that pricing, features, or product capabilities will not change without notice.",
      "Website information is provided for general informational purposes only and does not constitute professional, legal, financial, or technical advice.",
    ],
  },
  {
    id: "professional-advice",
    title: "10. Professional Advice Disclaimer",
    body: [
      "Nothing on the RepetiGo platform or website constitutes legal advice, financial advice, accounting advice, technical security certification, medical advice, government certification, or regulatory compliance certification.",
      "For specific legal, financial, or regulatory questions relevant to your business, consult a qualified professional admitted to practice in your jurisdiction.",
      "While RepetiGo is designed with the intent to align with India's Digital Personal Data Protection Act, 2023, we do not warrant that use of the Platform makes your business fully compliant with all applicable data protection or privacy laws.",
    ],
  },
  {
    id: "availability",
    title: "11. Availability and Uptime",
    body: [
      "RepetiGo makes commercially reasonable efforts to maintain Platform availability and reliability. However, we do not guarantee 100% uptime, uninterrupted access, availability at any particular time or location, or that maintenance will not temporarily affect access.",
      "The Platform may be temporarily unavailable due to maintenance, upgrades, infrastructure failures, third-party disruptions, security incidents, or circumstances beyond reasonable control.",
      "Unless a separate written Service Level Agreement has been executed, no uptime guarantee is provided.",
    ],
  },
  {
    id: "security",
    title: "12. Security Disclaimer",
    body: [
      "RepetiGo implements industry-standard security measures to protect user data and uploaded documents, including encryption, automatic file deletion, access controls, and monitoring.",
      "However, no system connected to the internet is completely secure. We cannot guarantee absolute security against all threats.",
      "RepetiGo is not liable for security breaches resulting from factors outside our reasonable control, unknown vulnerabilities, user credential failures, extraordinary attacks, or malicious third parties beyond our reasonable ability to prevent.",
      "In the event of a security breach affecting personal data, we will notify users as required by applicable law, including the DPDP Act 2023.",
    ],
  },
  {
    id: "governing-law",
    title: "13. Governing Law",
    body: [
      "This Disclaimer is governed by and construed in accordance with the laws of India, without regard to conflict-of-law principles.",
      "Any dispute arising from or relating to this Disclaimer shall be subject to the exclusive jurisdiction of courts located in Bengaluru, Karnataka, India.",
      "Applicable laws may include the Information Technology Act 2000, Digital Personal Data Protection Act 2023, Indian Contract Act 1872, and Consumer Protection Act 2019.",
    ],
  },
  {
    id: "changes",
    title: "14. Changes to This Disclaimer",
    body: [
      "RepetiGo reserves the right to update or modify this Disclaimer at any time.",
      'Material changes may be communicated by updating the "Last Updated" date, notifying active business account holders via email at least 14 days before material changes take effect, and posting a notice on the Platform dashboard.',
      "Your continued use of the Platform after changes constitutes acceptance of the updated terms.",
    ],
  },
];

const contactRows = [
  ["Company Name", "RepetiGo Technologies Pvt. Ltd."],
  ["Registered Address", "[Full address, city, state, PIN code, India]"],
  ["Legal Email", "legal@repetigo.com"],
  ["General Email", "support@repetigo.com"],
  ["Website", "https://repetigo.com"],
];

export default function DisclaimerPage() {
  return (
    <main className="disclaimer-shell">
      <LandingNavbar />

      <section className="disclaimer-hero">
        <div className="disclaimer-container">
          <span className="disclaimer-kicker">
            <Sparkles size={14} /> Legal Disclaimer
          </span>
          <h1>Disclaimer</h1>
          <p>
            Limitations of liability, no warranty, AI processing, document verification, and platform use terms for
            RepetiGo users.
          </p>
          <div className="disclaimer-hero-meta">
            <span>Last Updated: {lastUpdated}</span>
            <span>India Jurisdiction</span>
          </div>
        </div>
      </section>

      <section className="disclaimer-layout disclaimer-container">
        <aside className="disclaimer-toc">
          <strong>On this page</strong>
          <nav aria-label="Disclaimer sections">
            {sections.map((section) => (
              <a href={`#${section.id}`} key={section.id}>
                {section.title}
              </a>
            ))}
            <a href="#contact">15. Contact</a>
          </nav>
        </aside>

        <article className="disclaimer-content">
          <div className="disclaimer-alert">
            <AlertTriangle size={20} />
            <p>
              Please read this disclaimer carefully before using the RepetiGo platform. By accessing or using
              repetigo.com and its services, you acknowledge that you have read and understood this disclaimer.
            </p>
          </div>

          {sections.map((section) => (
            <section className="disclaimer-section" id={section.id} key={section.id}>
              <span className="disclaimer-section-label">Section {section.title.split(".")[0]}</span>
              <h2>{section.title}</h2>
              {section.warning ? (
                <div className="disclaimer-warning">
                  <ShieldCheck size={18} />
                  <strong>{section.warning}</strong>
                </div>
              ) : null}
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}

          <section className="disclaimer-section" id="contact">
            <span className="disclaimer-section-label">Section 15</span>
            <h2>15. Contact</h2>
            <p>If you have questions about this Disclaimer, please contact us at:</p>
            <div className="disclaimer-table-wrap">
              <table>
                <tbody>
                  {contactRows.map(([field, details]) => (
                    <tr key={field}>
                      <td>{field}</td>
                      <td>{details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </article>
      </section>
      <PublicFooter />
    </main>
  );
}
