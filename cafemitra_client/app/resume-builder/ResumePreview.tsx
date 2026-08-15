import { certHasContent, dateRange, eduHasContent, expHasContent, projHasContent, type ResumeData } from "./resumeModel";

export function ResumePreviewPage({ resume }: { resume: ResumeData }) {
  const skillsList = resume.skills.split(",").map((s) => s.trim()).filter(Boolean);
  const contactParts = [resume.email, resume.phone, resume.location, resume.linkedin, resume.website].map((s) => s.trim()).filter(Boolean);

  return (
    <div className={`resbuild-page resbuild-tpl-${resume.template}`}>
      {resume.template === "sidebar" || resume.template === "sidebar-right" ? (
        <SidebarPreview resume={resume} contactParts={contactParts} skillsList={skillsList} />
      ) : (
        <SingleColumnPreview resume={resume} contactParts={contactParts} skillsList={skillsList} />
      )}
    </div>
  );
}

export function SingleColumnPreview({ resume, contactParts, skillsList }: { resume: ResumeData; contactParts: string[]; skillsList: string[] }) {
  return (
    <>
      <header>
        <h1>{resume.fullName || "Your Name"}</h1>
        {resume.role ? <p className="role">{resume.role}</p> : null}
        {contactParts.length ? <p className="contact">{contactParts.join("  |  ")}</p> : null}
      </header>
      <hr />
      {resume.summary ? (
        <section>
          <h2>Summary</h2>
          <p>{resume.summary}</p>
        </section>
      ) : null}
      {skillsList.length ? (
        <section>
          <h2>Skills</h2>
          <div className="resbuild-skills-preview">{skillsList.map((skill) => <span className="resbuild-chip" key={skill}>{skill}</span>)}</div>
        </section>
      ) : null}
      {resume.experience.some(expHasContent) ? (
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
        </section>
      ) : null}
      {resume.education.some(eduHasContent) ? (
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
        </section>
      ) : null}
      {resume.projects.some(projHasContent) ? (
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
        </section>
      ) : null}
      {resume.certifications.some(certHasContent) ? (
        <section>
          <h2>Certifications</h2>
          {resume.certifications.filter(certHasContent).map((cert) => (
            <p className="entry-sub" key={cert.id}>{[cert.name, cert.issuer, cert.year].filter(Boolean).join(" - ")}</p>
          ))}
        </section>
      ) : null}
    </>
  );
}

export function SidebarPreview({ resume, contactParts, skillsList }: { resume: ResumeData; contactParts: string[]; skillsList: string[] }) {
  return (
    <div className="resbuild-sidebar-layout">
      <aside className="resbuild-sidebar-col">
        <div className="resbuild-sidebar-photo">
          {resume.photo ? <img src={resume.photo} alt="" /> : <span className="resbuild-sidebar-photo-placeholder">{initials(resume.fullName)}</span>}
        </div>
        {contactParts.length ? (
          <div className="resbuild-sidebar-block">
            <h3>Contact</h3>
            <ul>{contactParts.map((part) => <li key={part}>{part}</li>)}</ul>
          </div>
        ) : null}
        {skillsList.length ? (
          <div className="resbuild-sidebar-block">
            <h3>Skills</h3>
            <ul>{skillsList.map((skill) => <li key={skill}>{skill}</li>)}</ul>
          </div>
        ) : null}
      </aside>
      <div className="resbuild-sidebar-main">
        <h1>{resume.fullName || "Your Name"}</h1>
        {resume.role ? <p className="resbuild-sidebar-role">{resume.role}</p> : null}
        {resume.summary ? (
          <section>
            <h2>Profile</h2>
            <p>{resume.summary}</p>
          </section>
        ) : null}
        {resume.experience.some(expHasContent) ? (
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
          </section>
        ) : null}
        {resume.education.some(eduHasContent) ? (
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
          </section>
        ) : null}
        {resume.projects.some(projHasContent) ? (
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
          </section>
        ) : null}
        {resume.certifications.some(certHasContent) ? (
          <section>
            <h2>Certifications</h2>
            {resume.certifications.filter(certHasContent).map((cert) => (
              <p className="entry-sub" key={cert.id}>{[cert.name, cert.issuer, cert.year].filter(Boolean).join(" - ")}</p>
            ))}
          </section>
        ) : null}
      </div>
    </div>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("");
}
