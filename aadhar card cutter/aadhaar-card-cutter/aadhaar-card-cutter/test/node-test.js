// Usage: npm i @cantoo/pdf-lib@2.11.1 pdfjs-dist@3.11.174
//        node test/node-test.js input.pdf [password]
const PDFLib = require('@cantoo/pdf-lib');
const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');
const makeCore = require('../src/aadhaar-core.js');
const fs = require('fs');

(async () => {
  const [, , input, password] = process.argv;
  if (!input) { console.log('Usage: node test/node-test.js input.pdf [password]'); process.exit(1); }
  const core = makeCore(PDFLib, pdfjs);
  const src = await PDFLib.PDFDocument.load(fs.readFileSync(input), password ? { password } : {});
  const plain = await src.save();
  const meta = await core.inspect(plain);
  console.log('Layout OK:', meta.layoutOK, '| Mobile found:', meta.mobile || '-', '| Photo editable:', !!meta.photo);

  const opts = { frontScale: 1.1, frontSpacing: 0.9, backScale: 1.2, backSpacing: 1, boldFront: true, boldBack: false,
    removeInfo: false, mobile: meta.mobile, photoJpeg: null, outline: true };
  for (const kind of ['card', 'a4', '4x6']) {
    const { bytes, notes } = await core.generate(plain, meta, opts, kind);
    fs.writeFileSync(`out_${kind}.pdf`, bytes);
    console.log(`out_${kind}.pdf`, notes.length ? notes : '');
  }
})().catch(e => { console.error(e); process.exit(1); });
