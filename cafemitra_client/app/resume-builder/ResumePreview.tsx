import { certHasContent, dateRange, eduHasContent, expHasContent, projHasContent, type ResumeData, type ResumeSectionId } from "./resumeModel";

function CustomFieldRows({ resume, section }: { resume: ResumeData; section: string }) {
  const fields = (resume.customFields || []).filter((field) => field.section === section && field.value.trim());
  if (!fields.length) return null;
  return <>{fields.map((field) => <p className="entry-sub" key={field.id}>{field.label ? `${field.label}: ${field.value}` : field.value}</p>)}</>;
}

function CustomSectionsBlock({ resume }: { resume: ResumeData }) {
  return (
    <>
      {(resume.customSections || []).map((section) => {
        const fields = (resume.customFields || []).filter((field) => field.section === section.id && field.value.trim());
        if (!fields.length) return null;
        return (
          <section key={section.id}>
            <h2>{section.title || "Additional Details"}</h2>
            {fields.map((field) => <p className="entry-sub" key={field.id}>{field.label ? `${field.label}: ${field.value}` : field.value}</p>)}
          </section>
        );
      })}
    </>
  );
}

export function ResumePreviewPage({ resume }: { resume: ResumeData }) {
  const hiddenFields = resume.hiddenFields || [];
  const hf = (key: string) => hiddenFields.includes(key);
  const displayName = hf("fullName") ? "" : resume.fullName;
  const displayRole = hf("role") ? "" : resume.role;
  const skillsList = (hf("skills") ? "" : resume.skills).split(",").map((s) => s.trim()).filter(Boolean);
  const contactParts = [hf("email") ? "" : resume.email, hf("phone") ? "" : resume.phone, hf("location") ? "" : resume.location, hf("linkedin") ? "" : resume.linkedin, hf("website") ? "" : resume.website]
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className={`resbuild-page resbuild-tpl-${resume.template}`}>
      {resume.template === "sidebar" || resume.template === "sidebar-right" ? (
        <SidebarPreview resume={resume} contactParts={contactParts} skillsList={skillsList} displayName={displayName} displayRole={displayRole} />
      ) : (
        <SingleColumnPreview resume={resume} contactParts={contactParts} skillsList={skillsList} displayName={displayName} displayRole={displayRole} />
      )}
    </div>
  );
}

type PreviewProps = { resume: ResumeData; contactParts: string[]; skillsList: string[]; displayName: string; displayRole: string };

export function SingleColumnPreview({ resume, contactParts, skillsList, displayName, displayRole }: PreviewProps) {
  const hiddenFields = resume.hiddenFields || [];
  const hiddenSections = resume.hiddenSections || [];
  const hf = (key: string) => hiddenFields.includes(key);
  const hs = (id: ResumeSectionId) => hiddenSections.includes(id);
  const summaryText = hf("summary") ? "" : resume.summary;

  return (
    <>
      {!hs("personal") ? (
        <header>
          <h1>{displayName || "Your Name"}</h1>
          {displayRole ? <p className="role">{displayRole}</p> : null}
          {contactParts.length ? <p className="contact">{contactParts.join("  |  ")}</p> : null}
          <CustomFieldRows resume={resume} section="personal" />
        </header>
      ) : null}
      <hr />
      {!hs("summary") && (summaryText || (resume.customFields || []).some((field) => field.section === "summary" && field.value.trim())) ? (
        <section>
          <h2>Summary</h2>
          {summaryText ? <p>{summaryText}</p> : null}
          <CustomFieldRows resume={resume} section="summary" />
        </section>
      ) : null}
      {!hs("skills") && (skillsList.length || (resume.customFields || []).some((field) => field.section === "skills" && field.value.trim())) ? (
        <section>
          <h2>Skills</h2>
          {skillsList.length ? <div className="resbuild-skills-preview">{skillsList.map((skill) => <span className="resbuild-chip" key={skill}>{skill}</span>)}</div> : null}
          <CustomFieldRows resume={resume} section="skills" />
        </section>
      ) : null}
      {!hs("experience") && (resume.experience.some(expHasContent) || (resume.customFields || []).some((field) => field.section === "experience" && field.value.trim())) ? (
        <section>
          <h2>Experience</h2>
          {resume.experience.filter(expHasContent).map((exp) => (
            <div className="entry" key={exp.id}>
              <div className="entry-head">
                <strong>{[exp.role, exp.company].filter(Boolean).join(" - ")}</strong>
                <span>{dateRange(exp.start, exp.end, exp.current)}</span>
              </div>
              {exp.location ? <p className="entry-sub">{exp.location}</p> : null}
              {exp.bullets.trim() ? (
                <ul>{exp.bullets.split("\n").map((line) => line.trim()).filter(Boolean).map((line, i) => <li key={i}>{line}</li>)}</ul>
              ) : null}
            </div>
          ))}
          <CustomFieldRows resume={resume} section="experience" />
        </section>
      ) : null}
      {!hs("education") && (resume.education.some(eduHasContent) || (resume.customFields || []).some((field) => field.section === "education" && field.value.trim())) ? (
        <section>
          <h2>Education</h2>
          {resume.education.filter(eduHasContent).map((edu) => (
            <div className="entry" key={edu.id}>
              <div className="entry-head">
                <strong>{[edu.degree, edu.school].filter(Boolean).join(" - ")}</strong>
                <span>{dateRange(edu.start, edu.end, false)}</span>
              </div>
              {edu.score ? <p className="entry-sub">{edu.score}</p> : null}
            </div>
          ))}
          <CustomFieldRows resume={resume} section="education" />
        </section>
      ) : null}
      {!hs("projects") && (resume.projects.some(projHasContent) || (resume.customFields || []).some((field) => field.section === "projects" && field.value.trim())) ? (
        <section>
          <h2>Projects</h2>
          {resume.projects.filter(projHasContent).map((proj) => (
            <div className="entry" key={proj.id}>
              <div className="entry-head">
                <strong>{[proj.name, proj.stack].filter(Boolean).join(" - ")}</strong>
              </div>
              {proj.description ? <p className="entry-sub">{proj.description}</p> : null}
              {proj.link ? <p className="entry-sub">{proj.link}</p> : null}
            </div>
          ))}
          <CustomFieldRows resume={resume} section="projects" />
        </section>
      ) : null}
      {!hs("certifications") && (resume.certifications.some(certHasContent) || (resume.customFields || []).some((field) => field.section === "certifications" && field.value.trim())) ? (
        <section>
          <h2>Certifications</h2>
          {resume.certifications.filter(certHasContent).map((cert) => (
            <p className="entry-sub" key={cert.id}>{[cert.name, cert.issuer, cert.year].filter(Boolean).join(" - ")}</p>
          ))}
          <CustomFieldRows resume={resume} section="certifications" />
        </section>
      ) : null}
      <CustomSectionsBlock resume={resume} />
    </>
  );
}

export function SidebarPreview({ resume, contactParts, skillsList, displayName, displayRole }: PreviewProps) {
  const hiddenSections = resume.hiddenSections || [];
  const hiddenFields = resume.hiddenFields || [];
  const hf = (key: string) => hiddenFields.includes(key);
  const hs = (id: ResumeSectionId) => hiddenSections.includes(id);
  const summaryText = hf("summary") ? "" : resume.summary;

  return (
    <div className="resbuild-sidebar-layout">
      <aside className="resbuild-sidebar-col">
        <div className="resbuild-sidebar-photo">
          {resume.photo ? <img src={resume.photo} alt="" /> : <span className="resbuild-sidebar-photo-placeholder">{initials(displayName)}</span>}
        </div>
        {!hs("personal") && (contactParts.length || (resume.customFields || []).some((field) => field.section === "personal" && field.value.trim())) ? (
          <div className="resbuild-sidebar-block">
            <h3>Contact</h3>
            <ul>
              {contactParts.map((part) => <li key={part}>{part}</li>)}
              {(resume.customFields || []).filter((field) => field.section === "personal" && field.value.trim()).map((field) => (
                <li key={field.id}>{field.label ? `${field.label}: ${field.value}` : field.value}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {!hs("skills") && (skillsList.length || (resume.customFields || []).some((field) => field.section === "skills" && field.value.trim())) ? (
          <div className="resbuild-sidebar-block">
            <h3>Skills</h3>
            <ul>
              {skillsList.map((skill) => <li key={skill}>{skill}</li>)}
              {(resume.customFields || []).filter((field) => field.section === "skills" && field.value.trim()).map((field) => (
                <li key={field.id}>{field.label ? `${field.label}: ${field.value}` : field.value}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </aside>
      <div className="resbuild-sidebar-main">
        {!hs("personal") ? (
          <>
            <h1>{displayName || "Your Name"}</h1>
            {displayRole ? <p className="resbuild-sidebar-role">{displayRole}</p> : null}
          </>
        ) : null}
        {!hs("summary") && (summaryText || (resume.customFields || []).some((field) => field.section === "summary" && field.value.trim())) ? (
          <section>
            <h2>Profile</h2>
            {summaryText ? <p>{summaryText}</p> : null}
            <CustomFieldRows resume={resume} section="summary" />
          </section>
        ) : null}
        {!hs("experience") && (resume.experience.some(expHasContent) || (resume.customFields || []).some((field) => field.section === "experience" && field.value.trim())) ? (
          <section>
            <h2>Experience</h2>
            {resume.experience.filter(expHasContent).map((exp) => (
              <div className="entry" key={exp.id}>
                <div className="entry-head">
                  <strong>{[exp.role, exp.company].filter(Boolean).join(" - ")}</strong>
                  <span>{dateRange(exp.start, exp.end, exp.current)}</span>
                </div>
                {exp.location ? <p className="entry-sub">{exp.location}</p> : null}
                {exp.bullets.trim() ? (
                  <ul>{exp.bullets.split("\n").map((line) => line.trim()).filter(Boolean).map((line, i) => <li key={i}>{line}</li>)}</ul>
                ) : null}
              </div>
            ))}
            <CustomFieldRows resume={resume} section="experience" />
          </section>
        ) : null}
        {!hs("education") && (resume.education.some(eduHasContent) || (resume.customFields || []).some((field) => field.section === "education" && field.value.trim())) ? (
          <section>
            <h2>Education</h2>
            {resume.education.filter(eduHasContent).map((edu) => (
              <div className="entry" key={edu.id}>
                <div className="entry-head">
                  <strong>{[edu.degree, edu.school].filter(Boolean).join(" - ")}</strong>
                  <span>{dateRange(edu.start, edu.end, false)}</span>
                </div>
                {edu.score ? <p className="entry-sub">{edu.score}</p> : null}
              </div>
            ))}
            <CustomFieldRows resume={resume} section="education" />
          </section>
        ) : null}
        {!hs("projects") && (resume.projects.some(projHasContent) || (resume.customFields || []).some((field) => field.section === "projects" && field.value.trim())) ? (
          <section>
            <h2>Projects</h2>
            {resume.projects.filter(projHasContent).map((proj) => (
              <div className="entry" key={proj.id}>
                <div className="entry-head">
                  <strong>{[proj.name, proj.stack].filter(Boolean).join(" - ")}</strong>
                </div>
                {proj.description ? <p className="entry-sub">{proj.description}</p> : null}
                {proj.link ? <p className="entry-sub">{proj.link}</p> : null}
              </div>
            ))}
            <CustomFieldRows resume={resume} section="projects" />
          </section>
        ) : null}
        {!hs("certifications") && (resume.certifications.some(certHasContent) || (resume.customFields || []).some((field) => field.section === "certifications" && field.value.trim())) ? (
          <section>
            <h2>Certifications</h2>
            {resume.certifications.filter(certHasContent).map((cert) => (
              <p className="entry-sub" key={cert.id}>{[cert.name, cert.issuer, cert.year].filter(Boolean).join(" - ")}</p>
            ))}
            <CustomFieldRows resume={resume} section="certifications" />
          </section>
        ) : null}
        <CustomSectionsBlock resume={resume} />
      </div>
    </div>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("");
}
