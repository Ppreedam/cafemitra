import type { TemplateId } from "./templates";

export type ExperienceItem = { id: string; role: string; company: string; location: string; start: string; end: string; current: boolean; bullets: string };
export type EducationItem = { id: string; degree: string; school: string; start: string; end: string; score: string };
export type ProjectItem = { id: string; name: string; stack: string; description: string; link: string };
export type CertItem = { id: string; name: string; issuer: string; year: string };

/// The server's view of a saved resume-as-PrintOrder row - mirrors
/// resume_order_summary() in api/views.py.
export type SavedOrderSummary = {
  id: number;
  template: string;
  label: string;
  data: Partial<ResumeData>;
  createdAt: string;
  forCustomer: boolean;
  paymentMode: string;
  paymentStatus: string;
  paymentGateway: string;
  gatewayOrderId: string;
  totalAmount: number;
  customerPhone: string;
};

export type ResumeData = {
  template: TemplateId;
  photo: string;
  fullName: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  summary: string;
  skills: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  certifications: CertItem[];
};

export const STORAGE_KEY = "repetigo-resume-builder-draft";

let idSeed = 0;
export function nextId() {
  idSeed += 1;
  return `item-${idSeed}-${Math.random().toString(36).slice(2, 7)}`;
}

export const sampleResume: ResumeData = {
  template: "classic",
  photo: "",
  fullName: "Aditi Sharma",
  role: "Frontend Developer",
  email: "aditi.sharma@email.com",
  phone: "+91 98765 43210",
  location: "Bengaluru, India",
  linkedin: "linkedin.com/in/aditisharma",
  website: "aditisharma.dev",
  summary:
    "Frontend developer with 3 years of experience building responsive, accessible web applications using React and TypeScript. Shipped customer-facing features used by 50,000+ monthly users.",
  skills: "React, TypeScript, Next.js, Tailwind CSS, REST APIs, Git, Jest, Figma",
  experience: [
    {
      id: nextId(),
      role: "Frontend Developer",
      company: "Brightloop Technologies",
      location: "Bengaluru",
      start: "Jun 2022",
      end: "",
      current: true,
      bullets:
        "Rebuilt the checkout flow in React, cutting cart abandonment by 18%\nLed migration of 40+ components from class to functional components with hooks\nMentored 2 interns on component architecture and code review practices",
    },
    {
      id: nextId(),
      role: "Junior Web Developer",
      company: "Codeflex Solutions",
      location: "Pune",
      start: "Jul 2020",
      end: "May 2022",
      current: false,
      bullets:
        "Built and maintained internal admin dashboards used by 15 operations staff\nReduced page load time by 35% through code splitting and lazy loading",
    },
  ],
  education: [{ id: nextId(), degree: "B.Tech in Computer Science", school: "Pune Institute of Technology", start: "2016", end: "2020", score: "8.4 CGPA" }],
  projects: [
    {
      id: nextId(),
      name: "Expense Tracker",
      stack: "React, Firebase",
      description: "Personal finance app with monthly budget tracking and category insights, 500+ downloads.",
      link: "github.com/aditi/expense-tracker",
    },
  ],
  certifications: [{ id: nextId(), name: "Meta Front-End Developer Professional Certificate", issuer: "Coursera", year: "2023" }],
};

export const blankResume: ResumeData = {
  template: "classic",
  photo: "",
  fullName: "",
  role: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  website: "",
  summary: "",
  skills: "",
  experience: [],
  education: [],
  projects: [],
  certifications: [],
};

export function blankExperience(): ExperienceItem {
  return { id: nextId(), role: "", company: "", location: "", start: "", end: "", current: false, bullets: "" };
}
export function blankEducation(): EducationItem {
  return { id: nextId(), degree: "", school: "", start: "", end: "", score: "" };
}
export function blankProject(): ProjectItem {
  return { id: nextId(), name: "", stack: "", description: "", link: "" };
}
export function blankCert(): CertItem {
  return { id: nextId(), name: "", issuer: "", year: "" };
}

export const expHasContent = (e: ExperienceItem) => !!(e.role.trim() || e.company.trim() || e.bullets.trim());
export const eduHasContent = (e: EducationItem) => !!(e.degree.trim() || e.school.trim());
export const projHasContent = (p: ProjectItem) => !!(p.name.trim() || p.description.trim());
export const certHasContent = (c: CertItem) => !!(c.name.trim() || c.issuer.trim());

export function resumeHasContent(data: ResumeData) {
  return !!(
    data.fullName.trim() ||
    data.role.trim() ||
    data.summary.trim() ||
    data.skills.trim() ||
    data.experience.some(expHasContent) ||
    data.education.some(eduHasContent) ||
    data.projects.some(projHasContent) ||
    data.certifications.some(certHasContent)
  );
}

export function dateRange(start: string, end: string, current: boolean) {
  const startLabel = start.trim();
  const endLabel = current ? "Present" : end.trim();
  if (!startLabel && !endLabel) return "";
  if (!endLabel) return startLabel;
  return `${startLabel} - ${endLabel}`;
}
