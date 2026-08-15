import { safePdfText, wrapPdfText } from "../resume-builder/pdfBuilder";
import type { BiodataData } from "./biodataModel";
import type { BiodataTemplateId } from "./templates";

type RgbColor = ReturnType<typeof import("pdf-lib").rgb>;
type RgbFn = typeof import("pdf-lib").rgb;

function templateColors(id: BiodataTemplateId, rgb: RgbFn): { navy: RgbColor; text: RgbColor; muted: RgbColor; accent: RgbColor; line: RgbColor; band?: RgbColor; bandMuted?: RgbColor } {
  if (id === "modern") {
    return {
      navy: rgb(1, 1, 1),
      text: rgb(0.12, 0.16, 0.22),
      muted: rgb(0.4, 0.45, 0.52),
      accent: rgb(0.06, 0.47, 0.42),
      line: rgb(0.85, 0.9, 0.89),
      band: rgb(0.06, 0.29, 0.27),
      bandMuted: rgb(0.75, 0.9, 0.88),
    };
  }
  if (id === "simple") {
    return {
      navy: rgb(0.08, 0.08, 0.1),
      text: rgb(0.1, 0.1, 0.12),
      muted: rgb(0.42, 0.44, 0.48),
      accent: rgb(0.08, 0.08, 0.1),
      line: rgb(0.82, 0.83, 0.85),
    };
  }
  return {
    navy: rgb(0.04, 0.1, 0.29),
    text: rgb(0.1, 0.14, 0.22),
    muted: rgb(0.37, 0.42, 0.55),
    accent: rgb(0.15, 0.39, 0.92),
    line: rgb(0.82, 0.86, 0.93),
  };
}

export async function buildBiodataPdf(data: BiodataData) {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const c = templateColors(data.template, rgb);
  const pageSize: [number, number] = [595.28, 841.89];
  const margin = 54;
  const maxWidth = pageSize[0] - margin * 2;
  let page = pdf.addPage(pageSize);
  let y = pageSize[1] - margin;

  function ensure(space: number) {
    if (y - space >= margin) return;
    page = pdf.addPage(pageSize);
    y = pageSize[1] - margin;
  }

  function sectionHeading(label: string) {
    ensure(30);
    y -= 6;
    page.drawText(label.toUpperCase(), { x: margin, y, size: 10.5, font: bold, color: c.accent });
    y -= 5;
    page.drawLine({ start: { x: margin, y }, end: { x: pageSize[0] - margin, y }, thickness: 1, color: c.line });
    y -= 14;
  }

  function row(label: string, value: string) {
    if (!value.trim()) return;
    ensure(20);
    const labelWidth = 168;
    page.drawText(safePdfText(label), { x: margin, y, size: 10, font: bold, color: c.muted });
    const lines = wrapPdfText(value, maxWidth - labelWidth, regular, 10);
    lines.forEach((line, i) => {
      if (i > 0) ensure(15);
      page.drawText(safePdfText(line), { x: margin + labelWidth, y, size: 10, font: regular, color: c.text });
      y -= 15;
    });
  }

  const isMatrimonial = data.template !== "simple";
  const hasBand = data.template === "modern";

  // Header: photo + name + tagline
  const headerTop = y;
  const photoSize = 78;
  if (hasBand) {
    page.drawRectangle({ x: 0, y: pageSize[1] - 118, width: pageSize[0], height: 118, color: c.band });
    y = pageSize[1] - 118;
  }
  if (data.photo) {
    try {
      const base64 = data.photo.split(",")[1] || "";
      const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
      const image = data.photo.startsWith("data:image/png") ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
      const photoY = hasBand ? pageSize[1] - 20 - photoSize : headerTop - photoSize;
      page.drawImage(image, { x: margin, y: photoY, width: photoSize, height: photoSize });
    } catch {
      // Skip a photo that fails to decode rather than failing the whole download.
    }
  }
  const nameX = margin + (data.photo ? photoSize + 20 : 0);
  const nameColor = hasBand ? rgb(1, 1, 1) : c.navy;
  const tagColor = hasBand ? (c.bandMuted || c.accent) : c.accent;
  const nameY = hasBand ? pageSize[1] - 55 : headerTop - 26;
  page.drawText(safePdfText(data.fullName || "Your Name"), { x: nameX, y: nameY, size: 22, font: bold, color: nameColor });
  if (isMatrimonial) {
    const tag = [data.religion, data.caste].filter(Boolean).join(" - ") || "Biodata for Marriage";
    page.drawText(safePdfText(tag), { x: nameX, y: nameY - 20, size: 11, font: regular, color: tagColor });
  }
  y = hasBand ? pageSize[1] - 118 - 24 : headerTop - Math.max(photoSize, 50) - 14;

  sectionHeading("Personal Details");
  row("Date of Birth", data.dob);
  row("Gender", data.gender);
  if (isMatrimonial) row("Marital Status", data.maritalStatus);
  if (isMatrimonial) row("Height", data.height);
  if (isMatrimonial) row("Complexion", data.complexion);
  row("Religion", data.religion);
  row("Caste", data.caste);
  if (isMatrimonial) row("Gotra", data.gotra);
  if (isMatrimonial) row("Rashi / Nakshatra", data.rashi);
  y -= 6;

  sectionHeading("Education & Occupation");
  row("Education", data.education);
  row("Occupation", data.occupation);
  if (isMatrimonial) row("Annual Income", data.annualIncome);
  y -= 6;

  if (isMatrimonial && (data.fatherName.trim() || data.motherName.trim() || data.siblings.trim())) {
    sectionHeading("Family Details");
    row("Father's Name", data.fatherName);
    row("Father's Occupation", data.fatherOccupation);
    row("Mother's Name", data.motherName);
    row("Mother's Occupation", data.motherOccupation);
    row("Siblings", data.siblings);
    y -= 6;
  }

  sectionHeading("Contact Details");
  row("Phone", data.phone);
  row("Email", data.email);
  row("Native Place", data.nativePlace);
  row("Current Address", data.currentAddress);
  row("Permanent Address", data.permanentAddress);

  if (isMatrimonial && data.hobbies.trim()) {
    y -= 6;
    sectionHeading("Hobbies & Interests");
    wrapPdfText(data.hobbies, maxWidth, regular, 10).forEach((line) => {
      ensure(16);
      page.drawText(safePdfText(line), { x: margin, y, size: 10, font: regular, color: c.text });
      y -= 15;
    });
  }

  const bytes = await pdf.save();
  return new Blob([bytes], { type: "application/pdf" });
}

/// Same PDF as buildBiodataPdf, but with a tiled diagonal watermark stamped
/// over every page - mirrors buildPreviewPdf in resume-builder/pdfBuilder.ts.
export async function buildPreviewBiodataPdf(data: BiodataData) {
  const blob = await buildBiodataPdf(data);
  const { PDFDocument, StandardFonts, rgb, degrees } = await import("pdf-lib");
  const pdf = await PDFDocument.load(await blob.arrayBuffer());
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const label = "REPETIGO PREVIEW - NOT FOR USE";
  const fontSize = 20;
  const textWidth = font.widthOfTextAtSize(label, fontSize);
  const stepX = textWidth + 70;
  const stepY = 100;

  pdf.getPages().forEach((page) => {
    const { width, height } = page.getSize();
    for (let row = -height; row < height * 1.5; row += stepY) {
      for (let col = -width; col < width * 1.5; col += stepX) {
        page.drawText(label, {
          x: col,
          y: row,
          size: fontSize,
          font,
          color: rgb(0.55, 0.55, 0.55),
          opacity: 0.3,
          rotate: degrees(35),
        });
      }
    }
  });

  const bytes = await pdf.save();
  return new Blob([bytes], { type: "application/pdf" });
}
