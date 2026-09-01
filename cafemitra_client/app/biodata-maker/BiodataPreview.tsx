"use client";

import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { BiodataData, BiodataSectionId } from "./biodataModel";

function Row({ label, value, hidden }: { label: string; value: string; hidden?: boolean }) {
  if (hidden || !value.trim()) return null;
  return (
    <div className="biodata-row">
      <span className="biodata-row-label">{label}</span>
      <span className="biodata-row-value">{value}</span>
    </div>
  );
}

function CustomRows({ data, section }: { data: BiodataData; section: string }) {
  const fields = (data.customFields || []).filter((field) => field.section === section);
  return <>{fields.map((field) => <Row key={field.id} label={field.label || "Field"} value={field.value} />)}</>;
}

function BiodataHeaderBlock({ data, isMatrimonial, hiddenFields }: { data: BiodataData; isMatrimonial: boolean; hiddenFields: string[] }) {
  const fullName = hiddenFields.includes("fullName") ? "" : data.fullName;
  return (
    <header className="biodata-header">
      <div className="biodata-photo">
        {data.photo ? <img src={data.photo} alt="" /> : <span className="biodata-photo-placeholder">Photo</span>}
      </div>
      <div className="biodata-header-copy">
        <h1>{fullName || "Your Name"}</h1>
        {isMatrimonial ? <p className="biodata-header-tag">{[data.religion, data.caste].filter(Boolean).join(" - ") || "Biodata for Marriage"}</p> : null}
      </div>
    </header>
  );
}

type SectionEntry = { key: string; node: ReactNode };

function buildRedBeigeSections(data: BiodataData, isMatrimonial: boolean, hiddenFields: string[], hiddenSections: BiodataSectionId[]): SectionEntry[] {
  const customFields = data.customFields || [];
  const sections: SectionEntry[] = [];
  const hf = (key: string) => hiddenFields.includes(key);

  if (!hiddenSections.includes("personal")) {
    sections.push({
      key: "personal",
      node: (
        <section className="biodata-section-personal">
          <h2>Personal Details</h2>
          <Row label="Full Name" value={data.fullName} hidden={hf("fullName")} />
          <Row label="Date of Birth" value={data.dob} hidden={hf("dob")} />
          <Row label="Gender" value={data.gender} hidden={hf("gender")} />
          {isMatrimonial ? <Row label="Marital Status" value={data.maritalStatus} hidden={hf("maritalStatus")} /> : null}
          {isMatrimonial ? <Row label="Height" value={data.height} hidden={hf("height")} /> : null}
          {isMatrimonial ? <Row label="Complexion" value={data.complexion} hidden={hf("complexion")} /> : null}
          <Row label="Religion" value={data.religion} hidden={hf("religion")} />
          <Row label="Caste" value={data.caste} hidden={hf("caste")} />
          {isMatrimonial ? <Row label="Gotra" value={data.gotra} hidden={hf("gotra")} /> : null}
          {isMatrimonial ? <Row label="Rashi / Nakshatra" value={data.rashi} hidden={hf("rashi")} /> : null}
          <CustomRows data={data} section="personal" />
        </section>
      ),
    });
  }

  if (!hiddenSections.includes("education")) {
    sections.push({
      key: "education",
      node: (
        <section className="biodata-section-education">
          <h2>Education &amp; Occupation</h2>
          <Row label="Education" value={data.education} hidden={hf("education")} />
          <Row label="Occupation" value={data.occupation} hidden={hf("occupation")} />
          {isMatrimonial ? <Row label="Annual Income" value={data.annualIncome} hidden={hf("annualIncome")} /> : null}
          <CustomRows data={data} section="education" />
        </section>
      ),
    });
  }

  if (isMatrimonial && !hiddenSections.includes("family") && (data.fatherName.trim() || data.motherName.trim() || data.siblings.trim() || customFields.some((field) => field.section === "family"))) {
    sections.push({
      key: "family",
      node: (
        <section>
          <h2>Family Details</h2>
          <Row label="Father's Name" value={data.fatherName} hidden={hf("fatherName")} />
          <Row label="Father's Occupation" value={data.fatherOccupation} hidden={hf("fatherOccupation")} />
          <Row label="Mother's Name" value={data.motherName} hidden={hf("motherName")} />
          <Row label="Mother's Occupation" value={data.motherOccupation} hidden={hf("motherOccupation")} />
          <Row label="Siblings" value={data.siblings} hidden={hf("siblings")} />
          <CustomRows data={data} section="family" />
        </section>
      ),
    });
  }

  if (!hiddenSections.includes("contact")) {
    sections.push({
      key: "contact",
      node: (
        <section>
          <h2>Contact Details</h2>
          <Row label="Phone" value={data.phone} hidden={hf("phone")} />
          <Row label="Email" value={data.email} hidden={hf("email")} />
          <Row label="Native Place" value={data.nativePlace} hidden={hf("nativePlace")} />
          <Row label="Current Address" value={data.currentAddress} hidden={hf("currentAddress")} />
          <Row label="Permanent Address" value={data.permanentAddress} hidden={hf("permanentAddress")} />
          <CustomRows data={data} section="contact" />
        </section>
      ),
    });
  }

  if (isMatrimonial && !hiddenSections.includes("hobbies") && (data.hobbies.trim() || customFields.some((field) => field.section === "hobbies"))) {
    sections.push({
      key: "hobbies",
      node: (
        <section>
          <h2>Hobbies &amp; Interests</h2>
          {data.hobbies.trim() && !hf("hobbies") ? <p className="biodata-freetext">{data.hobbies}</p> : null}
          <CustomRows data={data} section="hobbies" />
        </section>
      ),
    });
  }

  (data.customSections || []).forEach((section) => {
    const fields = customFields.filter((field) => field.section === section.id);
    if (!fields.length) return;
    sections.push({
      key: `custom-${section.id}`,
      node: (
        <section>
          <h2>{section.title || "Additional Details"}</h2>
          {fields.map((field) => <Row key={field.id} label={field.label || "Field"} value={field.value} />)}
        </section>
      ),
    });
  });

  return sections;
}

// Red & Beige's page is a real A4 illustration at a fixed aspect-ratio, so
// (unlike every other template, which just grows taller as content is added)
// content that overflows the printed page's height needs to spill onto a
// second page - the same continuation page the PDF download already draws
// with page2.jpg. This measures each section's rendered height off-screen
// and splits the section list across two ".biodata-page" elements to match,
// so the on-screen preview never shows text running past the page art.
function RedBeigePaginatedPreview({ data, isMatrimonial, hiddenFields, hiddenSections }: { data: BiodataData; isMatrimonial: boolean; hiddenFields: string[]; hiddenSections: BiodataSectionId[] }) {
  const sections = useMemo(() => buildRedBeigeSections(data, isMatrimonial, hiddenFields, hiddenSections), [data, isMatrimonial, hiddenFields, hiddenSections]);
  const pageRef = useRef<HTMLDivElement>(null);
  const measureRefs = useRef(new Map<string, HTMLElement>());
  const [splitIndex, setSplitIndex] = useState(sections.length);

  useLayoutEffect(() => {
    const pageEl = pageRef.current;
    if (!pageEl) return;
    const style = getComputedStyle(pageEl);
    const available = pageEl.clientHeight - parseFloat(style.paddingTop || "0") - parseFloat(style.paddingBottom || "0");
    let used = 0;
    let idx = sections.length;
    for (let i = 0; i < sections.length; i++) {
      const el = measureRefs.current.get(sections[i].key);
      const h = el ? el.offsetHeight : 0;
      // i > 0 guards against an empty page 1 if a single section is somehow
      // taller than the whole page - it still overflows visually, but at
      // least stays put rather than leaving page 1 blank.
      if (i > 0 && used + h > available) {
        idx = i;
        break;
      }
      used += h;
    }
    setSplitIndex((prev) => (prev === idx ? prev : idx));
  }, [sections]);

  const page1 = sections.slice(0, splitIndex);
  const page2 = sections.slice(splitIndex);

  return (
    <>
      <div aria-hidden style={{ height: 0, overflow: "hidden", visibility: "hidden" }}>
        <div className="biodata-page biodata-tpl-redbeige" style={{ width: "100%" }}>
          {sections.map((s) => (
            // display:flow-root stops the section's own margin-bottom from
            // collapsing through this wrapper, so offsetHeight below actually
            // includes the gap to the next section instead of undercounting it.
            <div key={s.key} style={{ display: "flow-root" }} ref={(el) => { if (el) measureRefs.current.set(s.key, el); }}>
              {s.node}
            </div>
          ))}
        </div>
      </div>

      <div className="biodata-page-stack">
        <div className="biodata-page biodata-tpl-redbeige" ref={pageRef}>
          <BiodataHeaderBlock data={data} isMatrimonial={isMatrimonial} hiddenFields={hiddenFields} />
          {page1.map((s) => <div key={s.key} style={{ display: "flow-root" }}>{s.node}</div>)}
        </div>
        {page2.length > 0 ? (
          <div className="biodata-page biodata-tpl-redbeige biodata-page-cont">
            {page2.map((s) => <div key={s.key} style={{ display: "flow-root" }}>{s.node}</div>)}
          </div>
        ) : null}
      </div>
    </>
  );
}

export function BiodataPreviewPage({ data }: { data: BiodataData }) {
  const isMatrimonial = data.template !== "simple";
  const hiddenFields = data.hiddenFields || [];
  const hiddenSections = data.hiddenSections || [];
  const hf = (key: string) => hiddenFields.includes(key);

  if (data.template === "redbeige") {
    return <RedBeigePaginatedPreview data={data} isMatrimonial={isMatrimonial} hiddenFields={hiddenFields} hiddenSections={hiddenSections} />;
  }

  return (
    <div className={`biodata-page biodata-tpl-${data.template}`}>
      <BiodataHeaderBlock data={data} isMatrimonial={isMatrimonial} hiddenFields={hiddenFields} />

      {!hiddenSections.includes("personal") ? (
        <section>
          <h2>Personal Details</h2>
          <Row label="Date of Birth" value={data.dob} hidden={hf("dob")} />
          <Row label="Gender" value={data.gender} hidden={hf("gender")} />
          {isMatrimonial ? <Row label="Marital Status" value={data.maritalStatus} hidden={hf("maritalStatus")} /> : null}
          {isMatrimonial ? <Row label="Height" value={data.height} hidden={hf("height")} /> : null}
          {isMatrimonial ? <Row label="Complexion" value={data.complexion} hidden={hf("complexion")} /> : null}
          <Row label="Religion" value={data.religion} hidden={hf("religion")} />
          <Row label="Caste" value={data.caste} hidden={hf("caste")} />
          {isMatrimonial ? <Row label="Gotra" value={data.gotra} hidden={hf("gotra")} /> : null}
          {isMatrimonial ? <Row label="Rashi / Nakshatra" value={data.rashi} hidden={hf("rashi")} /> : null}
          <CustomRows data={data} section="personal" />
        </section>
      ) : null}

      {!hiddenSections.includes("education") ? (
        <section>
          <h2>Education &amp; Occupation</h2>
          <Row label="Education" value={data.education} hidden={hf("education")} />
          <Row label="Occupation" value={data.occupation} hidden={hf("occupation")} />
          {isMatrimonial ? <Row label="Annual Income" value={data.annualIncome} hidden={hf("annualIncome")} /> : null}
          <CustomRows data={data} section="education" />
        </section>
      ) : null}

      {isMatrimonial && !hiddenSections.includes("family") && (data.fatherName.trim() || data.motherName.trim() || data.siblings.trim() || (data.customFields || []).some((field) => field.section === "family")) ? (
        <section>
          <h2>Family Details</h2>
          <Row label="Father's Name" value={data.fatherName} hidden={hf("fatherName")} />
          <Row label="Father's Occupation" value={data.fatherOccupation} hidden={hf("fatherOccupation")} />
          <Row label="Mother's Name" value={data.motherName} hidden={hf("motherName")} />
          <Row label="Mother's Occupation" value={data.motherOccupation} hidden={hf("motherOccupation")} />
          <Row label="Siblings" value={data.siblings} hidden={hf("siblings")} />
          <CustomRows data={data} section="family" />
        </section>
      ) : null}

      {!hiddenSections.includes("contact") ? (
        <section>
          <h2>Contact Details</h2>
          <Row label="Phone" value={data.phone} hidden={hf("phone")} />
          <Row label="Email" value={data.email} hidden={hf("email")} />
          <Row label="Native Place" value={data.nativePlace} hidden={hf("nativePlace")} />
          <Row label="Current Address" value={data.currentAddress} hidden={hf("currentAddress")} />
          <Row label="Permanent Address" value={data.permanentAddress} hidden={hf("permanentAddress")} />
          <CustomRows data={data} section="contact" />
        </section>
      ) : null}

      {isMatrimonial && !hiddenSections.includes("hobbies") && (data.hobbies.trim() || (data.customFields || []).some((field) => field.section === "hobbies")) ? (
        <section>
          <h2>Hobbies &amp; Interests</h2>
          {data.hobbies.trim() && !hf("hobbies") ? <p className="biodata-freetext">{data.hobbies}</p> : null}
          <CustomRows data={data} section="hobbies" />
        </section>
      ) : null}

      {(data.customSections || []).map((section) => {
        const fields = (data.customFields || []).filter((field) => field.section === section.id);
        if (!fields.length) return null;
        return (
          <section key={section.id}>
            <h2>{section.title || "Additional Details"}</h2>
            {fields.map((field) => <Row key={field.id} label={field.label || "Field"} value={field.value} />)}
          </section>
        );
      })}
    </div>
  );
}
