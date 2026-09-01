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
  if (id === "royal" || id === "shubh") {
    return {
      navy: rgb(0.478, 0.122, 0.169), // maroon
      text: rgb(0.231, 0.141, 0.094), // warm dark brown
      muted: rgb(0.549, 0.384, 0.224), // warm gold-brown
      accent: rgb(0.639, 0.478, 0.06), // gold
      line: rgb(0.847, 0.725, 0.471), // pale gold
    };
  }
  if (id === "heritage") {
    return {
      navy: rgb(0.29, 0.173, 0.09), // wood brown
      text: rgb(0.231, 0.141, 0.094),
      muted: rgb(0.29, 0.173, 0.09),
      accent: rgb(0.722, 0.537, 0.122), // gold
      line: rgb(0.847, 0.725, 0.471),
    };
  }
  if (id === "krishna") {
    return {
      navy: rgb(0.541, 0.141, 0.196), // maroon
      text: rgb(0.227, 0.141, 0.094),
      muted: rgb(0.541, 0.141, 0.196),
      accent: rgb(0.788, 0.635, 0.153), // gold
      line: rgb(0.89, 0.788, 0.541),
    };
  }
  if (id === "marriage") {
    return {
      navy: rgb(0.18, 0.42, 0.243), // green
      text: rgb(0.169, 0.184, 0.149),
      muted: rgb(0.541, 0.141, 0.196), // maroon labels
      accent: rgb(0.722, 0.537, 0.122), // gold
      line: rgb(0.718, 0.824, 0.725),
    };
  }
  if (id === "indigo") {
    return {
      navy: rgb(0.941, 0.839, 0.459), // light gold - name text on dark bg
      text: rgb(0.906, 0.925, 0.961), // near-white
      muted: rgb(0.941, 0.839, 0.459),
      accent: rgb(0.831, 0.686, 0.216), // gold
      line: rgb(0.831, 0.686, 0.216),
    };
  }
  if (id === "redbeige") {
    return {
      navy: rgb(0.427, 0.059, 0.078), // dark maroon - section pill fill
      text: rgb(0.169, 0.125, 0.082), // dark brown - row values
      muted: rgb(0.478, 0.063, 0.082), // maroon - row labels
      accent: rgb(0.965, 0.918, 0.784), // cream - pill text
      line: rgb(0.847, 0.725, 0.471),
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
  const { PDFDocument, StandardFonts, rgb, degrees } = await import("pdf-lib");
  const pdf = await PDFDocument.create();
  const isRoyal = data.template === "royal";
  const isShubh = data.template === "shubh";
  const isHeritage = data.template === "heritage";
  const isKrishna = data.template === "krishna";
  const isMarriage = data.template === "marriage";
  const isIndigo = data.template === "indigo";
  const isRedBeige = data.template === "redbeige";
  const isFestive = isRoyal || isShubh || isHeritage || isKrishna || isMarriage || isIndigo;
  // Shared "colon after label + left-aligned bulleted heading" treatment for
  // every devotional template except Royal, which keeps its own centered style.
  const isColonStyle = isShubh || isHeritage || isKrishna || isMarriage || isIndigo;
  // Red & Beige uses colon rows too, but its own pill-badge headings - kept as
  // a separate flag from isColonStyle so it doesn't pick up the diamond bullet.
  const isColonRow = isColonStyle || isRedBeige;
  const isSquarePhoto = isHeritage || isIndigo;
  const regular = await pdf.embedFont(isFestive ? StandardFonts.TimesRoman : StandardFonts.Helvetica);
  const bold = await pdf.embedFont(isFestive ? StandardFonts.TimesRomanBold : StandardFonts.HelveticaBold);
  const c = templateColors(data.template, rgb);
  const pageSize: [number, number] = [595.28, 841.89];
  const margin = isFestive ? 64 : isRedBeige ? 56 : 54;
  let maxWidth = pageSize[0] - margin * 2;
  const frameInset = 24;
  const indigoBg = rgb(0.078, 0.165, 0.322);

  // Red & Beige draws the actual illustrated page artwork (public/Red Beige
  // Traditional Marriage Biodata Document/) as a full-bleed background - page
  // 1's header/corner art for the first page, the plain page 2 background for
  // any continuation page - instead of a CSS/vector-drawn frame.
  let redBeigePage1: Awaited<ReturnType<typeof pdf.embedJpg>> | null = null;
  let redBeigePage2: Awaited<ReturnType<typeof pdf.embedJpg>> | null = null;
  if (isRedBeige) {
    const [bytes1, bytes2] = await Promise.all([
      fetch("/Red%20Beige%20Traditional%20Marriage%20Biodata%20Document/Red%20Beige%20Traditional%20Marriage%20Biodata%20page1.jpg").then((response) => response.arrayBuffer()),
      fetch("/Red%20Beige%20Traditional%20Marriage%20Biodata%20Document/Red%20Beige%20Traditional%20Marriage%20Biodata%20page2.jpg").then((response) => response.arrayBuffer()),
    ]);
    redBeigePage1 = await pdf.embedJpg(bytes1);
    redBeigePage2 = await pdf.embedJpg(bytes2);
  }
  const redBeigeHeaderReserve = 150;

  let page = pdf.addPage(pageSize);
  let y = pageSize[1] - margin;

  function drawRedBeigeBg(isFirstPage: boolean) {
    const image = isFirstPage ? redBeigePage1 : redBeigePage2;
    if (image) page.drawImage(image, { x: 0, y: 0, width: pageSize[0], height: pageSize[1] });
  }

  // Decorative border frame, redrawn on every page - three variants: a thin
  // double line (Royal/Shubh/Krishna/Marriage), a thick wood/gold frame
  // (Heritage), and a thick gold frame over a filled dark page (Indigo).
  function drawFrame() {
    if (isIndigo) {
      page.drawRectangle({ x: 0, y: 0, width: pageSize[0], height: pageSize[1], color: indigoBg });
      page.drawRectangle({ x: frameInset - 4, y: frameInset - 4, width: pageSize[0] - (frameInset - 4) * 2, height: pageSize[1] - (frameInset - 4) * 2, borderColor: c.accent, borderWidth: 5 });
      page.drawRectangle({ x: frameInset + 4, y: frameInset + 4, width: pageSize[0] - (frameInset + 4) * 2, height: pageSize[1] - (frameInset + 4) * 2, borderColor: c.accent, borderWidth: 1 });
      return;
    }
    if (isHeritage) {
      page.drawRectangle({ x: frameInset - 6, y: frameInset - 6, width: pageSize[0] - (frameInset - 6) * 2, height: pageSize[1] - (frameInset - 6) * 2, borderColor: c.navy, borderWidth: 6 });
      page.drawRectangle({ x: frameInset + 2, y: frameInset + 2, width: pageSize[0] - (frameInset + 2) * 2, height: pageSize[1] - (frameInset + 2) * 2, borderColor: c.accent, borderWidth: 1.2 });
      return;
    }
    page.drawRectangle({ x: frameInset, y: frameInset, width: pageSize[0] - frameInset * 2, height: pageSize[1] - frameInset * 2, borderColor: c.accent, borderWidth: 1.3 });
    page.drawRectangle({ x: frameInset + 5, y: frameInset + 5, width: pageSize[0] - (frameInset + 5) * 2, height: pageSize[1] - (frameInset + 5) * 2, borderColor: c.navy, borderWidth: 0.6 });
  }
  if (isFestive) drawFrame();
  if (isRedBeige) {
    drawRedBeigeBg(true);
    y -= redBeigeHeaderReserve;
  }

  function ensure(space: number) {
    if (y - space >= margin) return;
    page = pdf.addPage(pageSize);
    if (isFestive) drawFrame();
    if (isRedBeige) drawRedBeigeBg(false);
    y = pageSize[1] - margin;
  }

  // A simple geometric swastik built from line segments (four L-shaped arms)
  // rather than a font glyph - the standard PDF fonts embedded here can't
  // render one, so this sidesteps needing a custom Devanagari/CJK font just
  // for two small decorative marks.
  function drawSwastik(cx: number, cy: number, arm: number) {
    const t = 1.8;
    const hook = arm * 0.55;
    page.drawLine({ start: { x: cx, y: cy - arm }, end: { x: cx, y: cy + arm }, thickness: t, color: c.accent });
    page.drawLine({ start: { x: cx - arm, y: cy }, end: { x: cx + arm, y: cy }, thickness: t, color: c.accent });
    page.drawLine({ start: { x: cx, y: cy + arm }, end: { x: cx - hook, y: cy + arm }, thickness: t, color: c.accent });
    page.drawLine({ start: { x: cx, y: cy - arm }, end: { x: cx + hook, y: cy - arm }, thickness: t, color: c.accent });
    page.drawLine({ start: { x: cx + arm, y: cy }, end: { x: cx + arm, y: cy + hook }, thickness: t, color: c.accent });
    page.drawLine({ start: { x: cx - arm, y: cy }, end: { x: cx - arm, y: cy - hook }, thickness: t, color: c.accent });
  }

  function sectionHeading(label: string) {
    if (isRedBeige && label === "Personal Details") {
      // The page artwork already carries a "BIODATA" pill above where the
      // rows start, so a second "Personal Details" heading would be redundant.
      return;
    }
    ensure(30);
    y -= 6;
    const text = label.toUpperCase();
    if (isRedBeige) {
      const pillText = label.toUpperCase();
      const textSize = 10.5;
      const textWidth = bold.widthOfTextAtSize(pillText, textSize);
      const pillWidth = textWidth + 34;
      const pillHeight = 22;
      page.drawRectangle({ x: margin, y: y - pillHeight + 6, width: pillWidth, height: pillHeight, color: c.navy, borderColor: c.navy, borderWidth: 0 });
      page.drawText(pillText, { x: margin + 17, y: y - pillHeight + 13, size: textSize, font: bold, color: c.accent });
      y -= pillHeight + 8;
      return;
    }
    if (isColonStyle) {
      page.drawRectangle({ x: margin, y: y - 7, width: 6, height: 6, color: c.accent, rotate: degrees(45) });
      page.drawText(text, { x: margin + 14, y, size: 10.5, font: bold, color: c.navy });
      y -= 8;
      page.drawLine({ start: { x: margin, y }, end: { x: pageSize[0] - margin, y }, thickness: 0.8, color: c.line });
      y -= 14;
      return;
    }
    if (isRoyal) {
      const textWidth = bold.widthOfTextAtSize(text, 10.5);
      page.drawText(text, { x: (pageSize[0] - textWidth) / 2, y, size: 10.5, font: bold, color: c.accent });
      y -= 8;
      const midX = pageSize[0] / 2;
      page.drawLine({ start: { x: midX - 34, y }, end: { x: midX + 34, y }, thickness: 1.2, color: c.line });
      y -= 14;
      return;
    }
    page.drawText(text, { x: margin, y, size: 10.5, font: bold, color: c.accent });
    y -= 5;
    page.drawLine({ start: { x: margin, y }, end: { x: pageSize[0] - margin, y }, thickness: 1, color: c.line });
    y -= 14;
  }

  function row(label: string, value: string, key?: string) {
    if (key && hiddenFields.includes(key)) return;
    if (!value.trim()) return;
    ensure(20);
    const labelWidth = 168;
    page.drawText(safePdfText(isColonRow ? `${label}:` : label), { x: margin, y, size: 10, font: bold, color: c.muted });
    const lines = wrapPdfText(value, maxWidth - labelWidth, regular, 10);
    lines.forEach((line, i) => {
      if (i > 0) ensure(15);
      page.drawText(safePdfText(line), { x: margin + labelWidth, y, size: 10, font: regular, color: c.text });
      y -= 15;
    });
  }

  const isMatrimonial = data.template !== "simple";
  const hasBand = data.template === "modern";
  const hiddenFields = data.hiddenFields || [];
  const hiddenSections = data.hiddenSections || [];
  const displayName = hiddenFields.includes("fullName") ? "" : data.fullName;

  if (isFestive) {
    if (isShubh) {
      const label = "|| Shree Ganeshay Namah ||";
      const labelSize = 11.5;
      const labelWidth = bold.widthOfTextAtSize(label, labelSize);
      const gap = 10;
      const armSize = 7.5;
      page.drawText(label, { x: (pageSize[0] - labelWidth) / 2, y: y - 4, size: labelSize, font: bold, color: c.navy });
      drawSwastik((pageSize[0] - labelWidth) / 2 - gap - armSize, y + armSize / 2, armSize);
      drawSwastik((pageSize[0] + labelWidth) / 2 + gap + armSize, y + armSize / 2, armSize);
      y -= 28;
    } else if (isHeritage || isKrishna || isMarriage || isIndigo) {
      // Small filled emblem badge, then one or two centered lines of
      // invocation text (Marriage gets an extra "Marriage Biodata" title line).
      const badgeR = 14;
      const badgeCy = y - badgeR;
      page.drawEllipse({ x: pageSize[0] / 2, y: badgeCy, xScale: badgeR, yScale: badgeR, color: c.accent });
      y -= badgeR * 2 + 10;
      const invocation = isKrishna ? "|| Shree Krishnaya Namah ||" : isHeritage ? "|| Ganeshaya Namah ||" : isIndigo ? "|| Namo Buddhay ||" : "|| Shree Ganeshay Namah ||";
      const lines = isMarriage ? ["Marriage Biodata", invocation] : [invocation];
      lines.forEach((line) => {
        const size = 11.5;
        const width = bold.widthOfTextAtSize(line, size);
        page.drawText(line, { x: (pageSize[0] - width) / 2, y, size, font: bold, color: c.navy });
        y -= size + 8;
      });
      y -= 4;
    }
    // Framed photo (circular for Royal/Shubh/Krishna/Marriage, a bordered
    // square for Heritage/Indigo), then centered name/tag, then a gold
    // divider with a small center dot - the festive invitation-card look.
    const photoSize = 84;
    if (data.photo) {
      try {
        const base64 = data.photo.split(",")[1] || "";
        const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
        const image = data.photo.startsWith("data:image/png") ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
        const px = (pageSize[0] - photoSize) / 2;
        const py = y - photoSize;
        if (isSquarePhoto) {
          page.drawRectangle({ x: px - 3, y: py - 3, width: photoSize + 6, height: photoSize + 6, borderColor: c.accent, borderWidth: 2 });
        } else {
          page.drawEllipse({ x: pageSize[0] / 2, y: py + photoSize / 2, xScale: photoSize / 2 + 5, yScale: photoSize / 2 + 5, borderColor: c.accent, borderWidth: 2 });
        }
        page.drawImage(image, { x: px, y: py, width: photoSize, height: photoSize });
        y = py - 18;
      } catch {
        // Skip a photo that fails to decode rather than failing the whole download.
      }
    }
    const name = safePdfText(displayName || "Your Name");
    const nameSize = 23;
    const nameWidth = bold.widthOfTextAtSize(name, nameSize);
    page.drawText(name, { x: (pageSize[0] - nameWidth) / 2, y, size: nameSize, font: bold, color: c.navy });
    y -= nameSize + 8;
    if (isMatrimonial && !isColonStyle) {
      // The colon-style templates already list Religion/Caste as rows in
      // Personal Details, so the tagline here would just repeat them.
      const tag = safePdfText([data.religion, data.caste].filter(Boolean).join(" - ") || "Biodata for Marriage");
      const tagWidth = regular.widthOfTextAtSize(tag, 11.5);
      page.drawText(tag, { x: (pageSize[0] - tagWidth) / 2, y, size: 11.5, font: regular, color: c.accent });
      y -= 22;
    } else {
      y -= 10;
    }
    const midX = pageSize[0] / 2;
    page.drawLine({ start: { x: margin, y }, end: { x: midX - 16, y }, thickness: 1, color: c.line });
    page.drawEllipse({ x: midX, y, xScale: 2.4, yScale: 2.4, color: c.accent });
    page.drawLine({ start: { x: midX + 16, y }, end: { x: pageSize[0] - margin, y }, thickness: 1, color: c.line });
    y -= 22;
  } else if (!isRedBeige) {
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
    page.drawText(safePdfText(displayName || "Your Name"), { x: nameX, y: nameY, size: 22, font: bold, color: nameColor });
    if (isMatrimonial) {
      const tag = [data.religion, data.caste].filter(Boolean).join(" - ") || "Biodata for Marriage";
      page.drawText(safePdfText(tag), { x: nameX, y: nameY - 20, size: 11, font: regular, color: tagColor });
    }
    y = hasBand ? pageSize[1] - 118 - 24 : headerTop - Math.max(photoSize, 50) - 14;
  }

  if (isRedBeige) {
    // A framed photo box in the gutter beside where the rows start - name
    // is drawn as a regular row below (the page artwork's own "BIODATA" pill
    // already serves as the header, so there's no separate name headline).
    const photoW = 130;
    const photoH = 163;
    const photoX = pageSize[0] - margin - photoW;
    const photoY = y - photoH;
    if (data.photo) {
      try {
        const base64 = data.photo.split(",")[1] || "";
        const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
        const image = data.photo.startsWith("data:image/png") ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
        page.drawRectangle({ x: photoX - 2, y: photoY - 2, width: photoW + 4, height: photoH + 4, borderColor: c.muted, borderWidth: 2 });
        page.drawImage(image, { x: photoX, y: photoY, width: photoW, height: photoH });
      } catch {
        // Skip a photo that fails to decode rather than failing the whole download.
      }
    } else {
      page.drawRectangle({ x: photoX, y: photoY, width: photoW, height: photoH, borderColor: c.muted, borderWidth: 1.5 });
    }
    // Rows drawn while the photo is in this vertical range need to stop
    // short of it - restored to the full width once Education & Occupation
    // (the section most likely to still overlap the photo) is done.
    maxWidth = photoX - margin - 14;
  }

  const customFields = data.customFields || [];
  const customRows = (section: BiodataData["customFields"][number]["section"]) => {
    customFields.filter((field) => field.section === section).forEach((field) => row(field.label || "Field", field.value));
  };

  if (!hiddenSections.includes("personal")) {
    sectionHeading("Personal Details");
    if (isRedBeige) row("Full Name", data.fullName, "fullName");
    row("Date of Birth", data.dob, "dob");
    row("Gender", data.gender, "gender");
    if (isMatrimonial) row("Marital Status", data.maritalStatus, "maritalStatus");
    if (isMatrimonial) row("Height", data.height, "height");
    if (isMatrimonial) row("Complexion", data.complexion, "complexion");
    row("Religion", data.religion, "religion");
    row("Caste", data.caste, "caste");
    if (isMatrimonial) row("Gotra", data.gotra, "gotra");
    if (isMatrimonial) row("Rashi / Nakshatra", data.rashi, "rashi");
    customRows("personal");
    y -= 6;
  }

  if (!hiddenSections.includes("education")) {
    sectionHeading("Education & Occupation");
    row("Education", data.education, "education");
    row("Occupation", data.occupation, "occupation");
    if (isMatrimonial) row("Annual Income", data.annualIncome, "annualIncome");
    customRows("education");
    y -= 6;
  }

  if (isRedBeige) maxWidth = pageSize[0] - margin * 2;

  if (isMatrimonial && !hiddenSections.includes("family") && (data.fatherName.trim() || data.motherName.trim() || data.siblings.trim() || customFields.some((field) => field.section === "family"))) {
    sectionHeading("Family Details");
    row("Father's Name", data.fatherName, "fatherName");
    row("Father's Occupation", data.fatherOccupation, "fatherOccupation");
    row("Mother's Name", data.motherName, "motherName");
    row("Mother's Occupation", data.motherOccupation, "motherOccupation");
    row("Siblings", data.siblings, "siblings");
    customRows("family");
    y -= 6;
  }

  if (!hiddenSections.includes("contact")) {
    sectionHeading("Contact Details");
    row("Phone", data.phone, "phone");
    row("Email", data.email, "email");
    row("Native Place", data.nativePlace, "nativePlace");
    row("Current Address", data.currentAddress, "currentAddress");
    row("Permanent Address", data.permanentAddress, "permanentAddress");
    customRows("contact");
  }

  if (isMatrimonial && !hiddenSections.includes("hobbies") && (data.hobbies.trim() || customFields.some((field) => field.section === "hobbies"))) {
    y -= 6;
    sectionHeading("Hobbies & Interests");
    if (data.hobbies.trim() && !hiddenFields.includes("hobbies")) {
      wrapPdfText(data.hobbies, maxWidth, regular, 10).forEach((line) => {
        ensure(16);
        page.drawText(safePdfText(line), { x: margin, y, size: 10, font: regular, color: c.text });
        y -= 15;
      });
    }
    customRows("hobbies");
  }

  (data.customSections || []).forEach((section) => {
    const fields = customFields.filter((field) => field.section === section.id);
    if (!fields.length) return;
    y -= 6;
    sectionHeading((section.title || "Additional Details").toUpperCase());
    fields.forEach((field) => row(field.label || "Field", field.value));
  });

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
