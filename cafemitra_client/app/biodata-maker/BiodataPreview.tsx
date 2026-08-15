import type { BiodataData } from "./biodataModel";

function Row({ label, value }: { label: string; value: string }) {
  if (!value.trim()) return null;
  return (
    <div className="biodata-row">
      <span className="biodata-row-label">{label}</span>
      <span className="biodata-row-value">{value}</span>
    </div>
  );
}

export function BiodataPreviewPage({ data }: { data: BiodataData }) {
  const isMatrimonial = data.template !== "simple";

  return (
    <div className={`biodata-page biodata-tpl-${data.template}`}>
      <header className="biodata-header">
        <div className="biodata-photo">
          {data.photo ? <img src={data.photo} alt="" /> : <span className="biodata-photo-placeholder">Photo</span>}
        </div>
        <div className="biodata-header-copy">
          <h1>{data.fullName || "Your Name"}</h1>
          {isMatrimonial ? <p className="biodata-header-tag">{[data.religion, data.caste].filter(Boolean).join(" - ") || "Biodata for Marriage"}</p> : null}
        </div>
      </header>

      <section>
        <h2>Personal Details</h2>
        <Row label="Date of Birth" value={data.dob} />
        <Row label="Gender" value={data.gender} />
        {isMatrimonial ? <Row label="Marital Status" value={data.maritalStatus} /> : null}
        {isMatrimonial ? <Row label="Height" value={data.height} /> : null}
        {isMatrimonial ? <Row label="Complexion" value={data.complexion} /> : null}
        <Row label="Religion" value={data.religion} />
        <Row label="Caste" value={data.caste} />
        {isMatrimonial ? <Row label="Gotra" value={data.gotra} /> : null}
        {isMatrimonial ? <Row label="Rashi / Nakshatra" value={data.rashi} /> : null}
      </section>

      <section>
        <h2>Education &amp; Occupation</h2>
        <Row label="Education" value={data.education} />
        <Row label="Occupation" value={data.occupation} />
        {isMatrimonial ? <Row label="Annual Income" value={data.annualIncome} /> : null}
      </section>

      {isMatrimonial && (data.fatherName.trim() || data.motherName.trim() || data.siblings.trim()) ? (
        <section>
          <h2>Family Details</h2>
          <Row label="Father's Name" value={data.fatherName} />
          <Row label="Father's Occupation" value={data.fatherOccupation} />
          <Row label="Mother's Name" value={data.motherName} />
          <Row label="Mother's Occupation" value={data.motherOccupation} />
          <Row label="Siblings" value={data.siblings} />
        </section>
      ) : null}

      <section>
        <h2>Contact Details</h2>
        <Row label="Phone" value={data.phone} />
        <Row label="Email" value={data.email} />
        <Row label="Native Place" value={data.nativePlace} />
        <Row label="Current Address" value={data.currentAddress} />
        <Row label="Permanent Address" value={data.permanentAddress} />
      </section>

      {isMatrimonial && data.hobbies.trim() ? (
        <section>
          <h2>Hobbies &amp; Interests</h2>
          <p className="biodata-freetext">{data.hobbies}</p>
        </section>
      ) : null}
    </div>
  );
}
