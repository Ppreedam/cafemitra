(function(){
  const $ = id => document.getElementById(id);
  const drop=$('drop'), fileIn=$('file'), status=$('status'), result=$('result'), upload=$('upload');
  const pwModal=$('pwModal'), pw=$('pw'), pwErr=$('pwErr'), pwOk=$('pwOk');
  let core = null;
  let srcBytes=null, srcName='aadhaar', plain=null, meta=null;
  const state = { frontScale:1, backScale:1, frontSpacing:0.9, backSpacing:1, photoJpeg:null, photo:{b:0,c:0,s:0,auto:false} };

  if (window.pdfjsLib) pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  if (window.PDFLib) core = makeAadhaarCore(window.PDFLib, window.pdfjsLib);

  function setStatus(msg, isErr){ status.textContent = msg || ''; status.classList.toggle('err', !!isErr); }

  // ---------- upload ----------
  drop.addEventListener('click', () => fileIn.click());
  drop.addEventListener('keydown', e => { if (e.key==='Enter' || e.key===' ') { e.preventDefault(); fileIn.click(); } });
  ['dragenter','dragover'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave','drop'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', e => { const f = e.dataTransfer.files[0]; if (f) handleFile(f); });
  fileIn.addEventListener('change', () => { if (fileIn.files[0]) handleFile(fileIn.files[0]); fileIn.value=''; });

  async function handleFile(f){
    if (!core) { setStatus('The PDF engine did not load. Check your internet connection and reload the page.', true); return; }
    if (!/\.pdf$/i.test(f.name) && f.type !== 'application/pdf') { setStatus('That file is not a PDF. Choose the e-Aadhaar PDF downloaded from UIDAI.', true); return; }
    srcName = f.name.replace(/\.pdf$/i,'') || 'aadhaar';
    srcBytes = new Uint8Array(await f.arrayBuffer());
    setStatus('Reading PDF…');
    try {
      const doc = await PDFLib.PDFDocument.load(srcBytes);
      await start(doc);
    } catch (e) {
      if (e && (e.name === 'EncryptedPDFError' || /encrypted/i.test(e.message))) { setStatus(''); openPw(); }
      else { setStatus('This PDF could not be read. It may be damaged. Download the e-Aadhaar again and retry.', true); console.error(e); }
    }
  }

  // ---------- password ----------
  function openPw(){ pw.value=''; pwErr.textContent=''; pwOk.disabled=false; pwModal.classList.add('show'); setTimeout(()=>pw.focus(),30); }
  function closePw(){ pwModal.classList.remove('show'); }
  $('toggle').addEventListener('click', () => {
    const show = pw.type === 'password'; pw.type = show ? 'text' : 'password';
    $('toggle').textContent = show ? 'Hide' : 'Show'; $('toggle').setAttribute('aria-label', show ? 'Hide password' : 'Show password'); pw.focus();
  });
  $('pwCancel').addEventListener('click', () => { closePw(); setStatus(''); });
  pwModal.addEventListener('keydown', e => { if (e.key === 'Escape') { closePw(); setStatus(''); } });
  $('pwForm').addEventListener('submit', async e => {
    e.preventDefault();
    const pass = pw.value.trim();
    if (!pass) { pwErr.textContent = 'Type the password to continue.'; return; }
    pwOk.disabled = true; pwErr.textContent = 'Unlocking…';
    let doc;
    try { doc = await PDFLib.PDFDocument.load(srcBytes, { password: pass }); }
    catch (err) {
      pwOk.disabled = false;
      pwErr.textContent = /password/i.test(err && err.message) ? 'Wrong password. Use capital letters, for example RAHU1990.' : 'This PDF could not be unlocked.';
      pw.select(); return;
    }
    closePw();
    try { await start(doc); } catch (err) { console.error(err); setStatus('The card could not be cut from this PDF.', true); }
  });

  // ---------- start after unlock ----------
  async function start(doc){
    setStatus('Cutting the card…');
    plain = await doc.save();
    meta = await core.inspect(plain);
    // reset state
    Object.assign(state, { frontScale:1, backScale:1, frontSpacing:0.9, backSpacing:1, photoJpeg:null, photo:{b:0,c:0,s:0,auto:false} });
    [['frontSize',100],['backSize',100],['frontGap',90],['backGap',100]].forEach(([id,v]) => { $(id).value = v; });
    ['frontOut','backOut','backGapOut'].forEach(id => $(id).value = '100%'); $('frontGapOut').value = '90%';
    ['boldFront','boldBack','removeInfo'].forEach(id => $(id).checked = false);
    $('removeInfo').disabled = !meta.info.hasInfoBox;
    $('mob').value = meta.mobile || ''; $('mobOn').checked = false; $('mob').disabled = false;
    $('photoState').textContent = '';
    $('openPhoto').disabled = !meta.photo;
    if (!meta.photo) $('photoState').textContent = 'Photo editing is not available for this PDF.';
    ['frontSize','backSize','frontGap','backGap','boldFront','boldBack','mobOn','mob'].forEach(id => $(id).disabled = !meta.layoutOK);
    upload.style.display = 'none';
    result.classList.add('show');
    await refresh();
    if (!meta.layoutOK) setStatus('This PDF layout differs from the standard e-Aadhaar letter. The cut may be off and text options are turned off. Check the preview.', true);
    else setStatus('Done. Adjust if needed, then download.');
  }

  // ---------- preview ----------
  let refreshTimer = null, refreshing = false, again = false;
  function scheduleRefresh(){ clearTimeout(refreshTimer); refreshTimer = setTimeout(refresh, 220); }
  function currentOpts(){
    const mob = $('mobOn').checked && /^\d{10}$/.test($('mob').value.trim()) ? $('mob').value.trim() : '';
    return { frontScale: state.frontScale, backScale: state.backScale, frontSpacing: state.frontSpacing, backSpacing: state.backSpacing, boldFront: $('boldFront').checked, boldBack: $('boldBack').checked, removeInfo: $('removeInfo').checked, mobile: mob, photoJpeg: state.photoJpeg, outline: $('outline').checked };
  }
  async function refresh(){
    if (!meta) return;
    if (refreshing) { again = true; return; }
    refreshing = true; $('pair').classList.add('busy');
    try {
      const { bytes, notes } = await core.generate(plain, meta, currentOpts(), 'card');
      $('notes').textContent = notes.join(' ');
      await render(bytes);
    } catch (e) { console.error(e); $('notes').textContent = 'Preview failed for these settings. Try a smaller text size.'; }
    refreshing = false; $('pair').classList.remove('busy');
    if (again) { again = false; refresh(); }
  }
  async function render(bytes){
    if (!window.pdfjsLib) return;
    const pdf = await pdfjsLib.getDocument({ data: bytes.slice(0), isEvalSupported:false }).promise;
    for (let i = 0; i < 2; i++) {
      const page = await pdf.getPage(i + 1);
      const vp = page.getViewport({ scale: 3 });
      const c = [$('c1'), $('c2')][i];
      const off = document.createElement('canvas'); off.width = vp.width; off.height = vp.height;
      await page.render({ canvasContext: off.getContext('2d'), viewport: vp }).promise;
      c.width = vp.width; c.height = vp.height; c.getContext('2d').drawImage(off, 0, 0);
    }
    pdf.destroy();
  }

  // ---------- controls ----------
  $('frontSize').addEventListener('input', e => { state.frontScale = e.target.value / 100; $('frontOut').value = e.target.value + '%'; scheduleRefresh(); });
  $('frontGap').addEventListener('input', e => { state.frontSpacing = e.target.value / 100; $('frontGapOut').value = e.target.value + '%'; scheduleRefresh(); });
  $('backGap').addEventListener('input', e => { state.backSpacing = e.target.value / 100; $('backGapOut').value = e.target.value + '%'; scheduleRefresh(); });
  ['boldFront','boldBack','removeInfo'].forEach(id => $(id).addEventListener('change', scheduleRefresh));
  $('backSize').addEventListener('input', e => { state.backScale = e.target.value / 100; $('backOut').value = e.target.value + '%'; scheduleRefresh(); });
  $('mobOn').addEventListener('change', () => { if ($('mobOn').checked && !/^\d{10}$/.test($('mob').value.trim())) $('mob').focus(); scheduleRefresh(); mobHint(); });
  $('mob').addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g,'').slice(0,10); if (e.target.value.length && !$('mobOn').checked) $('mobOn').checked = true; mobHint(); scheduleRefresh(); });
  function mobHint(){
    const v = $('mob').value.trim();
    if ($('mobOn').checked && v.length !== 10) setStatus('Enter a 10-digit mobile number to add it to the card.', true);
    else if (status.classList.contains('err') && /mobile/i.test(status.textContent)) setStatus('');
  }

  // ---------- photo editor ----------
  const phModal = $('photoModal');
  let phImg = null, phWork = { b:0, c:0, s:0, auto:false };
  $('openPhoto').addEventListener('click', async () => {
    if (!meta || !meta.photo) return;
    if (!phImg) phImg = await loadImage(meta.photo.jpeg);
    phWork = Object.assign({}, state.photo);
    syncPhotoCtrls();
    const bc = $('phBefore'); bc.width = phImg.naturalWidth; bc.height = phImg.naturalHeight; bc.getContext('2d').drawImage(phImg, 0, 0);
    drawAfter();
    phModal.classList.add('show'); setTimeout(()=>$('phB').focus(), 30);
  });
  function loadImage(bytes){
    return new Promise((res, rej) => { const url = URL.createObjectURL(new Blob([bytes], { type:'image/jpeg' })); const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = url; });
  }
  function syncPhotoCtrls(){
    $('phB').value = phWork.b; $('phBo').value = phWork.b;
    $('phC').value = phWork.c; $('phCo').value = phWork.c;
    $('phS').value = phWork.s; $('phSo').value = phWork.s;
    $('phAuto').checked = phWork.auto;
  }
  [['phB','b','phBo'],['phC','c','phCo'],['phS','s','phSo']].forEach(([id,k,o]) => $(id).addEventListener('input', e => { phWork[k] = +e.target.value; $(o).value = e.target.value; drawAfter(); }));
  $('phAuto').addEventListener('change', e => { phWork.auto = e.target.checked; drawAfter(); });
  $('phReset').addEventListener('click', () => { phWork = { b:0, c:0, s:0, auto:false }; syncPhotoCtrls(); drawAfter(); });
  $('phCancel').addEventListener('click', () => phModal.classList.remove('show'));
  phModal.addEventListener('keydown', e => { if (e.key === 'Escape') phModal.classList.remove('show'); });
  $('phApply').addEventListener('click', async () => {
    state.photo = Object.assign({}, phWork);
    const untouched = !phWork.b && !phWork.c && !phWork.s && !phWork.auto;
    if (untouched) { state.photoJpeg = null; $('photoState').textContent = ''; }
    else {
      const c = processPhoto(phWork);
      const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.95));
      state.photoJpeg = new Uint8Array(await blob.arrayBuffer());
      $('photoState').textContent = 'Cleaned photo applied.';
    }
    phModal.classList.remove('show');
    refresh();
  });
  function drawAfter(){
    const c = processPhoto(phWork); const a = $('phAfter');
    a.width = c.width; a.height = c.height; a.getContext('2d').drawImage(c, 0, 0);
  }
  // Processing happens at 2x the source size so the result prints a little cleaner.
  function processPhoto(p){
    const k = 2, w = phImg.naturalWidth * k, h = phImg.naturalHeight * k;
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(phImg, 0, 0, w, h);
    const id = ctx.getImageData(0, 0, w, h); const d = id.data;
    // auto levels (1% / 99% luminance)
    let lo = 0, hi = 255;
    if (p.auto) {
      const hist = new Uint32Array(256); const n = w * h;
      for (let i = 0; i < d.length; i += 4) hist[(d[i]*0.299 + d[i+1]*0.587 + d[i+2]*0.114) | 0]++;
      let acc = 0; for (lo = 0; lo < 255; lo++) { acc += hist[lo]; if (acc > n * 0.01) break; }
      acc = 0; for (hi = 255; hi > 0; hi--) { acc += hist[hi]; if (acc > n * 0.01) break; }
      if (hi - lo < 30) { lo = 0; hi = 255; }
    }
    const bright = p.b * 1.6;
    const cf = (259 * (p.c * 1.6 + 255)) / (255 * (259 - p.c * 1.6));
    const lut = new Uint8ClampedArray(256);
    for (let v = 0; v < 256; v++) {
      let x = (v - lo) * 255 / (hi - lo);
      x = x + bright;
      x = cf * (x - 128) + 128;
      lut[v] = x;
    }
    for (let i = 0; i < d.length; i += 4) { d[i] = lut[d[i]]; d[i+1] = lut[d[i+1]]; d[i+2] = lut[d[i+2]]; }
    if (p.s > 0) sharpen(d, w, h, p.s / 100 * 1.5);
    ctx.putImageData(id, 0, 0);
    return c;
  }
  function sharpen(d, w, h, amt){
    const src = new Uint8ClampedArray(d);
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const i = (y * w + x) * 4;
      for (let ch = 0; ch < 3; ch++) {
        const c0 = src[i+ch];
        const blur = (src[i-4+ch] + src[i+4+ch] + src[i-w*4+ch] + src[i+w*4+ch]) / 4;
        d[i+ch] = c0 + (c0 - blur) * amt;
      }
    }
  }

  // ---------- downloads ----------
  const names = { card: '_card.pdf', a4: '_A4_sheet.pdf', '4x6': '_4x6_sheet.pdf' };
  document.querySelectorAll('.dlbtn').forEach(btn => btn.addEventListener('click', async () => {
    if (!meta) return;
    const kind = btn.dataset.kind;
    if ($('mobOn').checked && !/^\d{10}$/.test($('mob').value.trim())) { setStatus('Enter a 10-digit mobile number, or untick Add.', true); $('mob').focus(); return; }
    btn.disabled = true; setStatus('Preparing ' + (kind === 'card' ? 'card PDF' : kind === 'a4' ? 'A4 sheet' : '4×6 sheet') + '…');
    try {
      const { bytes } = await core.generate(plain, meta, currentOpts(), kind);
      await save(srcName + names[kind], bytes);
    } catch (e) { console.error(e); setStatus('Could not build this PDF.', true); }
    btn.disabled = false;
  }));
  async function save(filename, bytes){
    const blob = new Blob([bytes], { type: 'application/pdf' });
    let downloads = null;
    try { downloads = window.claude && window.claude.use ? await window.claude.use('downloads') : null; } catch (_) {}
    if (downloads) {
      try { await downloads.save({ filename, data: blob }); setStatus('Saved ' + filename + '.'); }
      catch (e) {
        if (e && e.code === 'declined') setStatus('Download cancelled.');
        else if (e && e.code === 'rate_limited') setStatus('A download prompt is already open.');
        else setStatus('Download is not available here.', true);
      }
      return;
    }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    setStatus('Saved ' + filename + '.');
  }

  $('again').addEventListener('click', () => {
    meta = null; plain = null; srcBytes = null; phImg = null;
    result.classList.remove('show'); upload.style.display = ''; $('notes').textContent = ''; setStatus(''); drop.focus();
  });
})();
