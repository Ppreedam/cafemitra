"use client";

import { Plus, Trash2 } from "lucide-react";
import PhotoUploadField from "./build/PhotoUploadField";
import { FieldSelectionProvider, SelectableEntry, SelectableField, SelectableSection } from "./SelectableSection";
import {
  blankCert,
  blankEducation,
  blankExperience,
  blankProject,
  type CertItem,
  type EducationItem,
  type ExperienceItem,
  type ProjectItem,
  type ResumeCustomField,
  type ResumeCustomSection,
  type ResumeData,
  type ResumeSectionId,
} from "./resumeModel";

type ListOps<T> = {
  add: (blank: T) => void;
  update: (id: string, patch: Partial<T>) => void;
  remove: (id: string) => void;
};

const CUSTOM_PREFIX = "custom:";

function CustomFieldsBlock({ sectionId, fields, ops }: { sectionId: string; fields: ResumeCustomField[]; ops: ListOps<ResumeCustomField> }) {
  return (
    <>
      {fields.map((field, index) => (
        <SelectableEntry sectionId={sectionId} fieldKey={`${CUSTOM_PREFIX}${field.id}`} key={field.id}>
          <div className="resbuild-entry-head">
            <strong>Custom field {index + 1}</strong>
          </div>
          <div className="resbuild-grid-2">
            <Field label="Field name">
              <input value={field.label} onChange={(e) => ops.update(field.id, { label: e.target.value })} placeholder="GitHub" />
            </Field>
            <Field label="Value">
              <input value={field.value} onChange={(e) => ops.update(field.id, { value: e.target.value })} placeholder="github.com/username" />
            </Field>
          </div>
        </SelectableEntry>
      ))}
      <button type="button" className="resbuild-add-btn" onClick={() => ops.add({ id: crypto.randomUUID(), section: sectionId, label: "", value: "" })}>
        <Plus size={15} /> Add field
      </button>
    </>
  );
}

export default function ResumeFormFields({
  resume,
  setField,
  experienceOps,
  educationOps,
  projectOps,
  certOps,
  customFieldOps,
  customSectionOps,
}: {
  resume: ResumeData;
  setField: <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => void;
  experienceOps: ListOps<ExperienceItem>;
  educationOps: ListOps<EducationItem>;
  projectOps: ListOps<ProjectItem>;
  certOps: ListOps<CertItem>;
  customFieldOps: ListOps<ResumeCustomField>;
  customSectionOps: ListOps<ResumeCustomSection>;
}) {
  const customFields = resume.customFields || [];
  const customSections = resume.customSections || [];
  const hiddenFields = resume.hiddenFields || [];
  const hiddenSections = resume.hiddenSections || [];
  const fieldsFor = (section: string) => customFields.filter((field) => field.section === section);
  const isHidden = (key: string) => hiddenFields.includes(key);
  const isSectionHidden = (id: ResumeSectionId) => hiddenSections.includes(id);

  function removeFromSection(sectionId: ResumeSectionId, fieldKey: string | null) {
    if (fieldKey === null) {
      setField("hiddenSections", [...hiddenSections, sectionId]);
      return;
    }
    if (fieldKey.startsWith(CUSTOM_PREFIX)) {
      customFieldOps.remove(fieldKey.slice(CUSTOM_PREFIX.length));
      return;
    }
    setField("hiddenFields", [...hiddenFields, fieldKey]);
  }

  function removeFromCustomSection(customSectionId: string, fieldKey: string | null) {
    if (fieldKey === null) {
      customSectionOps.remove(customSectionId);
      return;
    }
    if (fieldKey.startsWith(CUSTOM_PREFIX)) {
      customFieldOps.remove(fieldKey.slice(CUSTOM_PREFIX.length));
    }
  }

  const hiddenCount = hiddenFields.length + hiddenSections.length;

  return (
    <FieldSelectionProvider>
      {hiddenCount > 0 ? (
        <div className="resbuild-restore-banner">
          <span>{hiddenCount} field{hiddenCount === 1 ? "" : "s"}/section{hiddenCount === 1 ? "" : "s"} hidden</span>
          <button type="button" onClick={() => { setField("hiddenFields", []); setField("hiddenSections", []); }}>Restore all</button>
        </div>
      ) : null}

      {!isSectionHidden("personal") ? (
        <SelectableSection sectionId="personal" title="Personal details" onRemove={(key) => removeFromSection("personal", key)}>
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
            <SelectableField sectionId="personal" fieldKey="fullName" label="Full name"><input value={resume.fullName} onChange={(e) => setField("fullName", e.target.value)} placeholder="Aditi Sharma" /></SelectableField>
            {!isHidden("role") ? <SelectableField sectionId="personal" fieldKey="role" label="Job title / role"><input value={resume.role} onChange={(e) => setField("role", e.target.value)} placeholder="Frontend Developer" /></SelectableField> : null}
            {!isHidden("email") ? <SelectableField sectionId="personal" fieldKey="email" label="Email"><input value={resume.email} onChange={(e) => setField("email", e.target.value)} placeholder="you@email.com" /></SelectableField> : null}
            {!isHidden("phone") ? <SelectableField sectionId="personal" fieldKey="phone" label="Phone"><input value={resume.phone} onChange={(e) => setField("phone", e.target.value)} placeholder="+91 98765 43210" /></SelectableField> : null}
            {!isHidden("location") ? <SelectableField sectionId="personal" fieldKey="location" label="Location"><input value={resume.location} onChange={(e) => setField("location", e.target.value)} placeholder="Bengaluru, India" /></SelectableField> : null}
            {!isHidden("linkedin") ? <SelectableField sectionId="personal" fieldKey="linkedin" label="LinkedIn"><input value={resume.linkedin} onChange={(e) => setField("linkedin", e.target.value)} placeholder="linkedin.com/in/username" /></SelectableField> : null}
            {!isHidden("website") ? <SelectableField sectionId="personal" fieldKey="website" label="Website / Portfolio"><input value={resume.website} onChange={(e) => setField("website", e.target.value)} placeholder="yourname.dev" /></SelectableField> : null}
          </div>
          <CustomFieldsBlock sectionId="personal" fields={fieldsFor("personal")} ops={customFieldOps} />
        </SelectableSection>
      ) : null}

      {!isSectionHidden("summary") ? (
        <SelectableSection sectionId="summary" title="Professional summary" onRemove={(key) => removeFromSection("summary", key)}>
          {!isHidden("summary") ? (
            <SelectableField sectionId="summary" fieldKey="summary" label="2-3 sentences summarising your experience and strengths">
              <textarea rows={4} value={resume.summary} onChange={(e) => setField("summary", e.target.value)} placeholder="Frontend developer with 3 years of experience..." />
            </SelectableField>
          ) : null}
          <CustomFieldsBlock sectionId="summary" fields={fieldsFor("summary")} ops={customFieldOps} />
        </SelectableSection>
      ) : null}

      {!isSectionHidden("skills") ? (
        <SelectableSection sectionId="skills" title="Skills" onRemove={(key) => removeFromSection("skills", key)}>
          {!isHidden("skills") ? <SelectableField sectionId="skills" fieldKey="skills" label="Comma-separated"><input value={resume.skills} onChange={(e) => setField("skills", e.target.value)} placeholder="React, TypeScript, Git" /></SelectableField> : null}
          <CustomFieldsBlock sectionId="skills" fields={fieldsFor("skills")} ops={customFieldOps} />
        </SelectableSection>
      ) : null}

      {!isSectionHidden("experience") ? (
        <SelectableSection sectionId="experience" title="Experience" onRemove={(key) => removeFromSection("experience", key)}>
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
          <CustomFieldsBlock sectionId="experience" fields={fieldsFor("experience")} ops={customFieldOps} />
        </SelectableSection>
      ) : null}

      {!isSectionHidden("education") ? (
        <SelectableSection sectionId="education" title="Education" onRemove={(key) => removeFromSection("education", key)}>
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
          <CustomFieldsBlock sectionId="education" fields={fieldsFor("education")} ops={customFieldOps} />
        </SelectableSection>
      ) : null}

      {!isSectionHidden("projects") ? (
        <SelectableSection sectionId="projects" title="Projects" onRemove={(key) => removeFromSection("projects", key)}>
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
          <CustomFieldsBlock sectionId="projects" fields={fieldsFor("projects")} ops={customFieldOps} />
        </SelectableSection>
      ) : null}

      {!isSectionHidden("certifications") ? (
        <SelectableSection sectionId="certifications" title="Certifications" onRemove={(key) => removeFromSection("certifications", key)}>
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
          <CustomFieldsBlock sectionId="certifications" fields={fieldsFor("certifications")} ops={customFieldOps} />
        </SelectableSection>
      ) : null}

      {customSections.map((section) => (
        <SelectableSection
          key={section.id}
          sectionId={section.id}
          onRemove={(key) => removeFromCustomSection(section.id, key)}
          titleSlot={
            <input
              className="resbuild-section-title-input"
              value={section.title}
              onChange={(e) => customSectionOps.update(section.id, { title: e.target.value })}
              placeholder="Section title (e.g. Languages)"
            />
          }
        >
          <CustomFieldsBlock sectionId={section.id} fields={fieldsFor(section.id)} ops={customFieldOps} />
        </SelectableSection>
      ))}
      <button type="button" className="resbuild-add-btn" onClick={() => customSectionOps.add({ id: crypto.randomUUID(), title: "" })}>
        <Plus size={15} /> Add section
      </button>
    </FieldSelectionProvider>
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
