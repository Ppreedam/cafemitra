"use client";

import PhotoUploadField from "../resume-builder/build/PhotoUploadField";
import { Field } from "../resume-builder/ResumeFormFields";
import type { BiodataData } from "./biodataModel";

export default function BiodataFormFields({
  data,
  setField,
}: {
  data: BiodataData;
  setField: <K extends keyof BiodataData>(key: K, value: BiodataData[K]) => void;
}) {
  const isMatrimonial = data.template !== "simple";

  return (
    <>
      <fieldset className="resbuild-section">
        <h2>Personal details</h2>
        <div className="resbuild-field">
          <span>Photo</span>
          <PhotoUploadField photo={data.photo} onChange={(dataUrl) => setField("photo", dataUrl)} />
        </div>
        <div className="resbuild-grid-2">
          <Field label="Full name"><input value={data.fullName} onChange={(e) => setField("fullName", e.target.value)} placeholder="Priya Sharma" /></Field>
          <Field label="Date of birth"><input value={data.dob} onChange={(e) => setField("dob", e.target.value)} placeholder="12 Jun 1998" /></Field>
          <Field label="Gender"><input value={data.gender} onChange={(e) => setField("gender", e.target.value)} placeholder="Female" /></Field>
          {isMatrimonial ? <Field label="Marital status"><input value={data.maritalStatus} onChange={(e) => setField("maritalStatus", e.target.value)} placeholder="Never Married" /></Field> : null}
          {isMatrimonial ? <Field label="Height"><input value={data.height} onChange={(e) => setField("height", e.target.value)} placeholder="5'4&quot;" /></Field> : null}
          {isMatrimonial ? <Field label="Complexion"><input value={data.complexion} onChange={(e) => setField("complexion", e.target.value)} placeholder="Fair" /></Field> : null}
          <Field label="Religion"><input value={data.religion} onChange={(e) => setField("religion", e.target.value)} placeholder="Hindu" /></Field>
          <Field label="Caste"><input value={data.caste} onChange={(e) => setField("caste", e.target.value)} placeholder="Brahmin" /></Field>
          {isMatrimonial ? <Field label="Gotra"><input value={data.gotra} onChange={(e) => setField("gotra", e.target.value)} placeholder="Kashyap" /></Field> : null}
          {isMatrimonial ? <Field label="Rashi / Nakshatra"><input value={data.rashi} onChange={(e) => setField("rashi", e.target.value)} placeholder="Mithuna (Gemini)" /></Field> : null}
        </div>
      </fieldset>

      <fieldset className="resbuild-section">
        <h2>Education &amp; occupation</h2>
        <div className="resbuild-grid-2">
          <Field label="Education"><input value={data.education} onChange={(e) => setField("education", e.target.value)} placeholder="M.Com, Pune University" /></Field>
          <Field label="Occupation"><input value={data.occupation} onChange={(e) => setField("occupation", e.target.value)} placeholder="Bank Officer, HDFC Bank" /></Field>
          {isMatrimonial ? <Field label="Annual income"><input value={data.annualIncome} onChange={(e) => setField("annualIncome", e.target.value)} placeholder="6,00,000" /></Field> : null}
        </div>
      </fieldset>

      {isMatrimonial ? (
        <fieldset className="resbuild-section">
          <h2>Family details</h2>
          <div className="resbuild-grid-2">
            <Field label="Father's name"><input value={data.fatherName} onChange={(e) => setField("fatherName", e.target.value)} placeholder="Ramesh Sharma" /></Field>
            <Field label="Father's occupation"><input value={data.fatherOccupation} onChange={(e) => setField("fatherOccupation", e.target.value)} placeholder="Retired Govt. Employee" /></Field>
            <Field label="Mother's name"><input value={data.motherName} onChange={(e) => setField("motherName", e.target.value)} placeholder="Sunita Sharma" /></Field>
            <Field label="Mother's occupation"><input value={data.motherOccupation} onChange={(e) => setField("motherOccupation", e.target.value)} placeholder="Homemaker" /></Field>
          </div>
          <Field label="Siblings"><input value={data.siblings} onChange={(e) => setField("siblings", e.target.value)} placeholder="1 elder brother (married)" /></Field>
        </fieldset>
      ) : null}

      <fieldset className="resbuild-section">
        <h2>Contact details</h2>
        <div className="resbuild-grid-2">
          <Field label="Phone"><input value={data.phone} onChange={(e) => setField("phone", e.target.value)} placeholder="+91 98765 43210" /></Field>
          <Field label="Email"><input value={data.email} onChange={(e) => setField("email", e.target.value)} placeholder="priya.sharma@email.com" /></Field>
          <Field label="Native place"><input value={data.nativePlace} onChange={(e) => setField("nativePlace", e.target.value)} placeholder="Pune, Maharashtra" /></Field>
        </div>
        <Field label="Current address"><textarea rows={2} value={data.currentAddress} onChange={(e) => setField("currentAddress", e.target.value)} placeholder="Flat 302, Shree Residency, Kothrud, Pune - 411038" /></Field>
        <Field label="Permanent address"><textarea rows={2} value={data.permanentAddress} onChange={(e) => setField("permanentAddress", e.target.value)} placeholder="Same as current address" /></Field>
      </fieldset>

      {isMatrimonial ? (
        <fieldset className="resbuild-section">
          <h2>Hobbies &amp; interests</h2>
          <Field label="Comma-separated"><input value={data.hobbies} onChange={(e) => setField("hobbies", e.target.value)} placeholder="Classical music, reading, cooking" /></Field>
        </fieldset>
      ) : null}
    </>
  );
}
