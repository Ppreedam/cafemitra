export type InfoPageKey = "about" | "help" | "privacy" | "disclaimer" | "terms" | "contact";

export type InfoPageData = {
  eyebrow: string;
  title: string;
  summary: string;
  updated: string;
  highlights: string[];
  sections: {
    title: string;
    body: string;
  }[];
};

export const infoPages: Record<InfoPageKey, InfoPageData> = {
  about: {
    eyebrow: "About Repetigo",
    title: "Automation built for cyber cafes and document service counters.",
    summary:
      "Repetigo helps shops reduce repetitive manual work across printing, PDF handling, passport photos, AI form filling, image editing, and agreement generation.",
    updated: "Updated June 2026",
    highlights: ["Cyber cafe focused", "Document workflow automation", "Simple for staff"],
    sections: [
      {
        title: "Who we serve",
        body: "Repetigo is designed for cyber cafes, printing shops, and small document service centers that handle many small customer tasks every day.",
      },
      {
        title: "What we automate",
        body: "The platform brings common jobs like document printing, PDF conversion, image resize, passport photo creation, form filling, and agreement preparation into one workflow.",
      },
      {
        title: "Our goal",
        body: "We want every counter operator to finish customer work faster, reduce errors, and offer more services without switching between many tools.",
      },
    ],
  },
  help: {
    eyebrow: "Help & Support",
    title: "Get help with setup, tools, billing, and daily workflows.",
    summary:
      "Find guidance for using Repetigo in your shop and contact support when you need help with your account or service flow.",
    updated: "Support available for active users",
    highlights: ["Setup guidance", "Workflow help", "Account support"],
    sections: [
      {
        title: "Getting started",
        body: "Create your account, open the dashboard, and start with the tool your shop uses most often, such as PDF tools, print automation, or passport photo creation.",
      },
      {
        title: "Common support topics",
        body: "We can help with login issues, pricing setup, file processing problems, printer workflow questions, and customer order handling.",
      },
      {
        title: "Contact support",
        body: "Use the contact section on the landing page or your dashboard support option to share your issue with clear details and screenshots when possible.",
      },
    ],
  },
  privacy: {
    eyebrow: "Privacy Policy",
    title: "How Repetigo handles shop, customer, and document data.",
    summary:
      "This page explains the privacy principles used by Repetigo. Replace this draft with lawyer-reviewed policy text before public launch.",
    updated: "Draft policy",
    highlights: ["Data minimization", "Secure workflows", "User control"],
    sections: [
      {
        title: "Information we collect",
        body: "We may collect account details, shop information, uploaded files, service activity, and technical information required to provide Repetigo services.",
      },
      {
        title: "How we use information",
        body: "Information is used to process customer tasks, maintain accounts, improve reliability, provide support, prevent misuse, and keep the platform secure.",
      },
      {
        title: "Your responsibility",
        body: "Shop owners should only upload customer documents when they have permission and should delete or manage files according to their local business requirements.",
      },
    ],
  },
  disclaimer: {
    eyebrow: "Disclaimer",
    title: "Important limits and responsibilities while using Repetigo.",
    summary:
      "Repetigo provides automation tools, but the shop owner remains responsible for checking final documents, legal wording, and customer information.",
    updated: "Draft disclaimer",
    highlights: ["Review before print", "No legal advice", "User responsibility"],
    sections: [
      {
        title: "Tool output",
        body: "Generated forms, edited images, PDFs, and agreements should be reviewed before printing, sharing, or submitting to any authority or third-party portal.",
      },
      {
        title: "Legal and official documents",
        body: "Agreement generation and form assistance are productivity features and should not be treated as legal, financial, or government advice.",
      },
      {
        title: "Service availability",
        body: "Features may depend on browser support, internet connection, file quality, printer setup, and third-party systems outside Repetigo control.",
      },
    ],
  },
  terms: {
    eyebrow: "Terms & Conditions",
    title: "Rules for using Repetigo services and tools.",
    summary:
      "These draft terms describe acceptable use, account responsibility, service limits, and ownership of uploaded customer content.",
    updated: "Draft terms",
    highlights: ["Acceptable use", "Account security", "Service limits"],
    sections: [
      {
        title: "Account use",
        body: "You are responsible for keeping account access secure and for all activity performed from your shop account or staff devices.",
      },
      {
        title: "Acceptable use",
        body: "Do not use Repetigo to create fraudulent, harmful, illegal, or misleading documents, images, forms, or customer records.",
      },
      {
        title: "Content ownership",
        body: "You and your customers retain responsibility for uploaded files and entered information. Repetigo processes that content to provide requested services.",
      },
    ],
  },
  contact: {
    eyebrow: "Contact Repetigo",
    title: "Talk to us about automating your cyber cafe workflow.",
    summary:
      "Reach out for product questions, demo requests, support, or partnership conversations. Share your shop workflow and we will help you choose the right starting point.",
    updated: "We usually respond as soon as possible",
    highlights: ["Demo requests", "Product support", "Cyber cafe onboarding"],
    sections: [
      {
        title: "Sales and demos",
        body: "Want to see how Repetigo fits your shop? Contact us with your main services, current workflow, and the tools you want to automate first.",
      },
      {
        title: "Support",
        body: "For account or tool issues, include your registered mobile or email, the service name, and screenshots so the support team can understand the problem quickly.",
      },
      {
        title: "Business enquiries",
        body: "For partnerships or custom workflow requests, describe your use case and expected volume so we can plan the right solution.",
      },
    ],
  },
};
