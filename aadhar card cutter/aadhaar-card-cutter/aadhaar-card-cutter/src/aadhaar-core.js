// ---- Aadhaar card core: content-stream editing, cropping, sheet layouts ----
// Works in the browser (globals PDFLib, pdfjsLib) and in Node (pass them in).
function makeAadhaarCore(PDFLib, pdfjsLib) {
  const { PDFDocument, PDFName, PDFArray, PDFRawStream, decodePDFRawStream, StandardFonts, rgb } = PDFLib;

  // Standard e-Aadhaar letter (612 x 792 pt), boxes measured from the top.
  const REF_W = 612, REF_H = 792;
  const FRONT = { x0: 49.3, top: 574.2, x1: 300.7, bottom: 733.3 };
  const BACK = { x0: 311.8, top: 574.2, x1: 563.2, bottom: 733.3 };
  const MM = 72 / 25.4;
  const CARD_W = 85.6 * MM, CARD_H = 54 * MM; // CR80 card

  // ---------- bytes <-> latin1 string ----------
  function bytesToStr(u8) {
    let s = '';
    for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
    return s;
  }
  function strToBytes(s) {
    const u8 = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) u8[i] = s.charCodeAt(i) & 0xff;
    return u8;
  }

  // ---------- content stream tokenizer ----------
  const WS = new Set([0, 9, 10, 12, 13, 32]);
  const DELIM = new Set('()<>[]{}/%'.split('').map(c => c.charCodeAt(0)));
  function tokenize(s) {
    const ops = []; let operands = []; let i = 0; const n = s.length;
    const isWS = c => WS.has(c);
    function skipWS() {
      while (i < n) {
        const c = s.charCodeAt(i);
        if (isWS(c)) i++;
        else if (c === 37) { while (i < n && s[i] !== '\n' && s[i] !== '\r') i++; }
        else break;
      }
    }
    function readRegular() { const st = i; while (i < n) { const c = s.charCodeAt(i); if (isWS(c) || DELIM.has(c)) break; i++; } return s.slice(st, i); }
    function readString() { let depth = 0; while (i < n) { const ch = s[i]; if (ch === '\\') { i += 2; continue; } if (ch === '(') depth++; else if (ch === ')') { depth--; if (depth === 0) { i++; return; } } i++; } }
    function readValue() {
      skipWS(); const st = i; const ch = s[i];
      if (ch === '(') { readString(); return { type: 'str', start: st, end: i }; }
      if (ch === '<' && s[i + 1] === '<') { i += 2; while (i < n) { skipWS(); if (s[i] === '>' && s[i + 1] === '>') { i += 2; break; } readValue(); } return { type: 'dict', start: st, end: i }; }
      if (ch === '<') { while (i < n && s[i] !== '>') i++; i++; return { type: 'hex', start: st, end: i }; }
      if (ch === '[') { i++; const items = []; while (i < n) { skipWS(); if (s[i] === ']') { i++; break; } items.push(readValue()); } return { type: 'array', start: st, end: i, items }; }
      if (ch === '/') { i++; const v = readRegular(); return { type: 'name', value: v, start: st, end: i }; }
      const w = readRegular();
      if (w === '') { i++; return { type: 'junk', start: st, end: i }; }
      if (/^[+-]?(\d+\.?\d*|\.\d+)$/.test(w)) return { type: 'num', value: parseFloat(w), start: st, end: i };
      return { type: 'kw', value: w, start: st, end: i };
    }
    while (i < n) {
      skipWS(); if (i >= n) break;
      const v = readValue();
      if (v.type === 'kw' && v.value !== 'true' && v.value !== 'false' && v.value !== 'null') {
        const op = { op: v.value, operands, start: operands.length ? operands[0].start : v.start, end: v.end, opStart: v.start };
        ops.push(op); operands = [];
        if (v.value === 'BI') { // inline image: skip to EI
          const m = s.indexOf('ID', i); let j = m + 3;
          while (j < n) { if (s[j] === 'E' && s[j + 1] === 'I' && isWS(s.charCodeAt(j - 1)) && (j + 2 >= n || isWS(s.charCodeAt(j + 2)))) break; j++; }
          i = j + 2; ops.push({ op: 'EI', operands: [], start: j, end: i });
        }
      } else operands.push(v);
    }
    return ops;
  }

  // ---------- matrices ----------
  const I = [1, 0, 0, 1, 0, 0];
  function mul(m1, m2) {
    return [m1[0] * m2[0] + m1[1] * m2[2], m1[0] * m2[1] + m1[1] * m2[3], m1[2] * m2[0] + m1[3] * m2[2], m1[2] * m2[1] + m1[3] * m2[3],
      m1[4] * m2[0] + m1[5] * m2[2] + m2[4], m1[4] * m2[1] + m1[5] * m2[3] + m2[5]];
  }
  function inv(m) {
    const det = m[0] * m[3] - m[1] * m[2];
    return [m[3] / det, -m[1] / det, -m[2] / det, m[0] / det, (m[2] * m[5] - m[3] * m[4]) / det, (m[1] * m[4] - m[0] * m[5]) / det];
  }
  const apply = (m, x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
  const fmt = v => { const r = Math.round(v * 10000) / 10000; return (Object.is(r, -0) ? 0 : r).toString(); };

  // ---------- analyse page 0 ----------
  function analyse(ops) {
    let ctm = I.slice(); const stack = []; let lastCm = null; const cmStack = [];
    let fill = { op: 'g', v: [0] }; const fillStack = [];
    let fontSize = 0, block = null;
    const blocks = [], images = [];
    for (let k = 0; k < ops.length; k++) {
      const o = ops[k]; const nums = o.operands.map(x => x.value);
      switch (o.op) {
        case 'q': stack.push(ctm.slice()); cmStack.push(lastCm); fillStack.push(fill); lastCm = null; break;
        case 'Q': ctm = stack.pop() || I.slice(); lastCm = cmStack.pop() || null; fill = fillStack.pop() || fill; break;
        case 'cm': lastCm = { idx: k, parent: ctm.slice() }; ctm = mul(nums, ctm); break;
        case 'rg': case 'g': case 'k': fill = { op: o.op, v: nums }; break;
        case 'BT': block = { btIdx: k, tmIdx: -1, tm: null, ctm: ctm.slice(), size: fontSize, hasText: false, off: 0, fill }; break;
        case 'Tf': fontSize = nums[1]; if (block && block.tmIdx < 0) block.size = fontSize; break;
        case 'Tm': if (block && block.tmIdx < 0) { block.tmIdx = k; block.tm = nums.slice(); block.ctm = ctm.slice(); block.size = fontSize; } break;
        case 'Td': case 'TD': if (block && block.tmIdx >= 0 && !block.hasText) block.off += nums[0]; break;
        case 'Tj': case 'TJ': case "'": case '"': if (block) { block.hasText = true; block.fill = fill; } break;
        case 'ET': if (block && block.tmIdx >= 0 && block.hasText) { block.etIdx = k; blocks.push(block); } block = null; break;
        case 'Do': {
          const m = ctm; const p = [apply(m, 0, 0), apply(m, 1, 0), apply(m, 0, 1), apply(m, 1, 1)];
          const xs = p.map(v => v[0]), ys = p.map(v => v[1]);
          images.push({ name: o.operands[0] && o.operands[0].value, doIdx: k, cm: lastCm, x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys), ctm: m.slice() });
          break;
        }
      }
    }
    for (const b of blocks) {
      const full = mul(b.tm, b.ctm);
      const [x, y] = apply(full, 0, 0);
      b.k = Math.hypot(full[0], full[1]); // page units per text-space unit
      b.x = x; b.y = y; b.eff = Math.abs(b.size * b.k); b.rot = Math.abs(full[1]) > 1e-6 || Math.abs(full[2]) > 1e-6;
      b.ctmScale = Math.hypot(b.ctm[0], b.ctm[1]);
    }
    return { blocks, images };
  }

  function groupLines(blocks, pred) {
    const lines = [];
    for (const b of blocks) {
      if (b.rot || !pred(b)) continue;
      let L = lines.find(l => Math.abs(l.y - b.y) < 0.6 && Math.abs(l.x - b.x) < 0.6);
      if (!L) { L = { x: b.x, y: b.y, eff: b.eff, blocks: [] }; lines.push(L); }
      L.blocks.push(b);
    }
    return lines.sort((a, b) => b.y - a.y); // top first
  }

  // ---------- load: gather everything needed once ----------
  async function inspect(plainBytes) {
    const doc = await PDFDocument.load(plainBytes);
    const page = doc.getPage(0);
    const { width: W, height: H } = page.getSize();
    const sx = W / REF_W, sy = H / REF_H;
    const box = r => ({ x0: r.x0 * sx, x1: r.x1 * sx, top: r.top * sy, bottom: r.bottom * sy });
    const front = box(FRONT), back = box(BACK);
    const content = bytesToStr(readContents(page));
    const { blocks, images } = analyse(tokenize(content));
    const T = y => H - y; // to top-based
    const inRect = (x, t, r) => x >= r.x0 && x <= r.x1 && t >= r.top && t <= r.bottom;

    // text line widths + mobile from pdf.js
    let items = [];
    let mobile = '';
    if (pdfjsLib) {
      const pdf = await pdfjsLib.getDocument({ data: plainBytes.slice(0), isEvalSupported: false }).promise;
      const p = await pdf.getPage(1);
      const tc = await p.getTextContent();
      items = tc.items.filter(it => typeof it.str === 'string' && it.transform);
      const all = items.map(it => it.str).join(' ');
      const m = all.match(/Mobile\s*(?:No\.?)?\s*:?\s*([6-9]\d{9})/i);
      if (m) mobile = m[1];
      await pdf.destroy();
    }
    function lineWidth(L, xmax) {
      let right = L.x;
      for (const it of items) {
        const tx = it.transform[4], ty = it.transform[5];
        if (Math.abs(ty - L.y) < 0.8 && tx >= L.x - 1 && tx < xmax) right = Math.max(right, tx + it.width);
      }
      return right - L.x;
    }

    // front text: name (hi/en), DOB, gender
    const photoImg = images.find(im => { const cx = (im.x0 + im.x1) / 2, ct = T((im.y0 + im.y1) / 2); return inRect(cx, ct, front) && (im.x1 - im.x0) < 80 && (im.y1 - im.y0) > 40 && cx < front.x0 + 90; });
    const frontLines = groupLines(blocks, b => inRect(b.x, T(b.y), front) && b.eff < 9 && T(b.y) < front.top + 85 && b.x > front.x0 + 60);
    const infoImg = images.find(im => { const cx = (im.x0 + im.x1) / 2, ct = T((im.y0 + im.y1) / 2); return inRect(cx, ct, front) && (im.x1 - im.x0) > 100 && T(im.y1) > (frontLines.length ? T(frontLines[frontLines.length - 1].y) : 0); });
    const backLines = groupLines(blocks, b => inRect(b.x, T(b.y), back) && b.eff < 9 && b.x < back.x0 + 40 && T(b.y) < back.bottom - 30);
    const qrImg = images.find(im => { const cx = (im.x0 + im.x1) / 2, ct = T((im.y0 + im.y1) / 2); const w = im.x1 - im.x0, h = im.y1 - im.y0; return inRect(cx, ct, back) && Math.abs(w - h) < 3 && w > 60; });
    const bigNumBack = blocks.filter(b => !b.rot && inRect(b.x, T(b.y), back) && b.eff >= 9).map(b => T(b.y) - b.eff * 0.75);
    frontLines.forEach(L => L.w = lineWidth(L, front.x1));
    backLines.forEach(L => L.w = lineWidth(L, qrImg ? qrImg.x0 : back.x1));
    // per-block start/end/text on the back so address lines can wrap at word gaps
    backLines.forEach(L => {
      L.blocks.sort((a, b) => a.off - b.off);
      const lineEnd = L.x + L.w;
      const its = items.filter(it => Math.abs(it.transform[5] - L.y) < 0.8 && it.transform[4] >= L.x - 1 && it.transform[4] < lineEnd + 0.5);
      L.blocks.forEach((b, i) => {
        b.px0 = L.x + b.off * b.k;
        b.px1 = i + 1 < L.blocks.length ? L.x + L.blocks[i + 1].off * L.blocks[i + 1].k : lineEnd;
        b.text = its.filter(it => it.transform[4] >= b.px0 - 0.3 && it.transform[4] < b.px1 - 0.3).sort((a, c) => a.transform[4] - c.transform[4]).map(it => it.str).join('');
      });
    });
    const bigNumFront = blocks.filter(b => !b.rot && inRect(b.x, T(b.y), front) && b.eff >= 9).map(b => T(b.y) - b.eff * 0.75);

    // photo JPEG bytes
    let photo = null;
    if (photoImg) {
      const xo = page.node.Resources().lookup(PDFName.of('XObject'));
      const ref = xo && xo.get(PDFName.of(photoImg.name));
      const obj = ref && doc.context.lookup(ref);
      if (obj && obj instanceof PDFRawStream) {
        const f = obj.dict.get(PDFName.of('Filter'));
        const fs = f instanceof PDFArray ? f.asArray().map(x => x.toString()) : f ? [f.toString()] : [];
        if (fs.length === 1 && fs[0] === '/DCTDecode') photo = { name: photoImg.name, jpeg: obj.getContents().slice(0) };
      }
    }
    return {
      W, H, front, back, mobile, photo,
      info: { frontLines: frontLines.length, backLines: backLines.length, hasInfoBox: !!infoImg, hasQR: !!qrImg },
      layoutOK: frontLines.length >= 3 && backLines.length >= 2,
      _: { frontLines, backLines, infoImg, qrImg, bigNumBack, bigNumFront, photoImg }
    };
  }

  function readContents(page) {
    const c = page.node.get(PDFName.of('Contents'));
    const ctx = page.doc.context;
    const streams = [];
    const obj = ctx.lookup(c);
    if (obj instanceof PDFArray) obj.asArray().forEach(r => streams.push(ctx.lookup(r))); else streams.push(obj);
    const parts = streams.map(s => s instanceof PDFRawStream ? decodePDFRawStream(s).decode() : s.getContents());
    const total = parts.reduce((a, p) => a + p.length + 1, 0);
    const out = new Uint8Array(total); let o = 0;
    for (const p of parts) { out.set(p, o); o += p.length; out[o++] = 10; }
    return out;
  }

  // ---------- apply edits to a freshly loaded doc ----------
  // opts: { frontScale, backScale, mobile (string|''), photoJpeg (Uint8Array|null) }
  // opts: { frontScale, backScale, frontSpacing, backSpacing, boldFront, boldBack, removeInfo, mobile, photoJpeg }
  async function applyEdits(doc, meta, opts) {
    const page = doc.getPage(0);
    const H = meta.H; const T = y => H - y;
    const { frontLines, backLines, infoImg, qrImg, bigNumBack, bigNumFront } = meta._;
    const content = bytesToStr(readContents(page));
    const ops = tokenize(content);
    const reps = []; // {start,end,text}
    const notes = [];
    const BOLD_PT = 0.22; // stroke width in points for "bold"

    function setTm(block, s, originX, pageY) {
      const op = ops[block.tmIdx];
      const t = block.tm;
      const local = apply(inv(block.ctm), originX, pageY);
      const nt = [t[0] * s, t[1] * s, t[2] * s, t[3] * s, local[0], local[1]];
      reps.push({ start: op.operands[0].start, end: op.operands[5].end, text: nt.map(fmt).join(' ') });
    }
    function strokeOp(fill) { const m = { rg: 'RG', g: 'G', k: 'K' }[fill.op] || 'G'; return fill.v.map(fmt).join(' ') + ' ' + m; }
    function embolden(block) {
      const bt = ops[block.btIdx], et = ops[block.etIdx];
      reps.push({ start: bt.start, end: bt.start, text: 'q ' });
      reps.push({ start: bt.end, end: bt.end, text: ' ' + strokeOp(block.fill) + ' 2 Tr ' + fmt(BOLD_PT / (block.ctmScale || 1)) + ' w' });
      reps.push({ start: et.end, end: et.end, text: ' Q' });
    }
    function placeImage(img, x, yBottom, w, h) {
      if (!img.cm) return;
      const op = ops[img.cm.idx];
      const o = img.ctm; const flipY = o[3] < 0, flipX = o[0] < 0;
      const desired = [flipX ? -w : w, 0, 0, flipY ? -h : h, flipX ? x + w : x, flipY ? yBottom + h : yBottom];
      const local = mul(desired, inv(img.cm.parent));
      reps.push({ start: op.operands[0].start, end: op.operands[5].end, text: local.map(fmt).join(' ') });
    }

    let mobileDraw = null;
    // ---- front: name, DOB, gender (+ mobile) ----
    if (frontLines.length) {
      let s = opts.frontScale || 1;
      const sp = opts.frontSpacing || 1;
      const size = frontLines[frontLines.length - 1].eff;
      const rightLimit = meta.front.x1 - 3;
      const sMaxH = Math.min(...frontLines.map(L => L.w > 0 ? (rightLimit - L.x) / L.w : 9));
      if (s > sMaxH) { s = sMaxH; notes.push('Front text is at the largest size that fits the card width.'); }
      const tops = frontLines.map(L => T(L.y));
      const dOrig = frontLines.length > 1 ? (tops[tops.length - 1] - tops[0]) / (tops.length - 1) : size * 1.6;
      const t0 = tops[0] + 0.72 * size * (s - 1);
      const n = frontLines.length + (opts.mobile ? 1 : 0);
      let d = Math.max(dOrig * s * sp, size * s * 1.05);
      let tLast = t0 + (n - 1) * d;
      const removeInfo = !!(opts.removeInfo && infoImg);
      if (removeInfo) {
        reps.push({ start: ops[infoImg.doIdx].start, end: ops[infoImg.doIdx].end, text: '' });
        const below = bigNumFront.filter(t => t > tops[0]);
        const maxLast = (below.length ? Math.min(...below) : meta.front.bottom - 20) - 3;
        if (tLast > maxLast) { d = (maxLast - t0) / (n - 1); tLast = maxLast; notes.push('Front lines are as far apart as the space allows.'); }
      } else if (infoImg) {
        const bt = T(infoImg.y1), bb = T(infoImg.y0), bh = bb - bt, bw = infoImg.x1 - infoImg.x0;
        const minH = bh * 0.55, gap = 2.2;
        const maxLast = bb - minH - gap;
        if (tLast > maxLast) { d = (maxLast - t0) / (n - 1); tLast = maxLast; notes.push('Line spacing is limited by the info box. Remove the box for more room.'); }
        if (tLast + gap > bt) {
          const nt = tLast + gap, nh = bb - nt, k = nh / bh;
          placeImage(infoImg, infoImg.x0, H - bb, bw * k, nh);
        }
      }
      frontLines.forEach((L, i) => L.blocks.forEach(b => { setTm(b, s, L.x, H - (t0 + i * d)); if (opts.boldFront) embolden(b); }));
      if (opts.mobile) mobileDraw = { x: frontLines[0].x, y: H - tLast, size: size * s, bold: !!opts.boldFront };
    } else if (opts.removeInfo && infoImg) {
      reps.push({ start: ops[infoImg.doIdx].start, end: ops[infoImg.doIdx].end, text: '' });
    }

    // ---- back: address, wraps at word gaps so it never runs into the QR code ----
    if (backLines.length) {
      const sp = opts.backSpacing || 1;
      const size = backLines[0].eff;
      const x = backLines[0].x;
      const rightLimit = (qrImg ? qrImg.x0 : meta.back.x1) - 3;
      const avail = rightLimit - x;
      const tops = backLines.map(L => T(L.y));
      const gaps = tops.slice(1).map((t, i) => t - tops[i]);
      const baseGap = gaps.length ? Math.min(...gaps) : size * 1.2;
      const below = bigNumBack.filter(t => t > tops[0]);
      const bottomLimit = (below.length ? Math.min(...below) : meta.back.bottom - 20) - 4;

      function layout(s) {
        const placed = []; // {block, originX, top}
        const t0 = tops[0] + 0.72 * size * (s - 1);
        let t = t0, lastTop = t0;
        backLines.forEach((L, li) => {
          if (li > 0) t += gaps[li - 1] * s * sp;
          const bl = L.blocks;
          let startIdx = 0;
          while (startIdx < bl.length) {
            const base = bl[startIdx].px0;
            let end = bl.length, lastBreak = -1;
            for (let i = startIdx + 1; i < bl.length; i++) {
              const prev = bl[i - 1].text || '', cur = bl[i].text || '';
              if (/\s$/.test(prev) && cur.trim() !== '') lastBreak = i;
              if ((bl[i].px1 - base) * s > avail + 0.01) { if (lastBreak > startIdx) end = lastBreak; break; }
            }
            for (let i = startIdx; i < end; i++) placed.push({ block: bl[i], originX: x - (base - L.x) * s, top: t });
            lastTop = t;
            startIdx = end;
            if (startIdx < bl.length) t += baseGap * s * sp;
          }
        });
        return { placed, lastTop, t0 };
      }
      let s = opts.backScale || 1;
      let lay = layout(s);
      let guard = 0;
      while (lay.lastTop > bottomLimit && s > 0.6 && guard++ < 60) { s -= 0.01; lay = layout(s); }
      if (guard > 0) notes.push('Address is at the largest size that fits above the Aadhaar number.');
      lay.placed.forEach(p => { setTm(p.block, s, p.originX, H - p.top); if (opts.boldBack) embolden(p.block); });
    }

    // mobile number: a new text object with an embedded standard font
    let mobileFont = null, mobileTxt = '';
    if (mobileDraw) {
      mobileFont = await doc.embedFont(StandardFonts.TimesRoman);
      const esc = ('Mobile No.: ' + opts.mobile).replace(/[\\()]/g, m => '\\' + m);
      const boldOps = mobileDraw.bold ? ' 0 G 2 Tr ' + fmt(BOLD_PT) + ' w' : '';
      mobileTxt = '\nq BT 0 g' + boldOps + ' /FMobA ' + fmt(mobileDraw.size) + ' Tf 1 0 0 1 ' + fmt(mobileDraw.x) + ' ' + fmt(mobileDraw.y) + ' Tm (' + esc + ') Tj ET Q\n';
    }

    // write content (apply edits from the end so earlier offsets stay valid)
    reps.sort((a, b) => b.start - a.start || b.end - a.end);
    let out = content;
    for (const r of reps) out = out.slice(0, r.start) + r.text + out.slice(r.end);
    // wrap the original content in q/Q so our appended text starts from a clean state
    out = 'q\n' + out + '\nQ' + mobileTxt;
    const stream = doc.context.flateStream(strToBytes(out));
    page.node.set(PDFName.of('Contents'), doc.context.register(stream));

    if (mobileFont) {
      const res = page.node.Resources();
      let fonts = res.lookup(PDFName.of('Font'));
      if (!fonts) { fonts = doc.context.obj({}); res.set(PDFName.of('Font'), fonts); }
      fonts.set(PDFName.of('FMobA'), mobileFont.ref);
    }
    // photo swap
    if (opts.photoJpeg && meta.photo) {
      const img = await doc.embedJpg(opts.photoJpeg);
      await img.embed();
      const xo = page.node.Resources().lookup(PDFName.of('XObject'));
      xo.set(PDFName.of(meta.photo.name), img.ref);
    }
    await doc.flush(); // write lazily embedded fonts/images before pages are copied
    return notes;
  }

  // ---------- outputs ----------
  function rectOf(meta, r) { return { left: r.x0, right: r.x1, bottom: meta.H - r.bottom, top: meta.H - r.top }; }

  async function buildCard(doc, meta) {
    const out = await PDFDocument.create();
    for (const r of [meta.front, meta.back]) {
      const [pg] = await out.copyPages(doc, [0]);
      const x = r.x0, y = meta.H - r.bottom, w = r.x1 - r.x0, h = r.bottom - r.top;
      pg.setMediaBox(x, y, w, h); pg.setCropBox(x, y, w, h); pg.setTrimBox(x, y, w, h); pg.setBleedBox(x, y, w, h); pg.setArtBox(x, y, w, h);
      out.addPage(pg);
    }
    out.setTitle('Aadhaar card - front and back'); out.setProducer('Aadhaar card cutter');
    return out.save();
  }

  async function buildSheet(doc, meta, kind, outline) {
    const out = await PDFDocument.create();
    const page0 = doc.getPage(0);
    const [ef, eb] = await Promise.all([out.embedPage(page0, rectOf(meta, meta.front)), out.embedPage(page0, rectOf(meta, meta.back))]);
    let pw, ph, slots;
    if (kind === 'a4') {
      pw = 595.28; ph = 841.89; const gap = 6 * MM; const x0 = (pw - (2 * CARD_W + gap)) / 2; const top = 15 * MM;
      slots = [[x0, ph - top - CARD_H], [x0 + CARD_W + gap, ph - top - CARD_H]];
    } else {
      pw = 4 * 72; ph = 6 * 72; const gap = 8 * MM; const x0 = (pw - CARD_W) / 2; const y1 = (ph + gap) / 2;
      slots = [[x0, y1], [x0, y1 - gap - CARD_H]];
    }
    const pg = out.addPage([pw, ph]);
    [ef, eb].forEach((e, i) => {
      const [x, y] = slots[i];
      pg.drawPage(e, { x, y, width: CARD_W, height: CARD_H });
      if (outline) pg.drawRectangle({ x, y, width: CARD_W, height: CARD_H, borderColor: rgb(0.62, 0.62, 0.62), borderWidth: 0.4 });
    });
    out.setTitle('Aadhaar card - ' + (kind === 'a4' ? 'A4 sheet' : '4x6 sheet')); out.setProducer('Aadhaar card cutter');
    return out.save();
  }

  async function generate(plainBytes, meta, opts, kind) {
    const doc = await PDFDocument.load(plainBytes);
    const notes = await applyEdits(doc, meta, opts);
    const bytes = kind === 'card' ? await buildCard(doc, meta) : await buildSheet(doc, meta, kind, opts.outline !== false);
    return { bytes, notes };
  }

  return { inspect, generate, tokenize, CARD_W, CARD_H };
}
if (typeof module !== 'undefined') module.exports = makeAadhaarCore;
