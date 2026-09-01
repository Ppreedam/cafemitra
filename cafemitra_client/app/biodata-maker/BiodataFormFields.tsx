"use client";

import { Plus } from "lucide-react";
import PhotoUploadField from "../resume-builder/build/PhotoUploadField";
import { Field } from "../resume-builder/ResumeFormFields";
import { FieldSelectionProvider, SelectableEntry, SelectableField, SelectableSection } from "../resume-builder/SelectableSection";
import type { BiodataCustomField, BiodataCustomSection, BiodataData, BiodataSectionId } from "./biodataModel";

type CustomFieldOps = {
  add: (blank: BiodataCustomField) => void;
  update: (id: string, patch: Partial<Pick<BiodataCustomField, "label" | "value">>) => void;
  remove: (id: string) => void;
};

type CustomSectionOps = {
  add: (blank: BiodataCustomSection) => void;
  update: (id: string, patch: Partial<Pick<BiodataCustomSection, "title">>) => void;
  remove: (id: string) => void;
};

const CUSTOM_PREFIX = "custom:";

function CustomFieldsBlock({ sectionId, fields, ops }: { sectionId: string; fields: BiodataCustomField[]; ops: CustomFieldOps }) {
  return (
    <>
      {fields.map((field, index) => (
        <SelectableEntry sectionId={sectionId} fieldKey={`${CUSTOM_PREFIX}${field.id}`} key={field.id}>
          <div className="resbuild-entry-head">
            <strong>Custom field {index + 1}</strong>
          </div>
          <div className="resbuild-grid-2">
            <Field label="Field name">
              <input value={field.label} onChange={(e) => ops.update(field.id, { label: e.target.value })} placeholder="Monthly income" />
            </Field>
            <Field label="Value">
              <input value={field.value} onChange={(e) => ops.update(field.id, { value: e.target.value })} placeholder="45,000" />
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

export default function BiodataFormFields({
  data,
  setField,
  customFieldOps,
  customSectionOps,
}: {
  data: BiodataData;
  setField: <K extends keyof BiodataData>(key: K, value: BiodataData[K]) => void;
  customFieldOps: CustomFieldOps;
  customSectionOps: CustomSectionOps;
}) {
  const isMatrimonial = data.template !== "simple";
  const customFields = data.customFields || [];
  const customSections = data.customSections || [];
  const hiddenFields = data.hiddenFields || [];
  const hiddenSections = data.hiddenSections || [];
  const fieldsFor = (section: string) => customFields.filter((field) => field.section === section);
  const isHidden = (key: string) => hiddenFields.includes(key);
  const isSectionHidden = (id: BiodataSectionId) => hiddenSections.includes(id);

  // A section's own remove icon handles three cases depending on what was
  // selected inside it: the section heading itself (hide the whole
  // section), a custom field (delete it outright), or a built-in field
  // (hide just that one).
  function removeFromSection(sectionId: BiodataSectionId, fieldKey: string | null) {
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
          <div className="resbuild-field">
            <span>Photo</span>
            <PhotoUploadField photo={data.photo} onChange={(dataUrl) => setField("photo", dataUrl)} />
          </div>
          <div className="resbuild-grid-2">
            <SelectableField sectionId="personal" fieldKey="fullName" label="Full name"><input value={data.fullName} onChange={(e) => setField("fullName", e.target.value)} placeholder="Priya Sharma" /></SelectableField>
            {!isHidden("dob") ? <SelectableField sectionId="personal" fieldKey="dob" label="Date of birth"><input value={data.dob} onChange={(e) => setField("dob", e.target.value)} placeholder="12 Jun 1998" /></SelectableField> : null}
            {!isHidden("gender") ? <SelectableField sectionId="personal" fieldKey="gender" label="Gender"><input value={data.gender} onChange={(e) => setField("gender", e.target.value)} placeholder="Female" /></SelectableField> : null}
            {isMatrimonial && !isHidden("maritalStatus") ? <SelectableField sectionId="personal" fieldKey="maritalStatus" label="Marital status"><input value={data.maritalStatus} onChange={(e) => setField("maritalStatus", e.target.value)} placeholder="Never Married" /></SelectableField> : null}
            {isMatrimonial && !isHidden("height") ? <SelectableField sectionId="personal" fieldKey="height" label="Height"><input value={data.height} onChange={(e) => setField("height", e.target.value)} placeholder="5'4&quot;" /></SelectableField> : null}
            {isMatrimonial && !isHidden("complexion") ? <SelectableField sectionId="personal" fieldKey="complexion" label="Complexion"><input value={data.complexion} onChange={(e) => setField("complexion", e.target.value)} placeholder="Fair" /></SelectableField> : null}
            {!isHidden("religion") ? <SelectableField sectionId="personal" fieldKey="religion" label="Religion"><input value={data.religion} onChange={(e) => setField("religion", e.target.value)} placeholder="Hindu" /></SelectableField> : null}
            {!isHidden("caste") ? <SelectableField sectionId="personal" fieldKey="caste" label="Caste"><input value={data.caste} onChange={(e) => setField("caste", e.target.value)} placeholder="Brahmin" /></SelectableField> : null}
            {isMatrimonial && !isHidden("gotra") ? <SelectableField sectionId="personal" fieldKey="gotra" label="Gotra"><input value={data.gotra} onChange={(e) => setField("gotra", e.target.value)} placeholder="Kashyap" /></SelectableField> : null}
            {isMatrimonial && !isHidden("rashi") ? <SelectableField sectionId="personal" fieldKey="rashi" label="Rashi / Nakshatra"><input value={data.rashi} onChange={(e) => setField("rashi", e.target.value)} placeholder="Mithuna (Gemini)" /></SelectableField> : null}
          </div>
          <CustomFieldsBlock sectionId="personal" fields={fieldsFor("personal")} ops={customFieldOps} />
        </SelectableSection>
      ) : null}

      {!isSectionHidden("education") ? (
        <SelectableSection sectionId="education" title="Education & occupation" onRemove={(key) => removeFromSection("education", key)}>
          <div className="resbuild-grid-2">
            {!isHidden("education") ? <SelectableField sectionId="education" fieldKey="education" label="Education"><input value={data.education} onChange={(e) => setField("education", e.target.value)} placeholder="M.Com, Pune University" /></SelectableField> : null}
            {!isHidden("occupation") ? <SelectableField sectionId="education" fieldKey="occupation" label="Occupation"><input value={data.occupation} onChange={(e) => setField("occupation", e.target.value)} placeholder="Bank Officer, HDFC Bank" /></SelectableField> : null}
            {isMatrimonial && !isHidden("annualIncome") ? <SelectableField sectionId="education" fieldKey="annualIncome" label="Annual income"><input value={data.annualIncome} onChange={(e) => setField("annualIncome", e.target.value)} placeholder="6,00,000" /></SelectableField> : null}
          </div>
          <CustomFieldsBlock sectionId="education" fields={fieldsFor("education")} ops={customFieldOps} />
        </SelectableSection>
      ) : null}

      {isMatrimonial && !isSectionHidden("family") ? (
        <SelectableSection sectionId="family" title="Family details" onRemove={(key) => removeFromSection("family", key)}>
          <div className="resbuild-grid-2">
            {!isHidden("fatherName") ? <SelectableField sectionId="family" fieldKey="fatherName" label="Father's name"><input value={data.fatherName} onChange={(e) => setField("fatherName", e.target.value)} placeholder="Ramesh Sharma" /></SelectableField> : null}
            {!isHidden("fatherOccupation") ? <SelectableField sectionId="family" fieldKey="fatherOccupation" label="Father's occupation"><input value={data.fatherOccupation} onChange={(e) => setField("fatherOccupation", e.target.value)} placeholder="Retired Govt. Employee" /></SelectableField> : null}
            {!isHidden("motherName") ? <SelectableField sectionId="family" fieldKey="motherName" label="Mother's name"><input value={data.motherName} onChange={(e) => setField("motherName", e.target.value)} placeholder="Sunita Sharma" /></SelectableField> : null}
            {!isHidden("motherOccupation") ? <SelectableField sectionId="family" fieldKey="motherOccupation" label="Mother's occupation"><input value={data.motherOccupation} onChange={(e) => setField("motherOccupation", e.target.value)} placeholder="Homemaker" /></SelectableField> : null}
          </div>
          {!isHidden("siblings") ? <SelectableField sectionId="family" fieldKey="siblings" label="Siblings"><input value={data.siblings} onChange={(e) => setField("siblings", e.target.value)} placeholder="1 elder brother (married)" /></SelectableField> : null}
          <CustomFieldsBlock sectionId="family" fields={fieldsFor("family")} ops={customFieldOps} />
        </SelectableSection>
      ) : null}

      {!isSectionHidden("contact") ? (
        <SelectableSection sectionId="contact" title="Contact details" onRemove={(key) => removeFromSection("contact", key)}>
          <div className="resbuild-grid-2">
            {!isHidden("phone") ? <SelectableField sectionId="contact" fieldKey="phone" label="Phone"><input value={data.phone} onChange={(e) => setField("phone", e.target.value)} placeholder="+91 98765 43210" /></SelectableField> : null}
            {!isHidden("email") ? <SelectableField sectionId="contact" fieldKey="email" label="Email"><input value={data.email} onChange={(e) => setField("email", e.target.value)} placeholder="priya.sharma@email.com" /></SelectableField> : null}
            {!isHidden("nativePlace") ? <SelectableField sectionId="contact" fieldKey="nativePlace" label="Native place"><input value={data.nativePlace} onChange={(e) => setField("nativePlace", e.target.value)} placeholder="Pune, Maharashtra" /></SelectableField> : null}
          </div>
          {!isHidden("currentAddress") ? <SelectableField sectionId="contact" fieldKey="currentAddress" label="Current address"><textarea rows={2} value={data.currentAddress} onChange={(e) => setField("currentAddress", e.target.value)} placeholder="Flat 302, Shree Residency, Kothrud, Pune - 411038" /></SelectableField> : null}
          {!isHidden("permanentAddress") ? <SelectableField sectionId="contact" fieldKey="permanentAddress" label="Permanent address"><textarea rows={2} value={data.permanentAddress} onChange={(e) => setField("permanentAddress", e.target.value)} placeholder="Same as current address" /></SelectableField> : null}
          <CustomFieldsBlock sectionId="contact" fields={fieldsFor("contact")} ops={customFieldOps} />
        </SelectableSection>
      ) : null}

      {isMatrimonial && !isSectionHidden("hobbies") ? (
        <SelectableSection sectionId="hobbies" title="Hobbies & interests" onRemove={(key) => removeFromSection("hobbies", key)}>
          {!isHidden("hobbies") ? <SelectableField sectionId="hobbies" fieldKey="hobbies" label="Comma-separated"><input value={data.hobbies} onChange={(e) => setField("hobbies", e.target.value)} placeholder="Classical music, reading, cooking" /></SelectableField> : null}
          <CustomFieldsBlock sectionId="hobbies" fields={fieldsFor("hobbies")} ops={customFieldOps} />
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
              placeholder="Section title (e.g. References)"
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
