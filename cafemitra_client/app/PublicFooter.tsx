import Link from "next/link";
import { Printer } from "lucide-react";

const footerColumns = [
  {
    title: "Products",
    links: [
      ["PrintPilot", "/print-automation"],
      ["PDF Tools", "/pdf-tools"],
      ["OCR", "#"],
      ["Passport Photo", "#"],
      ["Image Tools", "#"],
    ],
  },
  {
    title: "Solutions",
    links: [
      ["Cyber Cafes", "#"],
      ["Print Shops", "#"],
      ["CSC Centres", "#"],
      ["Schools & Colleges", "#"],
      ["Businesses", "#"],
    ],
  },
  {
    title: "Resources",
    links: [
      ["Academy", "#"],
      ["Blog", "#"],
      ["Help Centre", "/help-support"],
      ["API Docs", "#"],
      ["Compare vs WhatsApp", "#"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About", "/about-us"],
      ["Pricing", "/pricing"],
      ["Contact", "/contact-us"],
      ["Security", "/privacy-policy"],
      ["Privacy Policy", "/privacy-policy"],
      ["Terms", "/terms-conditions"],
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
              Repeti<em>Go</em>
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
