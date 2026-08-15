"use client";

import { Plus, Trash2 } from "lucide-react";
import PhotoUploadField from "./build/PhotoUploadField";
import {
  blankCert,
  blankEducation,
  blankExperience,
  blankProject,
  type CertItem,
  type EducationItem,
  type ExperienceItem,
  type ProjectItem,
  type ResumeData,
} from "./resumeModel";

type ListOps<T> = {
  add: (blank: T) => void;
  update: (id: string, patch: Partial<T>) => void;
  remove: (id: string) => void;
};

export default function ResumeFormFields({
  resume,
  setField,
  experienceOps,
  educationOps,
  projectOps,
  certOps,
}: {
  resume: ResumeData;
  setField: <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => void;
  experienceOps: ListOps<ExperienceItem>;
  educationOps: ListOps<EducationItem>;
  projectOps: ListOps<ProjectItem>;
  certOps: ListOps<CertItem>;
}) {
  return (
    <>
      <fieldset className="resbuild-section">
        <h2>Personal details</h2>
        {resume.template === "sidebar" || resume.template === "sidebar-right" ? (
          // Not a <Field>/<label> on purpose: it would implicitly associate with the
          // hidden file input inside PhotoUploadField, so any click anywhere in the
          // crop editor - including the resize handles - would re-open the file picker
          // and reset the crop mid-drag.
          <div className="resbuild-field">
            <span>Photo</span>
            <PhotoUploadField photo={resume.photo} onChange={(dataUrl) => setField("photo", dataUrl)} />
          </div>
        ) : null}
        <div className="resbuild-grid-2">
          <Field label="Full name"><input value={resume.fullName} onChange={(e) => setField("fullName", e.target.value)} placeholder="Aditi Sharma" /></Field>
          <Field label="Job title / role"><input value={resume.role} onChange={(e) => setField("role", e.target.value)} placeholder="Frontend Developer" /></Field>
          <Field label="Email"><input value={resume.email} onChange={(e) => setField("email", e.target.value)} placeholder="you@email.com" /></Field>
          <Field label="Phone"><input value={resume.phone} onChange={(e) => setField("phone", e.target.value)} placeholder="+91 98765 43210" /></Field>
          <Field label="Location"><input value={resume.location} onChange={(e) => setField("location", e.target.value)} placeholder="Bengaluru, India" /></Field>
          <Field label="LinkedIn"><input value={resume.linkedin} onChange={(e) => setField("linkedin", e.target.value)} placeholder="linkedin.com/in/username" /></Field>
          <Field label="Website / Portfolio"><input value={resume.website} onChange={(e) => setField("website", e.target.value)} placeholder="yourname.dev" /></Field>
        </div>
      </fieldset>

      <fieldset className="resbuild-section">
        <h2>Professional summary</h2>
        <Field label="2-3 sentences summarising your experience and strengths">
          <textarea rows={4} value={resume.summary} onChange={(e) => setField("summary", e.target.value)} placeholder="Frontend developer with 3 years of experience..." />
        </Field>
      </fieldset>

      <fieldset className="resbuild-section">
        <h2>Skills</h2>
        <Field label="Comma-separated"><input value={resume.skills} onChange={(e) => setField("skills", e.target.value)} placeholder="React, TypeScript, Git" /></Field>
      </fieldset>

      <fieldset className="resbuild-section">
        <h2>Experience</h2>
        {resume.experience.map((exp, index) => (
          <div className="resbuild-entry" key={exp.id}>
            <div className="resbuild-entry-head">
              <strong>Experience {index + 1}</strong>
              <button type="button" className="resbuild-icon-btn" onClick={() => experienceOps.remove(exp.id)} aria-label="Remove experience"><Trash2 size={15} /></button>
            </div>
            <div className="resbuild-grid-2">
              <Field label="Role"><input value={exp.role} onChange={(e) => experienceOps.update(exp.id, { role: e.target.value })} placeholder="Frontend Developer" /></Field>
              <Field label="Company"><input value={exp.company} onChange={(e) => experienceOps.update(exp.id, { company: e.target.value })} placeholder="Company name" /></Field>
              <Field label="Location"><input value={exp.location} onChange={(e) => experienceOps.update(exp.id, { location: e.target.value })} placeholder="City" /></Field>
              <Field label="Start date"><input value={exp.start} onChange={(e) => experienceOps.update(exp.id, { start: e.target.value })} placeholder="Jun 2022" /></Field>
              <Field label="End date"><input value={exp.end} onChange={(e) => experienceOps.update(exp.id, { end: e.target.value })} placeholder="May 2024" disabled={exp.current} /></Field>
              <label className="resbuild-checkbox-row">
                <input type="checkbox" checked={exp.current} onChange={(e) => experienceOps.update(exp.id, { current: e.target.checked, end: e.target.checked ? "" : exp.end })} />
                I currently work here
              </label>
            </div>
            <Field label="Achievements - one per line">
              <textarea rows={3} value={exp.bullets} onChange={(e) => experienceOps.update(exp.id, { bullets: e.target.value })} placeholder={"Rebuilt the checkout flow, cutting cart abandonment by 18%"} />
            </Field>
          </div>
        ))}
        <button type="button" className="resbuild-add-btn" onClick={() => experienceOps.add(blankExperience())}><Plus size={15} /> Add experience</button>
      </fieldset>

      <fieldset className="resbuild-section">
        <h2>Education</h2>
        {resume.education.map((edu, index) => (
          <div className="resbuild-entry" key={edu.id}>
            <div className="resbuild-entry-head">
              <strong>Education {index + 1}</strong>
              <button type="button" className="resbuild-icon-btn" onClick={() => educationOps.remove(edu.id)} aria-label="Remove education"><Trash2 size={15} /></button>
            </div>
            <div className="resbuild-grid-2">
              <Field label="Degree"><input value={edu.degree} onChange={(e) => educationOps.update(edu.id, { degree: e.target.value })} placeholder="B.Tech in Computer Science" /></Field>
              <Field label="School / University"><input value={edu.school} onChange={(e) => educationOps.update(edu.id, { school: e.target.value })} placeholder="University name" /></Field>
              <Field label="Start year"><input value={edu.start} onChange={(e) => educationOps.update(edu.id, { start: e.target.value })} placeholder="2016" /></Field>
              <Field label="End year"><input value={edu.end} onChange={(e) => educationOps.update(edu.id, { end: e.target.value })} placeholder="2020" /></Field>
              <Field label="Score / CGPA"><input value={edu.score} onChange={(e) => educationOps.update(edu.id, { score: e.target.value })} placeholder="8.4 CGPA" /></Field>
            </div>
          </div>
        ))}
        <button type="button" className="resbuild-add-btn" onClick={() => educationOps.add(blankEducation())}><Plus size={15} /> Add education</button>
      </fieldset>

      <fieldset className="resbuild-section">
        <h2>Projects</h2>
        {resume.projects.map((proj, index) => (
          <div className="resbuild-entry" key={proj.id}>
            <div className="resbuild-entry-head">
              <strong>Project {index + 1}</strong>
              <button type="button" className="resbuild-icon-btn" onClick={() => projectOps.remove(proj.id)} aria-label="Remove project"><Trash2 size={15} /></button>
            </div>
            <div className="resbuild-grid-2">
              <Field label="Project name"><input value={proj.name} onChange={(e) => projectOps.update(proj.id, { name: e.target.value })} placeholder="Expense Tracker" /></Field>
              <Field label="Tech stack"><input value={proj.stack} onChange={(e) => projectOps.update(proj.id, { stack: e.target.value })} placeholder="React, Firebase" /></Field>
              <Field label="Link"><input value={proj.link} onChange={(e) => projectOps.update(proj.id, { link: e.target.value })} placeholder="github.com/you/project" /></Field>
            </div>
            <Field label="Description"><textarea rows={2} value={proj.description} onChange={(e) => projectOps.update(proj.id, { description: e.target.value })} placeholder="What the project does and its impact" /></Field>
          </div>
        ))}
        <button type="button" className="resbuild-add-btn" onClick={() => projectOps.add(blankProject())}><Plus size={15} /> Add project</button>
      </fieldset>

      <fieldset className="resbuild-section">
        <h2>Certifications</h2>
        {resume.certifications.map((cert, index) => (
          <div className="resbuild-entry" key={cert.id}>
            <div className="resbuild-entry-head">
              <strong>Certification {index + 1}</strong>
              <button type="button" className="resbuild-icon-btn" onClick={() => certOps.remove(cert.id)} aria-label="Remove certification"><Trash2 size={15} /></button>
            </div>
            <div className="resbuild-grid-2">
              <Field label="Name"><input value={cert.name} onChange={(e) => certOps.update(cert.id, { name: e.target.value })} placeholder="Meta Front-End Developer Certificate" /></Field>
              <Field label="Issuer"><input value={cert.issuer} onChange={(e) => certOps.update(cert.id, { issuer: e.target.value })} placeholder="Coursera" /></Field>
              <Field label="Year"><input value={cert.year} onChange={(e) => certOps.update(cert.id, { year: e.target.value })} placeholder="2023" /></Field>
            </div>
          </div>
        ))}
        <button type="button" className="resbuild-add-btn" onClick={() => certOps.add(blankCert())}><Plus size={15} /> Add certification</button>
      </fieldset>
    </>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="resbuild-field">
      <span>{label}</span>
      {children}
    </label>
  );
}
