import Link from "next/link";
import { Printer } from "lucide-react";

const footerColumns = [
  {
    title: "Products",
    links: [
      ["PrintPilot", "/print-automation"],
      ["PDF Tools", "/pdf-tools"],
      ["Image Tools", "/image-tools"],
      ["Background Remover", "/image-tools/background-remover"],
    ],
  },
  {
    title: "Support",
    links: [
      ["Help & Support", "/help-support"],
      ["Contact Us", "/contact-us"],
      ["Pricing", "/pricing"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About Us", "/about-us"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy Policy", "/privacy-policy"],
      ["Terms & Conditions", "/terms-conditions"],
      ["Disclaimer", "/disclaimer"],
    ],
  },
];

export function PublicFooter() {
  return (
    <footer className="ai-footer">
      <div className="ai-container">
        <div className="ai-footer-grid">
          <div>
            <Link className="ai-footer-brand" href="/">
              <span>
                <Printer size={16} />
              </span>
              <b className="ai-footer-wordmark">
                Repeti<em>Go</em>
              </b>
            </Link>
            <p>
              AI-Powered Print Shop Software. Secure Document Infrastructure for Cyber Cafes, Print Shops, and CSC
              Centres across India.
            </p>
          </div>
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h4>{column.title}</h4>
              {column.links.map(([label, href]) => (
                <Link href={href} key={label}>
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div className="ai-footer-bottom">
          <p>Copyright 2025 RepetiGo. All rights reserved. Made for India. Built for scale.</p>
          <p>Print Shop Software - Document Automation - Secure Upload - AI Print Management - Cyber Cafe Software India</p>
        </div>
      </div>
    </footer>
  );
}
