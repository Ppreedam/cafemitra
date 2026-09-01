import type { TemplateId } from "./templates";
import { certHasContent, dateRange, eduHasContent, expHasContent, projHasContent, type ResumeData, type ResumeSectionId } from "./resumeModel";

type TemplateMetrics = {
  margin: number; nameSize: number; roleSize: number; contactSize: number;
  sectionHeadSize: number; bodySize: number; bulletSize: number; subSize: number; bandHeight: number;
  fontFamily: "helvetica" | "times"; centered: boolean; pillHeadings: boolean; timeline: boolean;
};

// "sidebar"/"sidebar-right" are dispatched to buildSidebarResumePdf's own
// two-column layout before this table is ever consulted - those two entries
// only exist to satisfy Record<TemplateId, ...> and are never actually used.
const SIDEBAR_METRICS_PLACEHOLDER: TemplateMetrics = { margin: 54, nameSize: 22, roleSize: 12, contactSize: 9.5, sectionHeadSize: 10.5, bodySize: 10, bulletSize: 9.7, subSize: 9, bandHeight: 0, fontFamily: "helvetica", centered: false, pillHeadings: false, timeline: false };

const TEMPLATE_METRICS: Record<TemplateId, TemplateMetrics> = {
  classic: { margin: 54, nameSize: 22, roleSize: 12, contactSize: 9.5, sectionHeadSize: 10.5, bodySize: 10, bulletSize: 9.7, subSize: 9, bandHeight: 0, fontFamily: "helvetica", centered: false, pillHeadings: false, timeline: false },
  modern: { margin: 54, nameSize: 22, roleSize: 12, contactSize: 9.5, sectionHeadSize: 10.5, bodySize: 10, bulletSize: 9.7, subSize: 9, bandHeight: 108, fontFamily: "helvetica", centered: false, pillHeadings: false, timeline: false },
  minimal: { margin: 46, nameSize: 19, roleSize: 10.5, contactSize: 8.7, sectionHeadSize: 9.5, bodySize: 9.2, bulletSize: 9, subSize: 8.3, bandHeight: 0, fontFamily: "helvetica", centered: false, pillHeadings: false, timeline: false },
  elegant: { margin: 58, nameSize: 24, roleSize: 11.5, contactSize: 9, sectionHeadSize: 10, bodySize: 10, bulletSize: 9.5, subSize: 8.7, bandHeight: 0, fontFamily: "times", centered: true, pillHeadings: false, timeline: false },
  bold: { margin: 54, nameSize: 24, roleSize: 12, contactSize: 9.5, sectionHeadSize: 10, bodySize: 10, bulletSize: 9.7, subSize: 9, bandHeight: 100, fontFamily: "helvetica", centered: false, pillHeadings: true, timeline: false },
  sidebar: SIDEBAR_METRICS_PLACEHOLDER,
  "sidebar-right": SIDEBAR_METRICS_PLACEHOLDER,
  ats: { margin: 52, nameSize: 20, roleSize: 11, contactSize: 9.3, sectionHeadSize: 10, bodySize: 10, bulletSize: 9.7, subSize: 9, bandHeight: 0, fontFamily: "helvetica", centered: false, pillHeadings: false, timeline: false },
  timeline: { margin: 54, nameSize: 22, roleSize: 12, contactSize: 9.5, sectionHeadSize: 10.5, bodySize: 10, bulletSize: 9.7, subSize: 9, bandHeight: 0, fontFamily: "helvetica", centered: false, pillHeadings: false, timeline: true },
};

type RgbColor = ReturnType<typeof import("pdf-lib").rgb>;
type RgbFn = typeof import("pdf-lib").rgb;

function buildTemplateColors(id: TemplateId, rgb: RgbFn): { navy: RgbColor; text: RgbColor; muted: RgbColor; accent: RgbColor; line: RgbColor; band?: RgbColor; bandMuted?: RgbColor } {
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
  if (id === "minimal") {
    return {
      navy: rgb(0.08, 0.08, 0.1),
      text: rgb(0.1, 0.1, 0.12),
      muted: rgb(0.42, 0.44, 0.48),
      accent: rgb(0.08, 0.08, 0.1),
      line: rgb(0.82, 0.83, 0.85),
    };
  }
  if (id === "elegant") {
    return {
      navy: rgb(0.11, 0.09, 0.07),
      text: rgb(0.13, 0.11, 0.09),
      muted: rgb(0.46, 0.42, 0.36),
      accent: rgb(0.63, 0.49, 0.15),
      line: rgb(0.88, 0.83, 0.7),
    };
  }
  if (id === "bold") {
    return {
      navy: rgb(1, 1, 1),
      text: rgb(0.14, 0.12, 0.2),
      muted: rgb(0.42, 0.4, 0.48),
      accent: rgb(0.43, 0.16, 0.85),
      line: rgb(0.87, 0.83, 0.96),
      band: rgb(0.3, 0.11, 0.58),
      bandMuted: rgb(0.87, 0.82, 0.97),
    };
  }
  if (id === "ats") {
    return {
      navy: rgb(0, 0, 0),
      text: rgb(0.05, 0.05, 0.05),
      muted: rgb(0.35, 0.35, 0.35),
      accent: rgb(0, 0, 0),
      line: rgb(0.75, 0.75, 0.75),
    };
  }
  if (id === "timeline") {
    return {
      navy: rgb(0.08, 0.08, 0.1),
      text: rgb(0.1, 0.1, 0.12),
      muted: rgb(0.42, 0.44, 0.48),
      accent: rgb(0.87, 0.38, 0.2),
      line: rgb(0.96, 0.81, 0.71),
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

export async function buildResumePdf(data: ResumeData) {
  if (data.template === "sidebar" || data.template === "sidebar-right") {
    return buildSidebarResumePdf(data, data.template === "sidebar-right");
  }
  return buildSingleColumnResumePdf(data);
}

/// Same PDF as buildResumePdf, but with a tiled diagonal watermark stamped
/// over every page - lets someone check the exact real-data PDF (not just
/// the HTML approximation) before paying for the clean download, without
/// handing them a usable finished resume for free.
export async function buildPreviewPdf(data: ResumeData) {
  const blob = await buildResumePdf(data);
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

async function buildSingleColumnResumePdf(data: ResumeData) {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const pdf = await PDFDocument.create();
  const m = TEMPLATE_METRICS[data.template] || TEMPLATE_METRICS.classic;
  const c = buildTemplateColors(data.template, rgb);
  const regular = await pdf.embedFont(m.fontFamily === "times" ? StandardFonts.TimesRoman : StandardFonts.Helvetica);
  const bold = await pdf.embedFont(m.fontFamily === "times" ? StandardFonts.TimesRomanBold : StandardFonts.HelveticaBold);
  const pageSize: [number, number] = [595.28, 841.89];
  const margin = m.margin;
  const maxWidth = pageSize[0] - margin * 2;
  let page = pdf.addPage(pageSize);
  let y = pageSize[1] - margin;

  function ensure(space: number) {
    if (y - space >= margin) return;
    page = pdf.addPage(pageSize);
    y = pageSize[1] - margin;
  }

  function drawWrapped(text: string, options: { x?: number; size: number; font?: typeof regular; color?: RgbColor; width?: number; leading?: number }) {
    const font = options.font || regular;
    const x = options.x || margin;
    const width = options.width || maxWidth;
    const leading = options.leading || options.size * 1.5;
    wrapPdfText(text, width, font, options.size).forEach((line) => {
      ensure(leading);
      page.drawText(safePdfText(line), { x, y, size: options.size, font, color: options.color || c.text });
      y -= leading;
    });
  }

  function drawCentered(text: string, options: { x?: number; size: number; font?: typeof regular; color?: RgbColor; width?: number; leading?: number }) {
    const font = options.font || regular;
    const width = options.width || maxWidth;
    const leading = options.leading || options.size * 1.5;
    wrapPdfText(text, width, font, options.size).forEach((line) => {
      ensure(leading);
      const clean = safePdfText(line);
      const lineWidth = font.widthOfTextAtSize(clean, options.size);
      page.drawText(clean, { x: margin + (width - lineWidth) / 2, y, size: options.size, font, color: options.color || c.text });
      y -= leading;
    });
  }

  const drawHeaderLine = m.centered ? drawCentered : drawWrapped;

  function drawRightAligned(text: string, size: number, font: typeof regular, color: RgbColor, baseline: number) {
    const clean = safePdfText(text);
    const width = font.widthOfTextAtSize(clean, size);
    page.drawText(clean, { x: pageSize[0] - margin - width, y: baseline, size, font, color });
  }

  function sectionHeading(label: string) {
    ensure(30);
    y -= 6;
    const text = label.toUpperCase();
    if (m.pillHeadings && c.accent) {
      const textWidth = bold.widthOfTextAtSize(text, m.sectionHeadSize);
      const pillHeight = m.sectionHeadSize + 11;
      page.drawRectangle({ x: margin, y: y - pillHeight + 9, width: textWidth + 20, height: pillHeight, color: c.accent });
      page.drawText(text, { x: margin + 10, y: y - pillHeight + 14, size: m.sectionHeadSize, font: bold, color: rgb(1, 1, 1) });
      y -= pillHeight + 8;
    } else {
      page.drawText(text, { x: margin, y, size: m.sectionHeadSize, font: bold, color: c.accent });
      y -= 5;
      page.drawLine({ start: { x: margin, y }, end: { x: pageSize[0] - margin, y }, thickness: 1, color: c.line });
      y -= 14;
    }
  }

  const customFields = data.customFields || [];
  const hiddenFields = data.hiddenFields || [];
  const hiddenSections = data.hiddenSections || [];
  const hf = (key: string) => hiddenFields.includes(key);
  const hs = (id: ResumeSectionId) => hiddenSections.includes(id);
  const customRows = (section: string) => {
    customFields.filter((field) => field.section === section && field.value.trim()).forEach((field) => {
      drawWrapped(field.label ? `${field.label}: ${field.value}` : field.value, { size: m.bodySize, leading: m.bodySize * 1.45 });
    });
  };
  const hasCustom = (section: string) => customFields.some((field) => field.section === section && field.value.trim());

  // Header
  if (!hs("personal")) {
    const hasBand = m.bandHeight > 0 && c.band;
    if (hasBand) {
      page.drawRectangle({ x: 0, y: pageSize[1] - m.bandHeight, width: pageSize[0], height: m.bandHeight, color: c.band });
    }
    const nameColor = c.navy;
    const roleColor = hasBand ? (c.bandMuted || c.accent) : c.accent;
    const contactColor = hasBand ? (c.bandMuted || c.muted) : c.muted;
    drawHeaderLine((hf("fullName") ? "" : data.fullName) || "Your Name", { size: m.nameSize, font: bold, color: nameColor, leading: m.nameSize * 1.18 });
    if (!hf("role") && data.role.trim()) drawHeaderLine(data.role, { size: m.roleSize, color: roleColor, leading: m.roleSize * 1.42 });
    const contactLine = [hf("email") ? "" : data.email, hf("phone") ? "" : data.phone, hf("location") ? "" : data.location, hf("linkedin") ? "" : data.linkedin, hf("website") ? "" : data.website]
      .map((s) => s.trim())
      .filter(Boolean)
      .join("   |   ");
    if (contactLine) drawHeaderLine(contactLine, { size: m.contactSize, color: contactColor, leading: m.contactSize * 1.5 });

    if (hasBand) {
      y = pageSize[1] - m.bandHeight - 18;
    } else {
      y -= 4;
      ensure(6);
      page.drawLine({ start: { x: margin, y }, end: { x: pageSize[0] - margin, y }, thickness: 1.4, color: c.navy });
      y -= 16;
    }

    customFields
      .filter((field) => field.section === "personal" && field.value.trim())
      .forEach((field) => drawHeaderLine(field.label ? `${field.label}: ${field.value}` : field.value, { size: m.contactSize, color: contactColor, leading: m.contactSize * 1.5 }));
  }

  if (!hs("summary") && (data.summary.trim() || hasCustom("summary"))) {
    sectionHeading("Summary");
    if (data.summary.trim() && !hf("summary")) drawWrapped(data.summary, { size: m.bodySize, leading: m.bodySize * 1.45 });
    customRows("summary");
    y -= 6;
  }

  const skillsList = (hf("skills") ? "" : data.skills).split(",").map((s) => s.trim()).filter(Boolean);
  if (!hs("skills") && (skillsList.length || hasCustom("skills"))) {
    sectionHeading("Skills");
    if (skillsList.length) drawWrapped(skillsList.join("   |   "), { size: m.bodySize, leading: m.bodySize * 1.45 });
    customRows("skills");
    y -= 6;
  }

  // Timeline template: entries get a small dot on a vertical rail, with
  // content indented to clear it. The rail line is drawn last (after the
  // entry's own content, and after the gap to the next entry) so it reaches
  // down toward the next dot instead of stopping short.
  const railX = margin + 4;
  const contentX = m.timeline ? margin + 16 : margin;
  const contentWidth = m.timeline ? maxWidth - 16 : maxWidth;

  const experienceEntries = data.experience.filter(expHasContent);
  if (!hs("experience") && (experienceEntries.length || hasCustom("experience"))) {
    sectionHeading("Experience");
    experienceEntries.forEach((exp, index) => {
      ensure(30);
      const entryTopY = y;
      if (m.timeline) page.drawEllipse({ x: railX, y: entryTopY - 3, xScale: 3, yScale: 3, color: c.accent });
      const title = [exp.role, exp.company].filter(Boolean).join(" - ");
      const dates = dateRange(exp.start, exp.end, exp.current);
      page.drawText(safePdfText(title), { x: contentX, y, size: m.bodySize + 1, font: bold, color: c.text });
      if (dates) drawRightAligned(dates, m.subSize + 0.5, regular, c.muted, y + 1);
      y -= m.bodySize + 5;
      if (exp.location.trim()) {
        drawWrapped(exp.location, { x: contentX, width: contentWidth, size: m.subSize, color: c.muted, leading: m.subSize * 1.45 });
      }
      exp.bullets.split("\n").map((line) => line.trim()).filter(Boolean).forEach((line) => {
        ensure(m.bulletSize * 1.5);
        page.drawText("-", { x: contentX + 2, y, size: m.bulletSize + 0.3, font: bold, color: c.accent });
        drawWrapped(line, { x: contentX + 14, size: m.bulletSize, width: contentWidth - 14, leading: m.bulletSize * 1.45 });
      });
      if (index < experienceEntries.length - 1) y -= 8;
      if (m.timeline) page.drawLine({ start: { x: railX, y: entryTopY - 3 }, end: { x: railX, y: y + 2 }, thickness: 1.4, color: c.line });
    });
    customRows("experience");
    y -= 6;
  }

  const educationEntries = data.education.filter(eduHasContent);
  if (!hs("education") && (educationEntries.length || hasCustom("education"))) {
    sectionHeading("Education");
    educationEntries.forEach((edu, index) => {
      ensure(28);
      const entryTopY = y;
      if (m.timeline) page.drawEllipse({ x: railX, y: entryTopY - 3, xScale: 3, yScale: 3, color: c.accent });
      const title = [edu.degree, edu.school].filter(Boolean).join(" - ");
      const dates = dateRange(edu.start, edu.end, false);
      page.drawText(safePdfText(title), { x: contentX, y, size: m.bodySize + 0.5, font: bold, color: c.text });
      if (dates) drawRightAligned(dates, m.subSize + 0.5, regular, c.muted, y + 1);
      y -= m.bodySize + 5;
      if (edu.score.trim()) drawWrapped(edu.score, { x: contentX, width: contentWidth, size: m.subSize, color: c.muted, leading: m.subSize * 1.45 });
      y -= 4;
      if (m.timeline && index < educationEntries.length - 1) page.drawLine({ start: { x: railX, y: entryTopY - 3 }, end: { x: railX, y: y + 2 }, thickness: 1.4, color: c.line });
    });
    customRows("education");
    y -= 2;
  }

  const projectEntries = data.projects.filter(projHasContent);
  if (!hs("projects") && (projectEntries.length || hasCustom("projects"))) {
    sectionHeading("Projects");
    projectEntries.forEach((proj, index) => {
      ensure(24);
      const entryTopY = y;
      if (m.timeline) page.drawEllipse({ x: railX, y: entryTopY - 3, xScale: 3, yScale: 3, color: c.accent });
      const title = [proj.name, proj.stack].filter(Boolean).join(" - ");
      page.drawText(safePdfText(title), { x: contentX, y, size: m.bodySize + 0.5, font: bold, color: c.text });
      y -= m.bodySize + 5;
      if (proj.description.trim()) drawWrapped(proj.description, { x: contentX, width: contentWidth, size: m.bulletSize, leading: m.bulletSize * 1.45 });
      if (proj.link.trim()) drawWrapped(proj.link, { x: contentX, width: contentWidth, size: m.subSize, color: c.muted, leading: m.subSize * 1.45 });
      y -= 4;
      if (m.timeline && index < projectEntries.length - 1) page.drawLine({ start: { x: railX, y: entryTopY - 3 }, end: { x: railX, y: y + 2 }, thickness: 1.4, color: c.line });
    });
    customRows("projects");
    y -= 2;
  }

  const certEntries = data.certifications.filter(certHasContent);
  if (!hs("certifications") && (certEntries.length || hasCustom("certifications"))) {
    sectionHeading("Certifications");
    certEntries.forEach((cert) => {
      drawWrapped([cert.name, cert.issuer, cert.year].filter(Boolean).join(" - "), { size: m.bulletSize, leading: m.bulletSize * 1.45 });
    });
    customRows("certifications");
  }

  (data.customSections || []).forEach((section) => {
    const fields = customFields.filter((field) => field.section === section.id && field.value.trim());
    if (!fields.length) return;
    y -= 6;
    sectionHeading(section.title || "Additional Details");
    fields.forEach((field) => drawWrapped(field.label ? `${field.label}: ${field.value}` : field.value, { size: m.bodySize, leading: m.bodySize * 1.45 }));
  });

  const bytes = await pdf.save();
  return new Blob([bytes], { type: "application/pdf" });
}

async function buildSidebarResumePdf(data: ResumeData, mirrored = false) {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pageSize: [number, number] = [595.28, 841.89];
  const sidebarWidth = pageSize[0] * 0.34;
  const sidebarX0 = mirrored ? pageSize[0] - sidebarWidth : 0;
  const sidebarPad = 20;
  const mainMargin = 34;
  const mainX = mirrored ? mainMargin : sidebarWidth + mainMargin;
  const mainRightEdge = mirrored ? sidebarX0 - mainMargin : pageSize[0] - mainMargin;
  const mainWidth = mainRightEdge - mainX;

  const sidebarBg = rgb(0.122, 0.161, 0.216);
  const sidebarText = rgb(0.898, 0.906, 0.922);
  const sidebarMuted = rgb(0.62, 0.65, 0.69);
  const sidebarLine = rgb(0.25, 0.29, 0.35);
  const mainText = rgb(0.1, 0.14, 0.22);
  const mainMuted = rgb(0.37, 0.42, 0.55);
  const mainAccent = rgb(0.15, 0.39, 0.92);
  const mainLine = rgb(0.82, 0.86, 0.93);

  let page = pdf.addPage(pageSize);
  function drawSidebarBg() {
    page.drawRectangle({ x: sidebarX0, y: 0, width: sidebarWidth, height: pageSize[1], color: sidebarBg });
  }
  drawSidebarBg();

  let sy = pageSize[1] - 34;
  let my = pageSize[1] - mainMargin;

  function ensureMain(space: number) {
    if (my - space >= mainMargin) return;
    page = pdf.addPage(pageSize);
    drawSidebarBg();
    my = pageSize[1] - mainMargin;
  }

  function drawMainWrapped(text: string, options: { x?: number; size: number; font?: typeof regular; color?: RgbColor; width?: number; leading?: number }) {
    const font = options.font || regular;
    const x = options.x ?? mainX;
    const width = options.width || mainWidth;
    const leading = options.leading || options.size * 1.5;
    wrapPdfText(text, width, font, options.size).forEach((line) => {
      ensureMain(leading);
      page.drawText(safePdfText(line), { x, y: my, size: options.size, font, color: options.color || mainText });
      my -= leading;
    });
  }

  function drawMainRightAligned(text: string, size: number, font: typeof regular, color: RgbColor, baseline: number) {
    const clean = safePdfText(text);
    const width = font.widthOfTextAtSize(clean, size);
    page.drawText(clean, { x: mainRightEdge - width, y: baseline, size, font, color });
  }

  function mainSectionHeading(label: string) {
    ensureMain(28);
    my -= 4;
    page.drawText(label.toUpperCase(), { x: mainX, y: my, size: 10.5, font: bold, color: mainText });
    my -= 5;
    page.drawLine({ start: { x: mainX, y: my }, end: { x: mainRightEdge, y: my }, thickness: 1, color: mainLine });
    my -= 14;
  }

  // The main column is much narrower here than in the single-column templates,
  // so a long title drawn on the same line as a right-aligned date can run
  // straight into it. Fall back to wrapping the title (dates on their own
  // line below) whenever the two wouldn't fit side by side.
  function drawTitleWithDate(title: string, dates: string, size: number) {
    const cleanTitle = safePdfText(title);
    const titleWidth = bold.widthOfTextAtSize(cleanTitle, size);
    const dateWidth = dates ? regular.widthOfTextAtSize(safePdfText(dates), 9) : 0;
    ensureMain(15);
    if (!dates || titleWidth + 10 + dateWidth <= mainWidth) {
      page.drawText(cleanTitle, { x: mainX, y: my, size, font: bold, color: mainText });
      if (dates) drawMainRightAligned(dates, 9, regular, mainMuted, my + 1);
      my -= 15;
    } else {
      drawMainWrapped(title, { size, font: bold, color: mainText, leading: size + 3 });
      page.drawText(safePdfText(dates), { x: mainX, y: my, size: 9, font: regular, color: mainMuted });
      my -= 13;
    }
  }

  // Sidebar: photo (drawn as a plain square - a border-radius clip isn't
  // worth the low-level clipping-path plumbing pdf-lib would need here).
  const photoSize = sidebarWidth - sidebarPad * 2;
  if (data.photo) {
    try {
      const base64 = data.photo.split(",")[1] || "";
      const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
      const image = data.photo.startsWith("data:image/png") ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
      page.drawImage(image, { x: sidebarX0 + (sidebarWidth - photoSize) / 2, y: sy - photoSize, width: photoSize, height: photoSize });
      sy -= photoSize + 24;
    } catch {
      // Skip a photo that fails to decode rather than failing the whole download.
    }
  }

  function sidebarHeading(label: string) {
    page.drawText(label.toUpperCase(), { x: sidebarX0 + sidebarPad, y: sy, size: 9.5, font: bold, color: sidebarMuted });
    sy -= 5;
    page.drawLine({ start: { x: sidebarX0 + sidebarPad, y: sy }, end: { x: sidebarX0 + sidebarWidth - sidebarPad, y: sy }, thickness: 1, color: sidebarLine });
    sy -= 14;
  }

  function drawSidebarWrapped(text: string) {
    const size = 9.3;
    const leading = size * 1.5;
    wrapPdfText(text, sidebarWidth - sidebarPad * 2, regular, size).forEach((line) => {
      page.drawText(safePdfText(line), { x: sidebarX0 + sidebarPad, y: sy, size, font: regular, color: sidebarText });
      sy -= leading;
    });
    sy -= 4;
  }

  const customFields = data.customFields || [];
  const hiddenFields = data.hiddenFields || [];
  const hiddenSections = data.hiddenSections || [];
  const hf = (key: string) => hiddenFields.includes(key);
  const hs = (id: ResumeSectionId) => hiddenSections.includes(id);
  const hasCustom = (section: string) => customFields.some((field) => field.section === section && field.value.trim());
  const customLabelValues = (section: string) =>
    customFields.filter((field) => field.section === section && field.value.trim()).map((field) => (field.label ? `${field.label}: ${field.value}` : field.value));

  const contactParts = [hf("email") ? "" : data.email, hf("phone") ? "" : data.phone, hf("location") ? "" : data.location, hf("linkedin") ? "" : data.linkedin, hf("website") ? "" : data.website]
    .map((s) => s.trim())
    .filter(Boolean);
  if (!hs("personal") && (contactParts.length || hasCustom("personal"))) {
    sidebarHeading("Contact");
    contactParts.forEach(drawSidebarWrapped);
    customLabelValues("personal").forEach(drawSidebarWrapped);
    sy -= 10;
  }

  const skillsList = (hf("skills") ? "" : data.skills).split(",").map((s) => s.trim()).filter(Boolean);
  if (!hs("skills") && (skillsList.length || hasCustom("skills"))) {
    sidebarHeading("Skills");
    skillsList.forEach(drawSidebarWrapped);
    customLabelValues("skills").forEach(drawSidebarWrapped);
  }

  // Main column: name, role, then the usual sections
  if (!hs("personal")) {
    page.drawText(safePdfText((hf("fullName") ? "" : data.fullName) || "Your Name"), { x: mainX, y: my, size: 23, font: bold, color: mainText });
    my -= 30;
    if (!hf("role") && data.role.trim()) {
      page.drawText(safePdfText(data.role), { x: mainX, y: my, size: 12, font: regular, color: mainAccent });
      my -= 28;
    } else {
      my -= 8;
    }
  }

  if (!hs("summary") && (data.summary.trim() || hasCustom("summary"))) {
    mainSectionHeading("Profile");
    if (data.summary.trim() && !hf("summary")) drawMainWrapped(data.summary, { size: 10, leading: 14.5 });
    customLabelValues("summary").forEach((line) => drawMainWrapped(line, { size: 10, leading: 14.5 }));
    my -= 6;
  }

  const experienceEntries = data.experience.filter(expHasContent);
  if (!hs("experience") && (experienceEntries.length || hasCustom("experience"))) {
    mainSectionHeading("Experience");
    experienceEntries.forEach((exp, index) => {
      ensureMain(30);
      const title = [exp.role, exp.company].filter(Boolean).join(" - ");
      const dates = dateRange(exp.start, exp.end, exp.current);
      drawTitleWithDate(title, dates, 11);
      if (exp.location.trim()) drawMainWrapped(exp.location, { size: 9, color: mainMuted, leading: 13 });
      exp.bullets.split("\n").map((line) => line.trim()).filter(Boolean).forEach((line) => {
        ensureMain(14);
        page.drawText("-", { x: mainX + 2, y: my, size: 9.7, font: bold, color: mainAccent });
        drawMainWrapped(line, { x: mainX + 14, size: 9.7, width: mainWidth - 14, leading: 14 });
      });
      if (index < experienceEntries.length - 1) my -= 8;
    });
    customLabelValues("experience").forEach((line) => drawMainWrapped(line, { size: 9.7, leading: 14 }));
    my -= 6;
  }

  const educationEntries = data.education.filter(eduHasContent);
  if (!hs("education") && (educationEntries.length || hasCustom("education"))) {
    mainSectionHeading("Education");
    educationEntries.forEach((edu) => {
      ensureMain(28);
      const title = [edu.degree, edu.school].filter(Boolean).join(" - ");
      const dates = dateRange(edu.start, edu.end, false);
      drawTitleWithDate(title, dates, 10.5);
      if (edu.score.trim()) drawMainWrapped(edu.score, { size: 9, color: mainMuted, leading: 13 });
      my -= 4;
    });
    customLabelValues("education").forEach((line) => drawMainWrapped(line, { size: 9.7, leading: 14 }));
    my -= 2;
  }

  const projectEntries = data.projects.filter(projHasContent);
  if (!hs("projects") && (projectEntries.length || hasCustom("projects"))) {
    mainSectionHeading("Projects");
    projectEntries.forEach((proj) => {
      ensureMain(24);
      const title = [proj.name, proj.stack].filter(Boolean).join(" - ");
      drawMainWrapped(title, { size: 10.5, font: bold, color: mainText, leading: 14 });
      if (proj.description.trim()) drawMainWrapped(proj.description, { size: 9.7, leading: 14 });
      if (proj.link.trim()) drawMainWrapped(proj.link, { size: 9, color: mainMuted, leading: 13 });
      my -= 4;
    });
    customLabelValues("projects").forEach((line) => drawMainWrapped(line, { size: 9.7, leading: 14 }));
    my -= 2;
  }

  const certEntries = data.certifications.filter(certHasContent);
  if (!hs("certifications") && (certEntries.length || hasCustom("certifications"))) {
    mainSectionHeading("Certifications");
    certEntries.forEach((cert) => {
      drawMainWrapped([cert.name, cert.issuer, cert.year].filter(Boolean).join(" - "), { size: 9.7, leading: 14 });
    });
    customLabelValues("certifications").forEach((line) => drawMainWrapped(line, { size: 9.7, leading: 14 }));
  }

  (data.customSections || []).forEach((section) => {
    const fields = customLabelValues(section.id);
    if (!fields.length) return;
    my -= 6;
    mainSectionHeading(section.title || "Additional Details");
    fields.forEach((line) => drawMainWrapped(line, { size: 9.7, leading: 14 }));
  });

  const bytes = await pdf.save();
  return new Blob([bytes], { type: "application/pdf" });
}

// Exported for reuse by other client-side pdf-lib builders (e.g. Biodata
// Maker) - pure text-layout helpers, nothing resume-specific about them.
//
// Helvetica/Times (the standard fonts these builders embed) render WinAnsi,
// which covers Latin-1 Supplement (U+00A0-U+00FF) directly - that's ×, °,
// é, ñ, etc. Only the typographic punctuation outside that range (smart
// quotes, en/em dash) needs an explicit ASCII fallback before the final
// catch-all, which used to flatten all of it to "?".
export function safePdfText(value: string) {
  return value
    .replace(/–|—/g, "-")
    .replace(/“|”/g, '"')
    .replace(/‘|’/g, "'")
    .replace(/•/g, "-")
    .replace(/[^\x20-\x7E -ÿ]/g, "?");
}

export function wrapPdfText(text: string, maxWidth: number, font: { widthOfTextAtSize(value: string, size: number): number }, size: number) {
  const words = safePdfText(text).replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let line = "";
  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  });
  if (line || !lines.length) lines.push(line);
  return lines;
}
