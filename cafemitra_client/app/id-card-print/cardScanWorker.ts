// Card scanner worker: finds an ID card in a phone photo, straightens it to
// CR80 proportions and cleans it up for printing / photocopying. OpenCV.js
// runs here only, so the page stays responsive. See cardScan.ts for the
// main-thread side.
//
// Same loading approach as app/s/[code]/cleanScan/cleanScanWorker.ts: a
// classic worker that importScripts() the static /opencv/opencv.js copy.

export type ScanMode = "clean" | "photocopy" | "original";

type ScanRequest = {
  type: "scan";
  id: number;
  width: number;
  height: number;
  buffer: ArrayBuffer;
  // Card corners in percent of the image (TL, TR, BR, BL); null = detect.
  quad: number[] | null;
  mode: ScanMode;
  // "document": any paper page (A4, bill, letter...) - its own shape and
  // size, not CR80; outWidth / outHeight are ignored.
  kind?: "card" | "document";
  // Black & white documents: 0 (light) .. 100 (dark); default DOC_DARKNESS.
  darkness?: number;
  outWidth: number;
  outHeight: number;
};

// Set per request: documents take any page shape, cards are scored against CR80.
let documentMode = false;

const ctx = self as unknown as {
  postMessage: (message: unknown, transfer?: Transferable[]) => void;
  onmessage: ((event: MessageEvent<ScanRequest>) => void) | null;
  importScripts: (...urls: string[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cv: any;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CV = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Mat = any;
type Pt = { x: number; y: number };

let cvReadyPromise: Promise<{ instance: CV }> | null = null;

// cv exposes its own `.then`, so it is wrapped in an object before resolving
// (resolving with it directly hangs - see cleanScanWorker.ts).
function loadOpenCv(): Promise<{ instance: CV }> {
  if (!cvReadyPromise) {
    cvReadyPromise = new Promise((resolve, reject) => {
      ctx.postMessage({ type: "status", phase: "loading" });
      try {
        ctx.importScripts("/opencv/opencv.js");
      } catch (error) {
        reject(error);
        return;
      }
      const cv = ctx.cv;
      if (!cv) {
        reject(new Error("opencv.js loaded but did not define a global cv object"));
        return;
      }
      if (cv.Mat) {
        resolve({ instance: cv });
        return;
      }
      cv.onRuntimeInitialized = () => resolve({ instance: cv });
    });
  }
  return cvReadyPromise;
}

const CARD_RATIO = 85.6 / 53.98;

function oddify(value: number, min = 3) {
  const v = Math.max(min, Math.round(value));
  return v % 2 === 0 ? v + 1 : v;
}

function percentile(hist: number[], total: number, p: number) {
  let acc = 0;
  for (let i = 0; i < 256; i++) {
    acc += hist[i];
    if (acc >= total * p) return i;
  }
  return 255;
}

// ---------- detection ----------

function orderCorners(pts: Pt[]): Pt[] {
  // TL has the smallest x+y, BR the largest; TR the smallest y-x, BL the largest.
  const bySum = [...pts].sort((a, b) => a.x + a.y - (b.x + b.y));
  const byDiff = [...pts].sort((a, b) => a.y - a.x - (b.y - b.x));
  const ordered = [bySum[0], byDiff[0], bySum[3], byDiff[3]];
  // Degenerate ordering (card rotated ~45deg): fall back to angle order around the centre.
  if (new Set(ordered).size < 4) {
    const cx = pts.reduce((s, p) => s + p.x, 0) / 4, cy = pts.reduce((s, p) => s + p.y, 0) / 4;
    const byAngle = [...pts].sort((a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx));
    const start = byAngle.reduce((best, p, i) => (p.x + p.y < byAngle[best].x + byAngle[best].y ? i : best), 0);
    return [0, 1, 2, 3].map((k) => byAngle[(start + k) % 4]);
  }
  return ordered;
}

const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

// True when every corner of `inner` lies inside convex `outer` (or within `tol` px of it).
function encloses(outer: Pt[], inner: Pt[], tol: number) {
  const c = centroid(outer);
  return inner.every((p) =>
    [0, 1, 2, 3].every((i) => {
      const a = outer[i], b = outer[(i + 1) % 4];
      const len = dist(a, b) || 1;
      const side = ((b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x)) / len;
      const ref = ((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) / len;
      return Math.sign(side) === Math.sign(ref) || Math.abs(side) <= tol;
    }),
  );
}

function polygonArea(pts: Pt[]) {
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    s += a.x * b.y - b.x * a.y;
  }
  return Math.abs(s) / 2;
}

// Least-squares line through points: returns a point on it and its unit direction.
function fitLine(points: Pt[]) {
  const n = points.length;
  const mx = points.reduce((s, p) => s + p.x, 0) / n, my = points.reduce((s, p) => s + p.y, 0) / n;
  let sxx = 0, sxy = 0, syy = 0;
  for (const p of points) {
    const dx = p.x - mx, dy = p.y - my;
    sxx += dx * dx;
    sxy += dx * dy;
    syy += dy * dy;
  }
  const angle = 0.5 * Math.atan2(2 * sxy, sxx - syy);
  return { p: { x: mx, y: my }, d: { x: Math.cos(angle), y: Math.sin(angle) } };
}

function intersect(l1: ReturnType<typeof fitLine>, l2: ReturnType<typeof fitLine>): Pt | null {
  const det = l1.d.x * l2.d.y - l1.d.y * l2.d.x;
  if (Math.abs(det) < 1e-6) return null;
  const t = ((l2.p.x - l1.p.x) * l2.d.y - (l2.p.y - l1.p.y) * l2.d.x) / det;
  return { x: l1.p.x + t * l1.d.x, y: l1.p.y + t * l1.d.y };
}

// Snap a rough quad to the card's straight edges: fit a line to the contour
// points along each side (skipping the rounded corners) and intersect them.
function refineQuad(quad: Pt[], contour: Pt[]): Pt[] {
  const lines = [];
  for (let i = 0; i < 4; i++) {
    const a = quad[i], b = quad[(i + 1) % 4];
    const len = dist(a, b);
    const ux = (b.x - a.x) / len, uy = (b.y - a.y) / len;
    const near = contour.filter((p) => {
      const t = (p.x - a.x) * ux + (p.y - a.y) * uy;
      if (t < len * 0.12 || t > len * 0.88) return false;
      const off = Math.abs((p.x - a.x) * uy - (p.y - a.y) * ux);
      return off < Math.max(3, len * 0.03);
    });
    if (near.length < 8) return quad;
    lines.push(fitLine(near));
  }
  const out: Pt[] = [];
  for (let i = 0; i < 4; i++) {
    const p = intersect(lines[(i + 3) % 4], lines[i]);
    if (!p) return quad;
    out.push(p);
  }
  // Reject a refinement that moved far from the rough quad (bad fit).
  const perimeter = [0, 1, 2, 3].reduce((s, i) => s + dist(quad[i], quad[(i + 1) % 4]), 0);
  return out.every((p, i) => dist(p, quad[i]) < perimeter * 0.05) ? out : quad;
}

type Candidate = { quad: Pt[]; score: number };

function candidatesFromEdges(cv: CV, edges: Mat, imgArea: number): Candidate[] {
  const W = edges.cols, H = edges.rows;
  const margin = 0.006 * Math.max(W, H);
  const nearBorder = (p: Pt) => p.x < margin || p.y < margin || p.x > W - margin || p.y > H - margin;
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  // RETR_LIST, not EXTERNAL: a card inside a laminate pouch, sleeve or cover
  // only shows up as an inner outline.
  cv.findContours(edges, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_NONE);
  const found: Candidate[] = [];
  for (let i = 0; i < contours.size(); i++) {
    const contour = contours.get(i);
    const area = cv.contourArea(contour);
    if (area < imgArea * 0.08) {
      contour.delete();
      continue;
    }
    const hull = new cv.Mat();
    cv.convexHull(contour, hull, false, true);
    const peri = cv.arcLength(hull, true);
    let quad: Pt[] | null = null;
    for (const eps of [0.02, 0.03, 0.045, 0.06]) {
      const approx = new cv.Mat();
      cv.approxPolyDP(hull, approx, eps * peri, true);
      if (approx.rows === 4) {
        quad = [0, 1, 2, 3].map((k) => ({ x: approx.data32S[k * 2], y: approx.data32S[k * 2 + 1] }));
      }
      approx.delete();
      if (quad) break;
    }
    if (!quad) {
      // Rounded or chipped outline: use the minimum-area rectangle when the shape is rectangular enough.
      const rect = cv.minAreaRect(hull);
      const pts = cv.RotatedRect.points(rect).map((p: Pt) => ({ x: p.x, y: p.y }));
      if (area / Math.max(1, polygonArea(pts)) > 0.85) quad = pts;
    }
    if (quad) {
      const points: Pt[] = [];
      for (let k = 0; k < contour.rows; k++) points.push({ x: contour.data32S[k * 2], y: contour.data32S[k * 2 + 1] });
      const ordered = refineQuad(orderCorners(quad), points);
      const quadArea = polygonArea(ordered);
      const rectangularity = Math.min(1, area / Math.max(1, quadArea));
      const w = (dist(ordered[0], ordered[1]) + dist(ordered[3], ordered[2])) / 2;
      const h = (dist(ordered[0], ordered[3]) + dist(ordered[1], ordered[2])) / 2;
      const ratio = Math.max(w, h) / Math.max(1, Math.min(w, h));
      // Perspective squeezes the ratio, so be forgiving but still prefer card-shaped quads.
      const aspectScore = Math.exp(-Math.abs(Math.log(ratio / CARD_RATIO)) * 1.6);
      const coverage = quadArea / imgArea;
      const touchesAll = coverage > 0.9; // (nearly) the whole frame is not a card
      // Corners on the photo's border usually mean a background region
      // (table, cloth pattern) rather than the card.
      const touching = ordered.filter(nearBorder).length;
      // A small card photographed right at the edge of the frame is still a
      // card, so the heavy penalty is only for big regions.
      const borderScore = touching === 0 ? 1 : coverage > 0.5 ? (touching >= 2 ? 0.15 : 0.6) : 0.75;
      if (!touchesAll && rectangularity > 0.8) {
        found.push({ quad: ordered, score: Math.sqrt(coverage) * rectangularity * aspectScore * borderScore });
      }
    }
    hull.delete();
    contour.delete();
  }
  contours.delete();
  hierarchy.delete();
  return found;
}

// ---------- step-edge scoring ----------
//
// A card edge is a step: the colour just inside it differs from the colour
// just outside it, all along its length. Texture lines, the red footer line
// of an Aadhaar card (white on both sides) and a laminate pouch's outline
// (the same background on both sides) are much weaker steps, so this one
// measure ranks candidate quads from every source.

// bright = the 95th-percentile lightness, what white paper looks like in this photo.
type LabImage = { L: Float32Array; A: Float32Array; B: Float32Array; W: number; H: number; bright: number };

function toLab(cv: CV, rgb: Mat): LabImage {
  const lab = new cv.Mat();
  cv.cvtColor(rgb, lab, cv.COLOR_RGB2Lab);
  const W = lab.cols, H = lab.rows, n = W * H, d = lab.data;
  const L = new Float32Array(n), A = new Float32Array(n), B = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    L[i] = d[i * 3];
    A[i] = d[i * 3 + 1];
    B[i] = d[i * 3 + 2];
  }
  lab.delete();
  const sorted = Float32Array.from(L).sort();
  return { L, A, B, W, H, bright: sorted[Math.floor(n * 0.95)] };
}

// Mean colour difference across the side a->b (outward = away from `c`),
// 0..1 per sample, averaged; null when the side lies outside / on the border
// of the photo (a card cut off by the frame).
function sideStep(img: LabImage, a: Pt, b: Pt, c: Pt, band: number, raw = false, t0 = 0.1, t1 = 0.9): number | null {
  const len = dist(a, b);
  if (len < 8) return 0;
  let nx = -(b.y - a.y) / len, ny = (b.x - a.x) / len;
  if (((a.x + b.x) / 2 - c.x) * nx + ((a.y + b.y) / 2 - c.y) * ny < 0) {
    nx = -nx;
    ny = -ny;
  }
  const { L, A, B, W, H } = img;
  const offs = [band * 0.8, band * 1.6, band * 2.4];
  let sum = 0, n = 0, outside = 0, total = 0;
  const dt = (t1 - t0) / 25;
  for (let t = t0; t <= t1 + 1e-6; t += dt) {
    total++;
    const px = a.x + (b.x - a.x) * t, py = a.y + (b.y - a.y) * t;
    // Pairs of points either side; near the frame edge only the pairs that
    // are still on the photo count.
    let iL = 0, iA = 0, iB = 0, oL = 0, oA = 0, oB = 0, m = 0;
    for (const o of offs) {
      const xi = Math.round(px - nx * o), yi = Math.round(py - ny * o);
      const xo = Math.round(px + nx * o), yo = Math.round(py + ny * o);
      if (xi < 0 || yi < 0 || xi >= W || yi >= H || xo < 0 || yo < 0 || xo >= W || yo >= H) continue;
      const ii = yi * W + xi, oi = yo * W + xo;
      iL += L[ii];
      iA += A[ii];
      iB += B[ii];
      oL += L[oi];
      oA += A[oi];
      oB += B[oi];
      m++;
    }
    if (!m) {
      outside++;
      continue;
    }
    const dE = Math.hypot(iL - oL, iA - oA, iB - oB) / m;
    sum += raw ? dE : Math.min(1, Math.max(0, (dE - 5) / 18));
    n++;
  }
  if (outside > total * 0.4) return null;
  return n ? sum / n : 0;
}

const centroid = (q: Pt[]) => ({ x: q.reduce((s, p) => s + p.x, 0) / q.length, y: q.reduce((s, p) => s + p.y, 0) / q.length });

function quadShape(quad: Pt[]) {
  const w = (dist(quad[0], quad[1]) + dist(quad[3], quad[2])) / 2;
  const h = (dist(quad[0], quad[3]) + dist(quad[1], quad[2])) / 2;
  return { w, h, ratio: Math.max(w, h) / Math.max(1, Math.min(w, h)) };
}

function isConvex(q: Pt[]) {
  let sign = 0;
  for (let i = 0; i < 4; i++) {
    const a = q[i], b = q[(i + 1) % 4], c = q[(i + 2) % 4];
    const cross = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);
    if (Math.abs(cross) < 1e-6) return false;
    if (sign && Math.sign(cross) !== sign) return false;
    sign = Math.sign(cross);
  }
  return true;
}

// Corner angles between 55 and 125 degrees: perspective, not a parallelogram
// squashed flat.
function saneAngles(q: Pt[]) {
  for (let i = 0; i < 4; i++) {
    const p = q[(i + 3) % 4], c = q[i], n = q[(i + 1) % 4];
    const v1x = p.x - c.x, v1y = p.y - c.y, v2x = n.x - c.x, v2y = n.y - c.y;
    const cos = (v1x * v2x + v1y * v2y) / (Math.hypot(v1x, v1y) * Math.hypot(v2x, v2y) || 1);
    if (Math.abs(cos) > 0.57) return false;
  }
  return true;
}

type Scored = { quad: Pt[]; score: number; sides: (number | null)[] };

const isPaper = (img: LabImage, i: number) => img.L[i] >= img.bright * 0.62 && Math.hypot(img.A[i] - 128, img.B[i] - 128) < 20;

// Mean colour of a strip running along a->b, `from`..`to` pixels out on the
// side facing away from `c` (negative = inside), and the share of it that
// looks like card paper. null = mostly off the photo.
function strip(img: LabImage, a: Pt, b: Pt, c: Pt, from: number, to: number, ref: Ref): { lab: [number, number, number]; paper: number; like: number } | null {
  const len = dist(a, b) || 1;
  let nx = -(b.y - a.y) / len, ny = (b.x - a.x) / len;
  if (((a.x + b.x) / 2 - c.x) * nx + ((a.y + b.y) / 2 - c.y) * ny < 0) {
    nx = -nx;
    ny = -ny;
  }
  let L = 0, A = 0, B = 0, paper = 0, like = 0, n = 0, total = 0;
  for (let t = 0.12; t <= 0.88; t += 0.04) {
    for (let k = 0; k < 4; k++) {
      const o = from + ((to - from) * k) / 3;
      const x = Math.round(a.x + (b.x - a.x) * t + nx * o), y = Math.round(a.y + (b.y - a.y) * t + ny * o);
      total++;
      if (x < 0 || y < 0 || x >= img.W || y >= img.H) continue;
      const i = y * img.W + x;
      L += img.L[i];
      A += img.A[i];
      B += img.B[i];
      if (isPaper(img, i)) paper++;
      if (likeRef(img, i, ref)) like++;
      n++;
    }
  }
  return n < total * 0.6 ? null : { lab: [L / n, A / n, B / n], paper: paper / n, like: like / n };
}

// The card's own paper colour, from the quad's inside: the brighter part of
// it (text, photo and QR code are darker). Lets the edge tests ask "is this
// strip the same paper?" whatever the card's tint or the light.
type Ref = { L: number; A: number; B: number };

function paperRef(img: LabImage, quad: Pt[]): Ref {
  const Ls: number[] = [], As: number[] = [], Bs: number[] = [];
  for (let u = 0.1; u <= 0.9; u += 0.05) {
    for (let v = 0.1; v <= 0.9; v += 0.05) {
      const top = { x: quad[0].x + (quad[1].x - quad[0].x) * u, y: quad[0].y + (quad[1].y - quad[0].y) * u };
      const bottom = { x: quad[3].x + (quad[2].x - quad[3].x) * u, y: quad[3].y + (quad[2].y - quad[3].y) * u };
      const x = Math.round(top.x + (bottom.x - top.x) * v), y = Math.round(top.y + (bottom.y - top.y) * v);
      if (x < 0 || y < 0 || x >= img.W || y >= img.H) continue;
      const i = y * img.W + x;
      Ls.push(img.L[i]);
      As.push(img.A[i]);
      Bs.push(img.B[i]);
    }
  }
  if (!Ls.length) return { L: 255, A: 128, B: 128 };
  const order = Ls.map((_, i) => i).sort((p, q) => Ls[p] - Ls[q]);
  const top = order.slice(Math.floor(order.length * 0.5));
  const med = (arr: number[]) => arr.sort((p, q) => p - q)[Math.floor(arr.length / 2)];
  return { L: med(top.map((i) => Ls[i])), A: med(top.map((i) => As[i])), B: med(top.map((i) => Bs[i])) };
}

const likeRef = (img: LabImage, i: number, ref: Ref) => Math.abs(img.L[i] - ref.L) < Math.max(14, ref.L * 0.1) && Math.hypot(img.A[i] - ref.A, img.B[i] - ref.B) < 12;

// Share of the quad's inside that looks like card paper: bright for this
// photo and nearly colourless. Cloth, wood or skin inside a candidate means
// it is not the card.
function paperShare(img: LabImage, quad: Pt[]) {
  let paper = 0, n = 0;
  for (let u = 0.08; u <= 0.92; u += 0.05) {
    for (let v = 0.08; v <= 0.92; v += 0.05) {
      const top = { x: quad[0].x + (quad[1].x - quad[0].x) * u, y: quad[0].y + (quad[1].y - quad[0].y) * u };
      const bottom = { x: quad[3].x + (quad[2].x - quad[3].x) * u, y: quad[3].y + (quad[2].y - quad[3].y) * u };
      const x = Math.round(top.x + (bottom.x - top.x) * v), y = Math.round(top.y + (bottom.y - top.y) * v);
      if (x < 0 || y < 0 || x >= img.W || y >= img.H) continue;
      n++;
      if (isPaper(img, y * img.W + x)) paper++;
    }
  }
  return n ? paper / n : 0;
}

// Per side: step = colour step right at the edge (null = off-frame),
// wide = colour difference of wide strips either side, inPaper / outPaper =
// how paper-like those strips are, run = for an off-frame side, whether the
// neighbouring edges carry on into the frame edge.
type SideFeatures = { step: number | null; wide: number; inPaper: number; outPaper: number; inLike: number; outLike: number; run: number };
type QuadFeatures = { sides: SideFeatures[]; ratio: number; coverage: number; paper: number; ref: Ref };

function quadFeatures(img: LabImage, quad: Pt[], band: number): QuadFeatures | null {
  if (!isConvex(quad) || !saneAngles(quad)) return null;
  const { W, H } = img;
  // Corners may lie outside a photo that cuts the card off, but not far.
  if (quad.some((p) => p.x < -0.35 * W || p.y < -0.35 * H || p.x > 1.35 * W || p.y > 1.35 * H)) return null;
  const coverage = polygonArea(quad) / (W * H);
  if (coverage < 0.03 || coverage > 0.97) return null;
  const { w, h, ratio } = quadShape(quad);
  if (ratio > 2.8) return null;
  const c = centroid(quad);
  const ref = paperRef(img, quad);
  const steps = [0, 1, 2, 3].map((i) => sideStep(img, quad[i], quad[(i + 1) % 4], c, band));
  if (steps.filter((s) => s === null).length > 2) return null;
  // Two opposite sides off-frame (a card wider than the photo): only a
  // strong edge on both remaining sides and paper inside tell it from a
  // strip of background.
  const across = (steps[0] === null && steps[2] === null) || (steps[1] === null && steps[3] === null);
  if (across && (steps.some((s) => s !== null && s < 0.7) || paperShare(img, quad) < 0.6)) return null;
  const sides = steps.map((step, i) => {
    const a = quad[i], b = quad[(i + 1) % 4];
    const depth = (i % 2 === 0 ? h : w) * 0.1;
    const inner = strip(img, a, b, c, -depth * 0.6, -band, ref);
    const outer = step === null ? null : strip(img, a, b, c, band, depth * 0.6, ref);
    let run = 0;
    if (step === null) {
      const prev = steps[(i + 3) % 4], next = steps[(i + 1) % 4];
      const runs = [
        prev === null ? null : sideStep(img, quad[(i + 3) % 4], a, c, band, false, 0.75, 0.97),
        next === null ? null : sideStep(img, b, quad[(i + 2) % 4], c, band, false, 0.03, 0.25),
      ].filter((v): v is number => v !== null);
      run = runs.length ? Math.min(...runs) : 0;
    }
    const wide = inner && outer ? Math.hypot(inner.lab[0] - outer.lab[0], inner.lab[1] - outer.lab[1], inner.lab[2] - outer.lab[2]) : 20;
    return { step, wide, inPaper: inner ? inner.paper : 0, outPaper: outer ? outer.paper : 0, inLike: inner ? inner.like : 0, outLike: outer ? outer.like : 0, run };
  });
  return { sides, ratio, coverage, paper: paperShare(img, quad), ref };
}

function combineScore(f: QuadFeatures): { score: number; sides: (number | null)[] } {
  const sideScores = f.sides.map((s) => {
    // Off-frame side: believable only when the card's neighbouring edges
    // really run on into the frame edge.
    // A document page often runs past the photo's edge, so there it counts as is.
    if (s.step === null) return s.run > 0.45 ? 0.5 : documentMode ? 0.3 : 0.12;
    // Wide strips either side: different regions for a real edge, the same
    // card on both sides for a printed line, the same background on both
    // sides for a pouch outline. A real edge has card paper just inside it
    // and rarely the same paper just outside it.
    const wide = Math.min(1, Math.max(0, (s.wide - 3) / 14));
    return s.step * (0.5 + 0.5 * wide) * (0.75 + 0.25 * s.inPaper) * (1 - 0.25 * s.outLike);
  });
  const mean = sideScores.reduce((a, v) => a + v, 0) / 4;
  const edge = mean * (0.1 + 0.9 * Math.min(...sideScores));
  // Perspective stretches or squeezes the card's 1.59, so a broad band of
  // ratios is fine, nearer 1.59 is better; a card cut off by the frame can
  // be any shape.
  const border = f.sides.some((s) => s.step === null);
  const [lo, hi] = border ? [1.0, 2.8] : documentMode ? [1.0, 2.6] : [1.15, 1.85];
  let aspect = f.ratio < lo ? Math.exp(-Math.log(lo / f.ratio) * 5) : f.ratio > hi ? Math.exp(-Math.log(f.ratio / hi) * 5) : 1;
  if (!border && !documentMode) aspect *= Math.exp(-Math.abs(Math.log(f.ratio / CARD_RATIO)) * 2);
  // A page photo is taken to show the page, so a bigger outline is likelier
  // the page; a line printed across it (a header rule) must not win.
  const size = Math.sqrt(Math.min(1, f.coverage / 0.06)) * Math.pow(f.coverage, documentMode ? 0.6 : 0.2);
  const paper = Math.min(1, 0.3 + f.paper * 1.2);
  return { score: edge * aspect * size * paper, sides: sideScores };
}

// Cheap first pass: the basic shape tests and the colour step along the
// four sides, nothing else.
function quickScore(img: LabImage, quad: Pt[], band: number) {
  if (!isConvex(quad) || !saneAngles(quad)) return 0;
  const coverage = polygonArea(quad) / (img.W * img.H);
  if (coverage < 0.03 || coverage > 0.97 || quadShape(quad).ratio > 2.8) return 0;
  const c = centroid(quad);
  const steps = [0, 1, 2, 3].map((i) => sideStep(img, quad[i], quad[(i + 1) % 4], c, band));
  if (steps.filter((v) => v === null).length > 2) return 0;
  const vals = steps.map((v) => (v === null ? 0.5 : v));
  return (vals.reduce((a, v) => a + v, 0) / 4) * (0.3 + 0.7 * Math.min(...vals)) * Math.sqrt(Math.min(1, coverage / 0.06));
}

function scoreQuad(img: LabImage, quad: Pt[], band: number): Scored {
  const f = quadFeatures(img, quad, band);
  if (!f) return { quad, score: 0, sides: [] };
  return { quad, ...combineScore(f) };
}

// ---------- line candidates ----------

type Line = { rho: number; theta: number; border: boolean };

function lineIntersect(l1: Line, l2: Line): Pt | null {
  const c1 = Math.cos(l1.theta), s1 = Math.sin(l1.theta), c2 = Math.cos(l2.theta), s2 = Math.sin(l2.theta);
  const det = c1 * s2 - s1 * c2;
  if (Math.abs(det) < 1e-6) return null;
  return { x: (l1.rho * s2 - l2.rho * s1) / det, y: (c1 * l2.rho - c2 * l1.rho) / det };
}

// Angle between two lines, 0..pi/2.
function lineAngle(a: Line, b: Line) {
  const d = Math.abs(a.theta - b.theta) % Math.PI;
  return Math.min(d, Math.PI - d);
}

// Straight lines from the edge map (plus the photo's own borders, for a card
// the frame cuts off), combined four at a time into card-shaped quads. Finds
// cards whose outline never closes into a contour: soft white-on-white
// edges, a corner under a thumb, a side running out of the frame.
function lineQuads(cv: CV, edges: Mat, maxLines: number): Pt[][] {
  const W = edges.cols, H = edges.rows;
  const raw = new cv.Mat();
  cv.HoughLines(edges, raw, 1, Math.PI / 180, Math.round(Math.min(W, H) * 0.1), 0, 0, 0, Math.PI);
  const lines: Line[] = [];
  const rhoTol = 0.012 * Math.max(W, H), thetaTol = (3 * Math.PI) / 180;
  for (let i = 0; i < raw.rows && lines.length < maxLines; i++) {
    const rho = raw.data32F[i * 2], theta = raw.data32F[i * 2 + 1];
    const dup = lines.some((l) => {
      const dt = Math.abs(l.theta - theta);
      if (dt < thetaTol) return Math.abs(l.rho - rho) < rhoTol;
      if (Math.PI - dt < thetaTol) return Math.abs(l.rho + rho) < rhoTol;
      return false;
    });
    if (!dup) lines.push({ rho, theta, border: false });
  }
  raw.delete();
  lines.push({ rho: 0, theta: 0, border: true }, { rho: W - 1, theta: 0, border: true }, { rho: 0, theta: Math.PI / 2, border: true }, { rho: H - 1, theta: Math.PI / 2, border: true });

  // Near-parallel pairs a card-width apart.
  const minSep = 0.08 * Math.min(W, H);
  const pairs: [Line, Line, number][] = [];
  for (let i = 0; i < lines.length; i++) {
    for (let j = i + 1; j < lines.length; j++) {
      const a = lines[i], b = lines[j];
      if (a.border && b.border) continue;
      if (lineAngle(a, b) > (14 * Math.PI) / 180) continue;
      const mid = { x: W / 2, y: H / 2 };
      const da = Math.abs(mid.x * Math.cos(a.theta) + mid.y * Math.sin(a.theta) - a.rho);
      const db = Math.abs(mid.x * Math.cos(b.theta) + mid.y * Math.sin(b.theta) - b.rho);
      // Rough separation: the two lines' distances from the centre, on opposite sides or not.
      const pa = mid.x * Math.cos(a.theta) + mid.y * Math.sin(a.theta) - a.rho;
      let pb = mid.x * Math.cos(b.theta) + mid.y * Math.sin(b.theta) - b.rho;
      if (Math.abs(a.theta - b.theta) > Math.PI / 2) pb = -pb;
      const sep = Math.abs(pa - pb);
      if (sep < minSep || !Number.isFinite(da + db)) continue;
      // Mean direction of the pair, for the perpendicularity test below.
      let tb = b.theta;
      if (Math.abs(a.theta - tb) > Math.PI / 2) tb += tb < a.theta ? Math.PI : -Math.PI;
      pairs.push([a, b, (a.theta + tb) / 2]);
    }
  }
  const quads: Pt[][] = [];
  for (let i = 0; i < pairs.length; i++) {
    for (let j = i + 1; j < pairs.length; j++) {
      const [a, b, ta] = pairs[i], [c, d, tc] = pairs[j];
      if (a === c || a === d || b === c || b === d) continue;
      const diff = Math.abs(ta - tc) % Math.PI;
      if (Math.abs(Math.sin(diff)) < 0.8) continue;
      const pts = [lineIntersect(a, c), lineIntersect(c, b), lineIntersect(b, d), lineIntersect(d, a)];
      if (pts.some((p) => !p)) continue;
      quads.push(orderCorners(pts as Pt[]));
    }
  }
  return quads;
}

// How well a->b fits the card's outline: a colour step across it, the card's
// own paper just inside, and something else just outside (a pouch band, the
// background). 0..1.
function edgeFit(img: LabImage, a: Pt, b: Pt, c: Pt, band: number, ref: Ref): number | null {
  const len = dist(a, b);
  if (len < 8) return 0;
  let nx = -(b.y - a.y) / len, ny = (b.x - a.x) / len;
  if (((a.x + b.x) / 2 - c.x) * nx + ((a.y + b.y) / 2 - c.y) * ny < 0) {
    nx = -nx;
    ny = -ny;
  }
  const { L, A, B, W, H } = img;
  const offs = [band * 0.8, band * 1.6, band * 2.4];
  let sum = 0, n = 0, total = 0;
  for (let t = 0.1; t <= 0.9001; t += 0.032) {
    total++;
    const px = a.x + (b.x - a.x) * t, py = a.y + (b.y - a.y) * t;
    let iL = 0, iA = 0, iB = 0, oL = 0, oA = 0, oB = 0, inLike = 0, outLike = 0, m = 0;
    for (const o of offs) {
      const xi = Math.round(px - nx * o), yi = Math.round(py - ny * o);
      const xo = Math.round(px + nx * o), yo = Math.round(py + ny * o);
      if (xi < 0 || yi < 0 || xi >= W || yi >= H || xo < 0 || yo < 0 || xo >= W || yo >= H) continue;
      m++;
      const ii = yi * W + xi, oi = yo * W + xo;
      iL += L[ii];
      iA += A[ii];
      iB += B[ii];
      oL += L[oi];
      oA += A[oi];
      oB += B[oi];
      if (likeRef(img, ii, ref)) inLike++;
      if (likeRef(img, oi, ref)) outLike++;
    }
    if (!m) continue;
    const dE = Math.hypot(iL - oL, iA - oA, iB - oB) / m;
    sum += Math.min(1, Math.max(0, (dE - 4) / 20)) * (0.3 + 0.7 * (inLike / m)) * (1 - 0.6 * (outLike / m));
    n++;
  }
  if (n < total * 0.6) return null;
  return sum / n;
}

// Share of card paper in the strip between side a->b and its moved copy a2->b2.
function peeledPaper(img: LabImage, a: Pt, b: Pt, a2: Pt, b2: Pt, ref: Ref) {
  let like = 0, n = 0;
  for (let t = 0.1; t <= 0.9001; t += 0.05) {
    const p = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }, q = { x: a2.x + (b2.x - a2.x) * t, y: a2.y + (b2.y - a2.y) * t };
    const gap = dist(p, q);
    for (let u = 0.2; u <= 0.8001 && gap >= 3; u += 0.2) {
      const x = Math.round(p.x + (q.x - p.x) * u), y = Math.round(p.y + (q.y - p.y) * u);
      if (x < 0 || y < 0 || x >= img.W || y >= img.H) continue;
      n++;
      if (likeRef(img, y * img.W + x, ref)) like++;
    }
  }
  return n ? like / n : 0;
}

// Fine placement of each side: slide and tilt it a little outwards or up to
// ~12% inwards and keep the position that fits the card outline best. Peels
// off a laminate pouch's margin that was taken for the card's edge.
function snapQuad(img: LabImage, quad: Pt[], band: number): Pt[] {
  const ref = paperRef(img, quad);
  const c = centroid(quad);
  const { w, h } = quadShape(quad);
  const lines: { p: Pt; d: Pt }[] = [];
  for (let i = 0; i < 4; i++) {
    const a = quad[i], b = quad[(i + 1) % 4];
    const len = dist(a, b) || 1;
    let nx = -(b.y - a.y) / len, ny = (b.x - a.x) / len; // made to point inwards
    if ((c.x - (a.x + b.x) / 2) * nx + (c.y - (a.y + b.y) / 2) * ny < 0) {
      nx = -nx;
      ny = -ny;
    }
    const base = edgeFit(img, a, b, c, band, ref);
    let best = { v: base ?? -1, a, b };
    if (base !== null) {
      const D = i % 2 === 0 ? h : w;
      const lo = -0.012 * D, hi = 0.12 * D;
      const at = (oa: number, ob: number) => ({ a: { x: a.x + nx * oa, y: a.y + ny * oa }, b: { x: b.x + nx * ob, y: b.y + ny * ob } });
      const tryAt = (oa: number, ob: number) => {
        const cand = at(oa, ob);
        const v = edgeFit(img, cand.a, cand.b, c, band, ref);
        if (v !== null && v > best.v) best = { v, ...cand, oa, ob } as typeof best;
      };
      const step = Math.max(1, (hi - lo) / 14);
      for (let oa = lo; oa <= hi; oa += step) for (let ob = lo; ob <= hi; ob += step) tryAt(oa, ob);
      const bo = best as typeof best & { oa?: number; ob?: number };
      if (bo.oa !== undefined) {
        const [ca, cb] = [bo.oa, bo.ob as number];
        for (let da = -step; da <= step; da += Math.max(0.5, step / 4)) for (let db = -step; db <= step; db += Math.max(0.5, step / 4)) tryAt(ca + da, cb + db);
      }
      // Only move for a clearly better fit, and never peel off card paper
      // (a white margin above a coloured header, say): what comes off must
      // be pouch or background.
      if (best.v < (base as number) * 1.1 + 0.02 || peeledPaper(img, a, b, best.a, best.b, ref) > 0.2) best = { v: base as number, a, b };
    }
    lines.push({ p: best.a, d: { x: best.b.x - best.a.x, y: best.b.y - best.a.y } });
  }
  const next: Pt[] = [];
  for (let i = 0; i < 4; i++) {
    const l1 = lines[(i + 3) % 4], l2 = lines[i];
    const det = l1.d.x * l2.d.y - l1.d.y * l2.d.x;
    if (Math.abs(det) < 1e-6) return quad;
    const t = ((l2.p.x - l1.p.x) * l2.d.y - (l2.p.y - l1.p.y) * l2.d.x) / det;
    next.push({ x: l1.p.x + t * l1.d.x, y: l1.p.y + t * l1.d.y });
  }
  return next;
}

// Plain dark or white bars along the photo's edges (a phone screenshot's
// status and navigation bars, a camera's watermark strip): the region
// inside them.
function trimBars(rgba: Mat) {
  const W = rgba.cols, H = rgba.rows, d = rgba.data;
  const lum = (x: number, y: number) => {
    const i = (y * W + x) * 4;
    return (d[i] + d[i + 1] + d[i + 2]) / 3;
  };
  // A bar line: nearly all of it one flat, very dark or very bright tone
  // (a few icons or letters allowed).
  const isBar = (n: number, at: (j: number) => number) => {
    const vals: number[] = [];
    for (let j = 0; j < n; j += 2) vals.push(at(j));
    vals.sort((p, q) => p - q);
    const med = vals[vals.length >> 1];
    if (med > 45 && med < 225) return false;
    return vals.filter((v) => Math.abs(v - med) < 18).length >= vals.length * 0.85;
  };
  const scan = (count: number, span: number, at: (i: number, j: number) => number) => {
    let last = -1, gap = 0;
    for (let i = 0; i < count * 0.4; i++) {
      if (isBar(span, (j) => at(i, j))) {
        last = i;
        gap = 0;
      } else if (++gap > count * 0.03) break;
    }
    return last + 1 >= count * 0.03 ? last + 1 : 0;
  };
  const top = scan(H, W, (i, j) => lum(j, i));
  const bottom = scan(H, W, (i, j) => lum(j, H - 1 - i));
  const left = scan(W, H, (i, j) => lum(i, j));
  const right = scan(W, H, (i, j) => lum(W - 1 - i, j));
  const w = W - left - right, h = H - top - bottom;
  if (w < W * 0.5 || h < H * 0.5) return { x: 0, y: 0, w: W, h: H };
  return { x: left, y: top, w, h };
}

// "Clean first, then look for the card": the photo is downsized and
// median-filtered so cloth weave, wood grain and card text melt away while
// the card's long straight edges stay. Candidates come from closed contours
// in several edge / region maps and from straight lines; all are ranked by
// the same step-edge score.
function detectQuad(cv: CV, rgba: Mat): Pt[] | null {
  const maxSide = 900;
  const k = Math.min(1, maxSide / Math.max(rgba.cols, rgba.rows));
  const small = new cv.Mat();
  cv.resize(rgba, small, new cv.Size(Math.round(rgba.cols * k), Math.round(rgba.rows * k)), 0, 0, cv.INTER_AREA);
  // Screenshots and camera watermarks put plain bars around the real photo;
  // look for the card inside them, or the bars' edges pass for card edges.
  const box = trimBars(small);
  const inner = small.roi(new cv.Rect(box.x, box.y, box.w, box.h));
  const rgb = new cv.Mat();
  cv.cvtColor(inner, rgb, cv.COLOR_RGBA2RGB);
  inner.delete();
  const W = rgb.cols, H = rgb.rows;
  const imgArea = W * H;
  const cleanup: Mat[] = [small, rgb];
  const contourQuads: Pt[][] = [];
  const addContours = (edges: Mat) => candidatesFromEdges(cv, edges, imgArea).forEach((cand) => contourQuads.push(cand.quad));

  // Cleaned copies: a light one for measuring edges, a heavy one for finding them.
  const clean = new cv.Mat();
  cv.medianBlur(rgb, clean, 5);
  cleanup.push(clean);
  const heavy = new cv.Mat();
  cv.medianBlur(rgb, heavy, oddify(Math.max(W, H) / 90, 7));
  cleanup.push(heavy);
  const lab = toLab(cv, clean);
  const band = Math.max(1.5, Math.max(W, H) * 0.0035);

  const gray = new cv.Mat();
  cv.cvtColor(clean, gray, cv.COLOR_RGB2GRAY);
  cleanup.push(gray);
  const grayHeavy = new cv.Mat();
  cv.cvtColor(heavy, grayHeavy, cv.COLOR_RGB2GRAY);
  cleanup.push(grayHeavy);

  const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));
  cleanup.push(kernel);
  const closed = (edges: Mat) => {
    const e = new cv.Mat();
    cv.dilate(edges, e, kernel, new cv.Point(-1, -1), 2);
    cv.erode(e, e, kernel, new cv.Point(-1, -1), 1);
    return e;
  };

  // Auto Canny thresholds from the gradient strength of an image (brightness
  // based ones are far too high on white-on-white).
  const autoCanny = (src: Mat) => {
    const gx = new cv.Mat(), gy = new cv.Mat(), mag = new cv.Mat();
    cv.Sobel(src, gx, cv.CV_32F, 1, 0);
    cv.Sobel(src, gy, cv.CV_32F, 0, 1);
    cv.magnitude(gx, gy, mag);
    const sorted = Float32Array.from(mag.data32F).sort();
    const hiT = Math.max(12, sorted[Math.floor(sorted.length * 0.92)]);
    const e = new cv.Mat();
    cv.Canny(src, e, hiT * 0.4, hiT);
    [gx, gy, mag].forEach((m) => m.delete());
    return e;
  };

  // 1) luminance edges, light and heavy clean-up
  const e1 = autoCanny(gray);
  const e3 = autoCanny(grayHeavy);
  cleanup.push(e1, e3);
  // 2) colour edges: strongest response of any channel
  const e2 = cv.Mat.zeros(H, W, cv.CV_8U);
  cleanup.push(e2);
  {
    const channels = new cv.MatVector();
    cv.split(heavy, channels);
    for (let c = 0; c < 3; c++) {
      const ch = channels.get(c);
      const e = autoCanny(ch);
      cv.bitwise_or(e2, e, e2);
      e.delete();
      ch.delete();
    }
    channels.delete();
  }
  for (const e of [e1, e2, e3]) {
    const c = closed(e);
    addContours(c);
    c.delete();
  }
  // 3) region split: Otsu on the heavily cleaned grey image, closed into blobs
  for (const invert of [false, true]) {
    const bin = new cv.Mat();
    cv.threshold(grayHeavy, bin, 0, 255, (invert ? cv.THRESH_BINARY_INV : cv.THRESH_BINARY) + cv.THRESH_OTSU);
    const big = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(9, 9));
    cv.morphologyEx(bin, bin, cv.MORPH_CLOSE, big);
    cv.morphologyEx(bin, bin, cv.MORPH_OPEN, big);
    addContours(bin);
    big.delete();
    bin.delete();
  }
  // 4) straight lines of the heavy-clean edge maps
  const lineEdges = new cv.Mat();
  cv.bitwise_or(e2, e3, lineEdges);
  cleanup.push(lineEdges);
  const lq = lineQuads(cv, lineEdges, 28);

  cleanup.forEach((m) => m.delete());

  // Text lines on a document (and busy backgrounds) give thousands of
  // four-line combinations: keep the ones with a real colour step along
  // their sides before the full (slow) scoring.
  const seen = new Set<string>();
  const unique = [...contourQuads, ...lq].filter((q) => {
    const key = q.map((p) => `${Math.round(p.x / 4)},${Math.round(p.y / 4)}`).join(" ");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const shortlist = unique.length <= 300 ? unique : unique
    .map((q) => ({ q, v: quickScore(lab, q, band) }))
    .filter((c) => c.v > 0)
    .sort((a, b) => b.v - a.v)
    .slice(0, 300)
    .map((c) => c.q);
  let scored = shortlist.map((q) => scoreQuad(lab, q, band)).filter((s) => s.score > 0);
  if ((ctx as { debug?: boolean }).debug) (ctx as unknown as { cands: unknown }).cands = { k, box, lab, band, all: scored.map((s) => ({ ...s })), raw: [...contourQuads, ...lq] };
  if (!scored.length) return null;
  scored.sort((a, b) => b.score - a.score);
  if ((ctx as { debug?: boolean }).debug)
    scored.slice(0, 6).forEach((c) => console.log("cand", c.score.toFixed(3), c.sides.map((s) => (s === null ? "B" : s.toFixed(2))).join(","), JSON.stringify(c.quad.map((p) => [Math.round(p.x / k), Math.round(p.y / k)]))));
  let best = scored[0];
  if (!best || best.score < 0.12) return null;
  // A document's printed rules (a header line, a table border) can outscore
  // the page's own soft edge against a pale wall. A near-equal outline that
  // encloses the winner is the page itself.
  if (documentMode) {
    const outer = scored
      .filter((c) => c !== best && c.score >= best.score * 0.9 && polygonArea(c.quad) > polygonArea(best.quad) * 1.04 && encloses(c.quad, best.quad, band * 4))
      .sort((a, b) => polygonArea(b.quad) - polygonArea(a.quad))[0];
    if (outer) best = outer;
  }
  return snapQuad(lab, best.quad, band).map((p) => ({ x: (p.x + box.x) / k, y: (p.y + box.y) / k }));
}

// Landscape output: make the first edge (TL->TR) the long side.
function landscape(quad: Pt[]): Pt[] {
  const w = (dist(quad[0], quad[1]) + dist(quad[3], quad[2])) / 2;
  const h = (dist(quad[0], quad[3]) + dist(quad[1], quad[2])) / 2;
  return h > w * 1.05 ? [quad[3], quad[0], quad[1], quad[2]] : quad;
}

// ---------- orientation ----------

// Indian ID cards (Aadhaar front and back especially) carry the orange/green
// tricolour header at the top and the red line / red "आधार" at the bottom.
// Compares those colours in the top and bottom bands of the straightened card;
// true = the card is upside down. Stays false when the evidence is weak.
function looksUpsideDown(cv: CV, card: Mat): boolean {
  const line = redLineRow(cv, card);
  if (line !== null) return line < 0.4;
  return colourUpsideDown(cv, card);
}

// Height (0 = top, 1 = bottom) of the long thin red rule an Aadhaar card
// carries above its footer, front and back; null when there is none. Holds
// up on faded, tinted or glare-covered cards where the header colours fail.
function redLineRow(cv: CV, card: Mat): number | null {
  const small = new cv.Mat();
  cv.resize(card, small, new cv.Size(360, Math.round((360 * card.rows) / card.cols)), 0, 0, cv.INTER_AREA);
  const rgb = new cv.Mat();
  cv.cvtColor(small, rgb, cv.COLOR_RGBA2RGB);
  const lab = new cv.Mat();
  cv.cvtColor(rgb, lab, cv.COLOR_RGB2Lab);
  const W = lab.cols, H = lab.rows, d = lab.data;
  const rows = new Array(H).fill(0);
  for (let y = 0; y < H; y++) {
    let run = 0, best = 0;
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 3;
      const a = d[i + 1] - 128, b = d[i + 2] - 128;
      // red, pink or magenta; not the orange header (b above a)
      const red = a > 12 && b < a * 0.9;
      // longest run, allowing small gaps where text touches the line
      run = red ? run + 1 : Math.max(0, run - 3);
      best = Math.max(best, run);
    }
    rows[y] = best;
  }
  [small, rgb, lab].forEach((m) => m.delete());
  let bestY = -1, bestLen = 0;
  // The outermost rows can hold the card's own (reddish) edge, not the rule.
  for (let y = Math.round(H * 0.05); y < H * 0.95; y++) {
    if (rows[y] > bestLen) {
      bestLen = rows[y];
      bestY = y;
    }
  }
  // A rule runs most of the card's width and is thin: a few rows away it is gone.
  if (bestLen < W * 0.45) return null;
  const off = Math.max(4, Math.round(H * 0.03));
  const around = Math.max(bestY - off >= 0 ? rows[bestY - off] : 0, bestY + off < H ? rows[bestY + off] : 0);
  if (around > bestLen * 0.5) return null;
  const y = bestY / H;
  return y > 0.6 || y < 0.4 ? y : null;
}

function colourUpsideDown(cv: CV, card: Mat): boolean {
  const small = new cv.Mat();
  cv.resize(card, small, new cv.Size(360, Math.round((360 * card.rows) / card.cols)), 0, 0, cv.INTER_AREA);
  const rgb = new cv.Mat();
  cv.cvtColor(small, rgb, cv.COLOR_RGBA2RGB);
  const hsv = new cv.Mat();
  cv.cvtColor(rgb, hsv, cv.COLOR_RGB2HSV);
  const W = hsv.cols, H = hsv.rows, d = hsv.data;
  const band = Math.round(H * 0.35);
  let headTop = 0, headBottom = 0, redTop = 0, redBottom = 0;
  for (let y = 0; y < H; y++) {
    const inTop = y < band, inBottom = y >= H - band;
    if (!inTop && !inBottom) continue;
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 3;
      const h = d[i], sat = d[i + 1], v = d[i + 2];
      if (sat < 80 || v < 70) continue;
      const orange = h >= 6 && h <= 25 && v > 120;
      const green = h >= 35 && h <= 100;
      const red = h <= 5 || h >= 170;
      if (orange || green) {
        if (inTop) headTop++;
        else headBottom++;
      } else if (red) {
        if (inTop) redTop++;
        else redBottom++;
      }
    }
  }
  [small, rgb, hsv].forEach((m) => m.delete());
  const area = W * band;
  const score = (headBottom - headTop) + 0.6 * (redTop - redBottom);
  return score > area * 0.01 && headBottom + redTop > area * 0.012;
}

// ---------- clean-up ----------

// Flattens uneven light and shadows, neutralises colour casts, pushes the
// card background to clean white and sharpens - so a phone photo prints
// like a scanner copy. "photocopy" returns a crisp greyscale version.
function enhance(cv: CV, rgba: Mat, mode: ScanMode): Mat {
  const del: Mat[] = [];
  const t = <T,>(m: T): T => {
    del.push(m);
    return m;
  };
  const rgb = t(new cv.Mat());
  cv.cvtColor(rgba, rgb, cv.COLOR_RGBA2RGB);
  const smooth = t(new cv.Mat());
  cv.bilateralFilter(rgb, smooth, 5, 35, 35, cv.BORDER_DEFAULT);
  const lab = t(new cv.Mat());
  cv.cvtColor(smooth, lab, cv.COLOR_RGB2Lab);
  const parts = t(new cv.MatVector());
  cv.split(lab, parts);
  const L = t(parts.get(0)), A = t(parts.get(1)), B = t(parts.get(2));

  // Illumination map: close the lightness at low resolution with a kernel
  // bigger than the photo/text blocks, so only the lighting remains.
  // Lighting is smooth, so ~120px on the short side is plenty - and keeps
  // the big closing kernel cheap on a 3000px page.
  const q = Math.max(4, Math.min(L.rows, L.cols) / 120);
  const smallL = t(new cv.Mat());
  cv.resize(L, smallL, new cv.Size(Math.max(8, Math.round(L.cols / q)), Math.max(8, Math.round(L.rows / q))), 0, 0, cv.INTER_AREA);
  const ks = oddify(Math.min(smallL.rows, smallL.cols) * 0.55, 15);
  const kernel = t(cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(ks, ks)));
  const bgSmall = t(new cv.Mat());
  cv.morphologyEx(smallL, bgSmall, cv.MORPH_CLOSE, kernel);
  cv.GaussianBlur(bgSmall, bgSmall, new cv.Size(oddify(ks / 2), oddify(ks / 2)), 0);
  const bg = t(new cv.Mat());
  cv.resize(bgSmall, bg, new cv.Size(L.cols, L.rows), 0, 0, cv.INTER_LINEAR);

  const Lf = t(new cv.Mat()), bgf = t(new cv.Mat()), flatF = t(new cv.Mat());
  L.convertTo(Lf, cv.CV_32F);
  bg.convertTo(bgf, cv.CV_32F, 1, 1);
  cv.divide(Lf, bgf, flatF, 250);
  const flat = t(new cv.Mat());
  flatF.convertTo(flat, cv.CV_8U);

  // Levels: background (the bright majority) to white, darkest 1% to black.
  const hist: number[] = new Array(256).fill(0);
  // mat.data builds a fresh view on every access - read it once, not per pixel.
  const fd: Uint8Array = flat.data;
  for (let i = 0; i < fd.length; i++) hist[fd[i]]++;
  const black = percentile(hist, fd.length, 0.01);
  const white = Math.max(black + 40, Math.min(250, percentile(hist, fd.length, 0.6)));
  const lut = new Uint8Array(256);
  const gamma = mode === "photocopy" ? 1.15 : 1.05;
  for (let v = 0; v < 256; v++) {
    const x = Math.min(1, Math.max(0, (v - black) / (white - black)));
    lut[v] = Math.round(255 * Math.pow(x, gamma));
  }
  const d = flat.data;
  for (let i = 0; i < d.length; i++) d[i] = lut[d[i]];

  let out: Mat;
  if (mode === "photocopy") {
    const blurred = t(new cv.Mat());
    cv.GaussianBlur(flat, blurred, new cv.Size(0, 0), 1.2);
    const sharp = t(new cv.Mat());
    cv.addWeighted(flat, 1.6, blurred, -0.6, 0, sharp);
    out = new cv.Mat();
    cv.cvtColor(sharp, out, cv.COLOR_GRAY2RGBA);
  } else {
    // Neutralise the colour cast measured on the bright background, and
    // give colours a small lift so faded prints look fresh.
    let sa = 0, sb = 0, n = 0;
    const Ld = L.data, Ad = A.data, Bd = B.data;
    const bright = percentile(hist, fd.length, 0.7);
    for (let i = 0; i < fd.length; i += 3) {
      if (fd[i] >= 235 || Ld[i] >= bright) {
        sa += Ad[i];
        sb += Bd[i];
        n++;
      }
    }
    // Capped: a strongly coloured card background must not be "corrected" to grey.
    const clampCast = (v: number) => Math.max(-10, Math.min(10, v));
    const da = n ? clampCast(sa / n - 128) : 0, db = n ? clampCast(sb / n - 128) : 0;
    const boost = 1.12;
    for (let i = 0; i < Ad.length; i++) {
      Ad[i] = Math.max(0, Math.min(255, 128 + (Ad[i] - 128 - da) * boost));
      Bd[i] = Math.max(0, Math.min(255, 128 + (Bd[i] - 128 - db) * boost));
    }
    const merged = t(new cv.MatVector());
    merged.push_back(flat);
    merged.push_back(A);
    merged.push_back(B);
    const lab2 = t(new cv.Mat());
    cv.merge(merged, lab2);
    const rgb2 = t(new cv.Mat());
    cv.cvtColor(lab2, rgb2, cv.COLOR_Lab2RGB);
    const blurred = t(new cv.Mat());
    cv.GaussianBlur(rgb2, blurred, new cv.Size(0, 0), 1.2);
    const sharp = t(new cv.Mat());
    cv.addWeighted(rgb2, 1.45, blurred, -0.45, 0, sharp);
    out = new cv.Mat();
    cv.cvtColor(sharp, out, cv.COLOR_RGB2RGBA);
  }
  del.forEach((m) => m.delete());
  return out;
}

// Scanner-style black & white for a document page: paper pure white, print
// and handwriting (black, blue or red ink alike) solid black, with smooth
// stroke edges - the look of a good photocopy.
function enhanceDocument(cv: CV, rgba: Mat, darkness = DOC_DARKNESS): Mat {
  const del: Mat[] = [];
  const t = <T,>(m: T): T => {
    del.push(m);
    return m;
  };
  const rgb = t(new cv.Mat());
  cv.cvtColor(rgba, rgb, cv.COLOR_RGBA2RGB);
  const parts = t(new cv.MatVector());
  cv.split(rgb, parts);
  // Darkest channel: coloured ink is dark in at least one of R, G, B, paper in none.
  const ink = t(new cv.Mat());
  cv.min(t(parts.get(0)), t(parts.get(1)), ink);
  cv.min(ink, t(parts.get(2)), ink);
  // Paper brightness everywhere (lighting, shadows, curl): close away the
  // strokes on a small copy, smooth, scale back up.
  const q = Math.max(2, Math.min(ink.rows, ink.cols) / 200);
  const small = t(new cv.Mat());
  cv.resize(ink, small, new cv.Size(Math.round(ink.cols / q), Math.round(ink.rows / q)), 0, 0, cv.INTER_AREA);
  const ks = oddify(Math.min(small.rows, small.cols) * DOC_CLOSE, 5);
  const paperSmall = t(new cv.Mat());
  cv.morphologyEx(small, paperSmall, cv.MORPH_CLOSE, t(cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(ks, ks))));
  cv.GaussianBlur(paperSmall, paperSmall, new cv.Size(oddify(ks * 1.5), oddify(ks * 1.5)), 0);
  const paper = t(new cv.Mat());
  cv.resize(paperSmall, paper, new cv.Size(ink.cols, ink.rows), 0, 0, cv.INTER_LINEAR);
  // Ink relative to the paper right around it: 255 = paper, lower = darker.
  const inkF = t(new cv.Mat()), paperF = t(new cv.Mat()), ratio = t(new cv.Mat());
  ink.convertTo(inkF, cv.CV_32F);
  paper.convertTo(paperF, cv.CV_32F, 1, 1);
  cv.divide(inkF, paperF, ratio, 255);
  const flat = t(new cv.Mat());
  ratio.convertTo(flat, cv.CV_8U);
  // Top of the slider: faint ballpoint handwriting printed bold, as a
  // photocopier does.
  if (darkness >= 80) cv.erode(flat, flat, t(cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(3, 3))));
  cv.GaussianBlur(flat, flat, new cv.Size(0, 0), DOC_SOFT);
  // Tone curve: paper (and faint paper texture) to white, print and
  // handwriting to dark grey-black, keeping each stroke's own width and its
  // smooth edges - a clean scan, not a hard threshold. Darker moves the
  // white point up and deepens the mid tones, so faint ink prints stronger.
  const dk = Math.max(0, Math.min(100, darkness));
  const white = DOC_WHITE_BASE + dk * DOC_WHITE_STEP;
  const black = DOC_BLACK_BASE + dk * DOC_BLACK_STEP;
  // Below ~35 the curve lifts mid tones (gamma < 1): strokes print as dark grey.
  const gamma = DOC_GAMMA_BASE + dk * DOC_GAMMA_STEP;
  const lut = new Uint8Array(256);
  for (let v = 0; v < 256; v++) {
    const x = Math.min(1, Math.max(0, (v - black) / (white - black)));
    lut[v] = Math.round(255 * Math.pow(x, gamma));
  }
  const d: Uint8Array = flat.data;
  for (let i = 0; i < d.length; i++) d[i] = lut[d[i]];
  const out = new cv.Mat();
  cv.cvtColor(flat, out, cv.COLOR_GRAY2RGBA);
  del.forEach((m) => m.delete());
  return out;
}

const DOC_CLOSE = 0.04, DOC_SOFT = 0.5, DOC_DARKNESS = 25;
const DOC_WHITE_BASE = 200, DOC_WHITE_STEP = 0.35, DOC_BLACK_BASE = 0, DOC_BLACK_STEP = 1.8, DOC_GAMMA_BASE = 0.6, DOC_GAMMA_STEP = 0.012;

// A document photo: cleaned as it is - the whole photo, no automatic crop
// (page detection was not reliable enough on real documents). Corners
// passed in (a manual perspective crop) are still straightened first.
function scanDocument(cv: CV, src: Mat, request: ScanRequest) {
  const { id, width, height, mode } = request;
  const quad = request.quad ? [0, 1, 2, 3].map((i) => ({ x: (request.quad![i * 2] / 100) * width, y: (request.quad![i * 2 + 1] / 100) * height })) : null;
  let page: Mat;
  if (quad) {
    const w = (dist(quad[0], quad[1]) + dist(quad[3], quad[2])) / 2;
    const h = (dist(quad[0], quad[3]) + dist(quad[1], quad[2])) / 2;
    // Keep the photo's detail; 1600-3000px on the long side prints sharp at A4.
    const long = Math.max(w, h);
    const k = Math.min(3000, Math.max(1600, long)) / long;
    const outW = Math.round(w * k), outH = Math.round(h * k);
    const srcPts = cv.matFromArray(4, 1, cv.CV_32FC2, quad.flatMap((p) => [p.x, p.y]));
    const dstPts = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, outW, 0, outW, outH, 0, outH]);
    const M = cv.getPerspectiveTransform(srcPts, dstPts);
    page = new cv.Mat();
    cv.warpPerspective(src, page, M, new cv.Size(outW, outH), cv.INTER_CUBIC, cv.BORDER_REPLICATE, new cv.Scalar());
    [srcPts, dstPts, M].forEach((m) => m.delete());
  } else {
    page = src.clone();
  }
  let result = page;
  if (mode !== "original") {
    // "photocopy" = scanner black & white; "clean" = colour kept, just cleaned.
    result = mode === "photocopy" ? enhanceDocument(cv, page, request.darkness) : enhance(cv, page, mode);
    page.delete();
  }
  const outBuffer = new Uint8ClampedArray(result.data).buffer;
  const outW = result.cols, outH = result.rows;
  result.delete();
  const full = [0, 0, width, 0, width, height, 0, height];
  const quadPercent = (quad ? quad.flatMap((p) => [p.x, p.y]) : full).map((v, i) => (v / (i % 2 ? height : width)) * 100);
  ctx.postMessage({ type: "result", id, found: true, detected: Boolean(quad), quad: quadPercent, width: outW, height: outH, buffer: outBuffer }, [outBuffer]);
}

async function handleScan(request: ScanRequest) {
  const { id, width, height, buffer, mode, outWidth, outHeight } = request;
  let src: Mat = null;
  documentMode = request.kind === "document";
  try {
    const { instance: cv } = await loadOpenCv();
    src = cv.matFromImageData(new ImageData(new Uint8ClampedArray(buffer), width, height));
    if (documentMode) {
      scanDocument(cv, src, request);
      return;
    }
    let quad: Pt[] | null = null;
    let detected = false;
    if (request.quad) {
      quad = [0, 1, 2, 3].map((i) => ({ x: (request.quad![i * 2] / 100) * width, y: (request.quad![i * 2 + 1] / 100) * height }));
    } else {
      quad = detectQuad(cv, src);
      detected = Boolean(quad);
      if (!quad) {
        // Nothing found, but the photo itself is card-shaped: it is most
        // likely already cropped to the card, so use the whole frame.
        const ratio = Math.max(width, height) / Math.min(width, height);
        // 1.5-1.68 brackets the card (1.585) but not phone photos (4:3, 16:9).
        if (ratio > 1.5 && ratio < 1.68) {
          quad = [{ x: 0, y: 0 }, { x: width, y: 0 }, { x: width, y: height }, { x: 0, y: height }];
          detected = true;
        }
      }
      if (quad) quad = landscape(quad);
    }
    if (!quad) {
      ctx.postMessage({ type: "result", id, found: false });
      return;
    }
    const srcPts = cv.matFromArray(4, 1, cv.CV_32FC2, quad.flatMap((p) => [p.x, p.y]));
    const dstPts = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, outWidth, 0, outWidth, outHeight, 0, outHeight]);
    const M = cv.getPerspectiveTransform(srcPts, dstPts);
    const warped = new cv.Mat();
    cv.warpPerspective(src, warped, M, new cv.Size(outWidth, outHeight), cv.INTER_CUBIC, cv.BORDER_REPLICATE, new cv.Scalar());
    srcPts.delete();
    dstPts.delete();
    M.delete();
    // Auto-detected cards may come out upside down (portrait photos); turn
    // them when the card's own colours say so. Corners the user placed are
    // taken as meant.
    if (detected && looksUpsideDown(cv, warped)) {
      cv.rotate(warped, warped, cv.ROTATE_180);
      quad = [quad[2], quad[3], quad[0], quad[1]];
    }
    let result = warped;
    if (mode !== "original") {
      result = enhance(cv, warped, mode);
      warped.delete();
    }
    const outBuffer = new Uint8ClampedArray(result.data).buffer;
    result.delete();
    const quadPercent = quad.flatMap((p) => [(p.x / width) * 100, (p.y / height) * 100]);
    ctx.postMessage({ type: "result", id, found: true, detected, quad: quadPercent, width: outWidth, height: outHeight, buffer: outBuffer }, [outBuffer]);
  } catch (error) {
    ctx.postMessage({ type: "error", id, message: error instanceof Error ? error.message : String(error) });
  } finally {
    src?.delete();
  }
}

ctx.onmessage = (event) => {
  if (event.data?.type === "scan") void handleScan(event.data);
};
