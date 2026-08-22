# PDF Tools — Feature Audit

> Format: har tool ke liye pehle **Current Features** (jo code me actually implemented hai, direct source verify karke), fir **Suggested Additions** (naye feature ideas — competitor tools jaise iLovePDF, Smallpdf, Adobe Acrobat online se inspired).
> Total 30 tools cover kiye gaye hain, site par dikhne wale order (`pdfToolsData.ts`) ke hisaab se. Yeh SEO content likhne ke base ke liye use hoga — isliye feature list factual hai, marketing fluff nahi. Kai tools shared engine components (`ConversionTool.tsx`, `PdfEditTool.tsx`, `PdfSecurityTool.tsx`) use karte hain jaisa image-tools me `ImageTransformTool.tsx` tha; kuch tools (Merge, Split, Extract Pages, Remove Pages, Compress, Organize, Repair, OCR) apna khud ka dedicated implementation rakhte hain.

---

## 1. Merge PDF
`app/pdf-tools/merge-pdf/MergePdfClient.tsx` · `app/pdf-tools/merge-pdf/page.tsx`

### Current Features
- **Multi-file upload** — click ya drag-and-drop, multiple PDFs ek saath (`application/pdf` MIME ya `.pdf` extension validate hota hai).
- **Per-file page rendering** — har uploaded PDF ke saare pages `pdfjs-dist` (legacy build) se canvas par render ho kar thumbnails ban jaate hain (scale `min(1.2, 220/width)`, JPEG quality 0.82).
- **File reorder** — har card par Up/Down arrow buttons se file ka order change kar sakte hain (drag handle icon dikhta hai par actual drag-drop nahi, sirf move buttons hain).
- **Per-file page preview modal** — kisi bhi file ka "Preview pages" click karke pura page-strip dekh sakte hain, thumbnail se page navigate kar sakte hain.
- **Per-page removal within a file** — preview modal ke andar individual pages ko "Remove this page" / "Restore this page" se toggle kar sakte hain — matlab merge se pehle hi kisi file ke specific pages exclude kiye ja sakte hain.
- **Live selected-page counter** — sidebar me total files aur total selected pages dikhta hai.
- **Merge validation** — kam se kam 2 files chahiye, aur saari files "ready" (loaded, kam se kam ek page selected) honi chahiye tabhi "Merge PDF" button enable hota hai.
- **Client-side merge via `pdf-lib`** — har source PDF `PDFDocument.load` se load, `copyPages` se selected (non-removed) pages hi copy hoke output document me add hote hain — pura kaam browser me.
- **Individual file removal** — kisi bhi file ko card se delete kar sakte hain.
- **Add more files mid-flow** — workbench khulne ke baad bhi drag-drop ya "Add PDFs" button se aur files add kar sakte hain.
- **Single-output download** — final merged PDF `repetigo-merged.pdf` naam se download hota hai (koi ZIP nahi, kyunki output ek hi file hai).
- **Error handling** — non-PDF file par turant error; corrupt/protected PDF load fail hone par specific message ("may be password-protected or damaged"); merge operation fail hone par bhi alag error.
- **Start over / Merge more** — poora reset karke naya session shuru karne ka button.
- **Client-side only processing** — koi upload server par nahi jata; "Free, private browser processing" badge.
- **Post-merge next-tool suggestions** — success screen par Compress/Split/Add page numbers/Watermark/Rotate/Protect ke shortcut links.

### Suggested Additions
- **True drag-and-drop reordering** — abhi sirf Up/Down buttons hain; card ko directly drag karke naye position par drop karna zyada intuitive hoga (grip icon already visually implies drag support jo actually kaam nahi karta).
- **Bookmark/outline generation** — merged PDF me automatically ek outline/bookmark banaye jisme har source file ka naam ek bookmark ho, taaki navigation easy ho.
- **Page numbering across merged document** — merge ke turant baad hi continuous page numbers add karne ka option (abhi alag "Add page numbers" tool use karna padta hai).
- **File size/page count limit warnings upfront** — abhi koi explicit max-files ya max-size messaging UI me nahi hai.
- **Merge with images directly** — abhi sirf PDF accept hota hai; JPG/PNG ko bina pehle convert kiye seedha merge list me daal sakna convenient hoga.
- **Duplicate detection** — same file do baar upload ho jaaye to warning.
- **Named/custom output filename input** — abhi hardcoded `repetigo-merged.pdf`, user apna naam type nahi kar sakta.
- **Undo last remove-page action** — preview modal me page remove karne ke baad undo history nahi hai (restore button available hai but sirf manual toggle).
- **Batch preview thumbnails grid (all files at once)** — abhi ek time me ek hi file ka page-strip dekh sakte hain.

---

## 2. Split PDF
`app/pdf-tools/split-pdf/SplitPdfClient.tsx` (component `SplitPdfTool`, exported as default `SplitPdfPage`)

### Current Features
- **Single-file upload** — ek PDF at a time, sabhi pages `pdfjs-dist` se thumbnail-render hote hain (scale `min(.7, 160/width)`, JPEG 0.8 quality).
- **Teen split modes** — Range, Pages, Size (tab-selector UI).
- **Range mode — 3 sub-modes**:
  - **Custom** — manual multiple "From/To" page-range blocks, add/remove range karne ka option.
  - **Fixed** — "Pages per PDF" number input se automatically equal-size chunks banaye jaate hain.
  - **Smart** — "Number of balanced PDFs" input diya jaaye to pages un parts me evenly balance ho jaate hain (`Math.ceil(pageCount/parts)` per chunk).
- **"Merge all ranges into one PDF" checkbox** — range mode me on karne par saare ranges alag files ke bajaye ek hi PDF me combine ho jaate hain.
- **Pages mode** — thumbnail grid se individual pages select/deselect kar sakte hain ("Select all"/"Clear" buttons), har selected page apni alag PDF banti hai.
- **Size mode** — target maximum size per output (KB/MB unit toggle ke saath), byte-size ke hisaab se approximate pages-per-group calculate hota hai (`targetBytes / (fileSize/pageCount)`), phir uss count ke hisaab se pages chunk kiye jaate hain — yeh estimate hai, actual output size guarantee nahi.
- **Live range/size preview** — range groups ke first/last page thumbnails dikhte hain before processing; size mode me sirf target size aur icon dikhta hai (actual split-preview nahi).
- **Client-side split via `pdf-lib`** — `PDFDocument.copyPages` se har group ke liye alag output document banta hai, `useObjectStreams: true` ke saath save.
- **Progress bar** — group-by-group split hote waqt % progress dikhta hai.
- **Per-result download** — har split output ka apna download button, filename pattern `{name}-{mode}-{n}.pdf`.
- **Bulk ZIP download** — sabhi split results ek ZIP me (JSZip).
- **Change settings** — results se wapas config screen par jaake settings badalna (progress/results clear ho jaate hain).
- **Client-side only processing** — koi server upload nahi.
- **Error handling** — corrupt/protected PDF par specific error; empty group ya invalid selection par "Select at least one valid page or range" error.
- **Shared engine note** — yehi `SplitPdfTool` component "Extract Pages" tool ke peeche bhi use hota hai (props se `initialMode`/`toolTitle` customize hote hain), lekin dono independent pages/routes hain.

### Suggested Additions
- **Accurate size-based splitting** — abhi size mode sirf average-byte-per-page estimate use karta hai; actual per-group byte size measure karke adjust karne wala real algorithm zyada precise hoga.
- **Custom output filenames per split** — abhi sirf auto-generated names hain.
- **Split by bookmark/table-of-contents** — PDF ke existing outline structure ke hisaab se auto-split karna (chapters/sections).
- **Split by blank page detection** — scanned multi-document batches ko auto-detect karke alag karna.
- **Preview individual split result before downloading** — abhi sirf metadata (pages, size) dikhta hai, actual content preview nahi.
- **Reorder ranges before splitting** — custom range mode me ranges ka order drag se change karna.
- **Batch multi-file split** — abhi sirf ek file at a time; multiple PDFs same settings se split karna.
- **Rename ZIP output filenames** — ZIP hamesha `repetigo-split.zip`/similar naam se, custom naming nahi.

---

## 3. Extract Pages
`app/pdf-tools/extract-pages/page.tsx` (wraps the same `SplitPdfTool` component from Split PDF, with `initialMode="pages"` and `toolTitle="Extract pages"`)

### Current Features
- **Not a standalone engine** — Extract Pages `SplitPdfTool` (same component as Split PDF) ko `initialMode="pages"`, `toolTitle="Extract pages"`, `uploadHeadingLevel="h1"` props ke saath reuse karta hai; koi separate extraction logic file nahi hai.
- **Pages mode forced default** — user seedha thumbnail grid se pages select karta hai (Range/Size tabs bhi UI me available rehte hain kyunki same component hai, par default aur intended flow "select individual pages" hai).
- **Special output behavior for "Extract pages"** — jab `toolTitle === "Extract pages"` aur mode `"pages"` ho, to selected sabhi pages ek hi (single) output PDF me combine ho jaate hain (`Array.from(new Set(groups.flat()))` se ek group), instead of Split PDF ke normal behavior jisme har selected page apni alag file banti — yeh core functional difference hai jo Extract Pages ko Split se differentiate karta hai code me.
- **Same thumbnail rendering, select all/clear, progress bar, single/ZIP download, client-side `pdf-lib` processing** — jaisa Split PDF me hai.
- **SEO copy explicitly clarifies difference from Remove Pages** — "Extract copies pages into new file, Remove deletes from original" — yeh matches actual code behavior (Extract = copy into new PDF, doesn't touch original file).
- **Result naming** — output filename `{name}-extracted-1.pdf` pattern (single output since pages mode collapses to one group for this tool).

### Suggested Additions
- **Dedicated single-output extraction UI** — abhi Range/Size tabs bhi technically visible/switchable hain jo confusing ho sakta hai ek "extract pages" tool ke liye jiska purpose sirf "select and combine into one file" hai; ek focused single-purpose UI cleaner hoga.
- **Extract as separate files option** — abhi hamesha ek hi combined output banta hai; "extract each selected page as its own file" ka toggle add karna (jaisa Split's pages-mode normally karta hai).
- **Extract page ranges via typed input** — "1,3,5-8" jaisa text input se quickly pages specify karna, sirf click-to-select ke bajaye.
- **Preserve bookmarks/links for extracted pages** — agar original PDF me internal links/bookmarks the jo extracted pages ko point karte hain.
- **Rotate/reorder extracted pages before download** — abhi extraction ke baad order same rehta hai jaise original me tha, koi reorder step nahi.
- **Batch extract same page numbers from multiple PDFs** — e.g. "page 2 of every uploaded file" — useful for admit cards/certificates workflows.

---

## 4. Remove Pages
`app/pdf-tools/remove-pages/RemovePagesClient.tsx`

### Current Features
- **Single-file upload** — ek PDF, saare pages `pdfjs-dist` se thumbnail-render hote hain (scale `min(.75, 170/width)`, JPEG 0.82).
- **Click-to-mark grid** — har page thumbnail par click karke "Will be removed" / "Keep" state toggle hoti hai (visual overlay ke saath).
- **Range-based removal** — "From/To" number inputs se ek range ek click me removal-list me add ho jaati hai ("Mark range for removal").
- **Quick selection patterns** — "Odd pages" aur "Even pages" one-click buttons (page-number parity check se).
- **Clear selection button** — sabhi marked pages ko unmark karta hai.
- **Safety guard** — kam se kam 1 page bachna zaroori hai; agar user saare pages select kar le to "At least one page must remain" error aata hai aur removal blocked ho jaata hai.
- **Live summary panel** — kitne pages selected hain aur kitne remain karenge, real-time dikhta hai.
- **Client-side removal via `pdf-lib`** — `source.getPageIndices()` se non-removed indices filter kar ke naya output document banaya jaata hai, `useObjectStreams: true` se save.
- **Progress indicator** — page-by-page copy hote waqt % progress bar.
- **Single-file download** — result filename `{name}-pages-removed.pdf`, before/after size dikhta hai (`X KB → Y KB`).
- **Change selection / Remove from another PDF** — result screen se wapas selection edit karna ya poora naya file start karna.
- **Client-side only processing** — koi server upload nahi.
- **Error handling** — non-PDF file, corrupt/protected PDF load failure, aur "no pages selected"/"all pages selected" edge cases sab handle hote hain.
- **Related-tool suggestions** — result screen par cross-sell widgets.

### Suggested Additions
- **Bulk multi-file removal** — abhi sirf ek file supported hai; same page-numbers ko multiple PDFs se ek saath remove karna.
- **Ctrl/Shift-click range select on grid** — abhi range removal sirf number-input se hota hai, thumbnail grid par shift-click drag-select nahi.
- **Undo last removal batch** — "Clear" sabkuch unmark kar deta hai, par ek granular undo/redo history nahi hai.
- **Preview before commit** — jaisa Compress tool me quality-preview modal hai, waisa hi "final result preview" (kaunse pages bachenge, unka content) removal se pehle dekhna.
- **Pattern-based removal beyond odd/even** — e.g. "every Nth page", "first/last N pages" quick presets.
- **Page-range text input alternative** — "remove pages 2,5,7-9" type karke bhi select kar sakna, sirf visual click ke alawa.
- **Keep removed pages as separate downloadable PDF** — removed pages ko discard karne ke bajaye unhe bhi ek alag file me export karne ka option (2-in-1 split+remove).

---

## 5. Compress PDF
`app/pdf-tools/compress-pdf/CompressPdfClient.tsx` · `app/pdf-tools/compress-pdf/page.tsx`

### Current Features
- **Multi-file upload** — click/drag-drop, multiple PDFs ek saath.
- **Auto-compress on upload** — files add hote hi default 60% level par automatically compress ho jaati hain.
- **Compression level slider** — 10% se 90% (step 5); "Higher means smaller files and lower image quality" label ke saath.
- **Manual re-compress button** — level slider change karne par saare results clear ho jaate hain, "Compress at X%" button se dobara run karna padta hai.
- **Rasterize-and-rebuild compression algorithm** — pdf-lib nahi, actual algorithm har page ko `pdfjs-dist` se canvas par render karta hai (`targetDpi = max(78, 180 - level*1.05)`, ek fixed white-background JPEG re-encode `quality = max(.34, .92 - level*.0065)`), phir naye `pdf-lib` document me un rendered JPEGs ko embed kar ke pages banata hai — matlab **text bhi image ban jaata hai** (poora page raster ho jaata hai, koi vector/text-layer preserve nahi hota) is approach me.
- **Three-way smallest-output guard** — final output banate waqt teen candidates compare hote hain: (1) rasterized JPEG-embedded version, (2) sirf structural re-save of original (`useObjectStreams`, no rasterization), (3) original bytes as-is — jo bhi sabse chhota hai wahi use hota hai, taaki output kabhi original se bada na ho.
- **Per-file progress bar** — spinner + % overlay on thumbnail while compressing.
- **Per-file card UI** — filename, original size, live thumbnail, page count, compressed size, % saved.
- **Quality preview modal with synced scroll** — original vs compressed PDF ke saare pages side-by-side render, dono panes ka scroll ek shared slider se synchronized hota hai.
- **Individual download / bulk ZIP download** (JSZip, DEFLATE level 6).
- **Add more files / individual remove / clear all / start over.**
- **Client-side only processing** — "Files stay in your browser" badge; koi server call nahi.
- **Error handling** — invalid file type, protected/corrupt PDF load failure, compression failure specific messages.

### ⚠️ Accuracy note for SEO copy
Yeh algorithm sabhi pages ko raster/JPEG me convert karta hai (structural-save fallback sirf tab jeetta hai jab woh chhota nikle) — isse **text selectability aur searchability lose ho sakti hai** compressed output me. Agar SEO copy kahi "Standard = lossless, no perceptible difference" jaisa claim karti hai, woh actual algorithm se match nahi karta — is discrepancy ko content likhte waqt dhyan me rakhna zaroori hai.

### Suggested Additions
- **True lossless compression option** — font subsetting, image downsampling without full-page rasterization.
- **Target file size input** — "compress to under 200 KB" jaisa exact target, abhi sirf % slider hai.
- **Preserve text layer / OCR-aware compression** — text-heavy PDFs ke liye ek mode jo image compress kare par text vector rakhe.
- **Batch total savings summary** — abhi per-file % dikhta hai, total original vs total compressed size overall nahi.
- **Custom DPI/quality manual override** — abhi sirf ek "level" slider hai jo DPI aur quality dono ko internally derive karta hai.
- **Warn when compression significantly hurts text sharpness** — low-level (high compression) par blurry text ka explicit warning.
- **Compare compression levels side-by-side before committing.**
- **Password-protected PDF handling message** — abhi generic error aata hai, specific "this PDF is password protected" detection helpful hoga.

---

## 6. PDF to Word
`app/pdf-tools/ConversionTool.tsx` (shared engine, slug: `pdf-to-word`)

### Current Features
- **Multi-file upload** — multiple PDFs ek saath.
- **Text-layer extraction** — `pdfjs-dist` se har page ka `getTextContent()` call hota hai, y-position ke hisaab se line-breaks detect kiye jaate hain (agar do items ki y-coordinate 3pt se zyada differ kare to naya line).
- **DOCX generation via `docx` library** — har PDF page ke liye ek "Page N" heading (HEADING_2) plus extracted text paragraphs, pages ke beech explicit `PageBreak`.
- **One DOCX per input PDF**.
- **Best-effort disclaimer** — UI me "Best for text PDFs. Scanned PDFs should use OCR first" note.
- **Client-side only** — pdfjs-dist + docx library.
- **Bulk ZIP / individual download**.

### Suggested Additions
- **Table detection/reconstruction** — abhi sirf linear text hai, PDF me table columns detect karke Word table banane ka logic missing.
- **Font/style matching** — extracted text uniform Word default style me hoti hai, original PDF ka bold/italic/font size carry nahi hota.
- **Image embedding** — PDF ke andar images extract karke DOCX me embed karna missing.
- **Scanned PDF direct handoff** — agar text-layer empty detect ho, seedha "Run OCR first" link/CTA UI me add karna (abhi sirf static note hai, dynamic detection nahi).
- **Multi-column layout detection**.

---

## 7. PDF to PowerPoint
`app/pdf-tools/ConversionTool.tsx` (shared engine, slug: `pdf-to-powerpoint`)

### Current Features
- **Multi-file upload** — multiple PDFs.
- **Page-as-slide-image approach** — har PDF page canvas par render hoti hai (scale 1.45), phir JPEG image (quality 0.9) ke roop me ek PowerPoint slide me embed hoti hai — yeh actual editable text/shapes wali slide nahi, balki "page ka photo ek slide par" approach hai (visually accurate, par text non-editable).
- **`pptxgenjs` library** — wide-layout (`LAYOUT_WIDE`) presentation banti hai, author "RepetiGo" set hota hai, background color `#F4F7FC`.
- **One PPTX per input PDF**, jisme utni hi slides jitne PDF pages.
- **Client-side only** — pdfjs-dist + pptxgenjs.
- **Bulk ZIP / individual download**.

### Suggested Additions
- **Editable text extraction into slides** — abhi sirf page image hai, PowerPoint ke andar text edit nahi ho sakta — real text-layer se editable text-boxes banana bada upgrade hoga.
- **Speaker notes generation** — PDF text ko notes section me daalna.
- **Slide layout/theme options**.
- **Selective page range to slides**.
- **Custom slide aspect ratio (4:3 vs 16:9)** — abhi fixed wide layout.

---

## 8. PDF to Excel
`app/pdf-tools/ConversionTool.tsx` (shared engine, slug: `pdf-to-excel`)

### Current Features
- **Multi-file upload** — multiple PDFs.
- **Text-layer extraction + naive column splitting** — har page ka text `getTextContent()` se nikal ke lines me convert hota hai; har line ko multiple-spaces ya tab ke basis par columns me split kiya jaata hai (`line.split(/\s{2,}|\t/)`) — yeh true PDF table detection nahi, heuristic-based hai.
- **One worksheet per PDF page** — `xlsx` library se workbook me "Page N" naam ki sheets banti hain.
- **One XLSX per input PDF**.
- **Best-effort disclaimer** — "Text rows are extracted per page. Use OCR first for scanned tables."
- **Client-side only** — pdfjs-dist + xlsx.
- **Bulk ZIP / individual download**.

### Suggested Additions
- **True table-boundary detection** — abhi sirf whitespace-heuristic column splitting hai, jo misaligned/complex tables par galat columns bana sakta hai — proper table-structure detection (bounding boxes se grid infer karna) bada accuracy upgrade hoga.
- **Merge cells detection**.
- **Number/date formatting preservation** — abhi sab text-as-string import hota hai, koi numeric type detection nahi.
- **Selective page/table extraction** — poore PDF ki jagah sirf specific page ya table area choose karna.
- **Header row auto-detection/freeze**.

---

## 9. Word to PDF
`app/pdf-tools/ConversionTool.tsx` (shared engine, slug: `word-to-pdf`)

### Current Features
- **Multi-file upload** — click ya drag-and-drop, multiple `.docx` files ek saath.
- **Supported input** — sirf `.docx` (legacy `.doc` accept nahi hota).
- **Text-only extraction** — `mammoth` library se raw text extract hota hai (`mammoth.extractRawText`) — yeh formatting, images, tables ko preserve **nahi** karta, sirf plain text.
- **Auto-generated PDF layout** — extracted text ko A4 page par Helvetica font (10pt body, bold 15pt filename header) me wrap karke draw kiya jaata hai; auto page-break jab content page se overflow ho.
- **One PDF per input file** — batch upload hone par bhi har Word file ka apna separate PDF result banta hai.
- **Bulk ZIP download** ya single-file direct download (agar sirf ek result ho).
- **Client-side only** — `mammoth` + `pdf-lib`, koi server upload nahi.
- **Result preview grid** — icon-based (koi actual PDF thumbnail preview nahi, generic icon).
- **Error handling** — agar koi readable content na mile ("No readable content was found in ...") to specific error.
- **Non-Latin character fallback** — `safeLatin()` function non-ASCII characters ko `?` se replace kar deta hai (Hindi/Devanagari ya doosri non-Latin script text is tool se sahi render nahi hogi).

### Suggested Additions
- **Real formatting preservation** — abhi sirf plain text extract hota hai; bold/italic/headings/bullet lists/tables/images sab lose ho jaate hain — ek genuine rich-conversion engine bahut bada upgrade hoga.
- **Unicode/Devanagari font support** — abhi non-Latin characters `?` ban jaate hain; Hindi/regional-language Word docs ke liye yeh bada gap hai (site ki India-focused SEO copy ke against jaata hai).
- **Image embedding from Word doc** — mammoth images bhi extract kar sakta hai, unhe PDF me embed karne ka support nahi hai abhi.
- **Table rendering** — Word tables ko PDF tables ki tarah render karna, abhi sirf linear text ban jaate hain.
- **Custom page size/margins**.
- **Legacy .doc support** — abhi sirf `.docx` accept hota hai.
- **Preview before download**.

---

## 10. PowerPoint to PDF
`app/pdf-tools/ConversionTool.tsx` (shared engine, slug: `powerpoint-to-pdf`)

### Current Features
- **Multi-file upload** — `.ppt`/`.pptx` files.
- **Slide text extraction via raw XML parsing** — `.pptx` ek ZIP hai; `jszip` se `ppt/slides/slideN.xml` files dhoondhi jaati hain, natural-sort order me, phir DOMParser se `<a:t>` (text run) elements ka content nikala jaata hai — koi images, shapes ka visual data nahi, sirf text runs.
- **Slide-separator markers** — extracted text me `--- slide N ---` markers insert hote hain jo baad me PDF page-break trigger karte hain.
- **Auto page-break per slide** — slide markers ke hisaab se naya PDF page start karta hai.
- **`.ppt` (legacy binary format) silently fails to extract meaningfully** — kyunki `.ppt` XML-based nahi hai, is code path se usme se text nikalna kaam nahi karega (sirf `.pptx` reliably supported hai, halaanki accept list `.ppt` bhi allow karta hai).
- **Client-side only** — jszip + DOMParser + pdf-lib.
- **Bulk ZIP / individual download**.
- **Error handling** — no-content error.

### Suggested Additions
- **Actual slide-image rendering** — abhi sirf text extract hota hai; visual slide layout, images, shapes, colors sab lost ho jaate hain — real conversion "PDF to PowerPoint" tool jitna visual quality provide nahi karta (jabki wahan canvas render hota hai).
- **True .ppt (legacy binary) support** — abhi silently reliable nahi hai.
- **Slide numbering/titles preserved as headings** — abhi flat text hai.
- **Speaker notes inclusion option**.
- **Custom page orientation (landscape default for slides)** — abhi standard portrait A4 use ho raha hai jo slide content ke liye ideal nahi.

---

## 11. Excel to PDF
`app/pdf-tools/ConversionTool.tsx` (shared engine, slug: `excel-to-pdf`)

### Current Features
- **Multi-file upload** — `.xls`, `.xlsx`, `.csv` files.
- **Sheet-to-CSV text extraction** — `xlsx` library se workbook parse hota hai; har sheet `XLSX.utils.sheet_to_csv()` se plain CSV text me convert hoti hai, `SHEET: <name>` header ke saath prefix.
- **Multiple sheets in one PDF** — sab sheets ek hi text block me concatenated (page-break nahi hota sheet ke beech, sirf natural text-wrap overflow se page badhta hai).
- **Wide sheet wrapping** — bahut wide rows word-wrap ho jaate hain (koi table-grid formatting nahi, sirf raw wrapped CSV-like text).
- **Client-side only** — `xlsx` + `pdf-lib`.
- **Bulk ZIP / individual download**.
- **Non-Latin character fallback** — same `safeLatin()` limitation as Word to PDF.

### Suggested Additions
- **Actual table/grid rendering** — abhi rows sirf comma-separated text ki tarah wrap hoti hain, koi visual column alignment/borders nahi — proper table layout (columns, borders, cell padding) bahut bada improvement hoga.
- **Per-sheet page break** — abhi saari sheets ek text stream me mix ho jaati hain.
- **Landscape orientation for wide sheets** — abhi hamesha portrait A4.
- **Cell formatting preservation** — bold headers, number formatting, colors sab lost.
- **Column width auto-fit**.
- **Unicode/regional language support**.

---

## 12. Edit PDF
`app/pdf-tools/InPlacePdfEditor.tsx` (dedicated engine — NOT the generic PdfEditTool, despite `edit-pdf` also existing as a config key there)

### Current Features
- **Single PDF upload**, all pages rendered as high-DPI (2-3x pixel ratio) canvas previews continuously scrollable.
- **Click-to-edit existing text** — pdfjs-dist text-layer extraction detects individual text spans (position, size, font, estimated color via pixel sampling); clicking a span turns it into an editable `<textarea>` overlaid exactly on top of the original text.
- **Font detection heuristics** — PDF font names mapped to browser-safe families (Courier/mono → "Courier New", Times/serif → "Times New Roman", Helvetica/sans → "Arial"); embedded font files are extracted and registered as real CSS `FontFace` objects where possible for more accurate on-screen matching.
- **Color sampling** — reads actual pixel colors under each text span from the rendered canvas to approximate the original text color; stabilizes near-black/gray colors to a consistent dark navy.
- **Text reflow simulation** — if edited text grows taller than the original (word-wrap causing more lines), the tool calculates a "flow" shift and visually pushes subsequent content down on the live preview *and* in the final exported PDF, avoiding overlap.
- **Add new text anywhere** — "Add text" mode lets you click any blank area to place a brand-new text box, inheriting nearby text's font style as a best guess.
- **Per-text formatting toolbar** — bold, italic, font size, font family (Arial/Times New Roman/Courier New/Georgia), color picker — appears when a text box is selected.
- **Duplicate text button** — clones the selected text box at a slightly offset position.
- **Delete text (whiteout)** — marks a span for removal; area is filled white in the final export rather than actually deleting PDF content objects.
- **Undo/Redo** — full edit-history stack (not capped like Photo Editor's 24-step limit).
- **Zoom control** — 65%–180% editing zoom (doesn't affect output resolution).
- **Export via image compositing** — pages with edits are re-rendered to a 2x-scale canvas, edited regions are whited out and redrawn with new text (word-wrapped to the paragraph's natural column width), then the whole page becomes a PNG image embedded into a new PDF page (pages without edits are copied through untouched, preserving original vector quality on unedited pages).
- **OCR fallback prompt** — if no text layer is detected at all (scanned PDF), an inline link to "Run OCR PDF" appears.
- **Client-side only**, single-file download (`-edited.pdf` suffix).

### Suggested Additions
- **True vector text editing (not image compositing)** — edited pages currently become flattened raster images, losing text-selectability/searchability on any page that was touched — a proper approach would replace only the specific text-run objects in the PDF's content stream, keeping the page fully vector/searchable.
- **Multi-page batch find-and-replace** — no way to replace the same phrase across every page in one action.
- **Image insertion/editing** — tool only handles text; adding/replacing images on the page isn't supported.
- **Table cell editing awareness** — text spans inside table-like layouts aren't treated specially, which can misalign reflow calculations.
- **Better Unicode font support for edited/added text** — new text rendering falls back to Arial/Times/Courier/Georgia only; non-Latin scripts in added text may render poorly.
- **Selection multi-box editing** (select and reformat several text boxes at once).

---

## 13. PDF to JPG
`app/pdf-tools/ConversionTool.tsx` (shared engine, slug: `pdf-to-jpg`)

### Current Features
- **Multi-file upload** — multiple PDFs ek saath.
- **Every page rendered as JPG** — `pdfjs-dist` se page-by-page canvas render (scale 1.65), phir `canvas.toBlob("image/jpeg", quality)`.
- **Adjustable JPG quality slider** — 55–100%.
- **One JPG file per PDF page** — multi-page PDF se multiple JPGs banti hain, per-page naming `<name>-page-N.jpg`.
- **Result thumbnail previews** — har converted page ka actual JPG preview thumbnail (0.55 quality mini preview) grid me dikhta hai.
- **Bulk ZIP download** (sabhi pages ek ZIP me) ya individual per-page download.
- **Client-side only** — pdfjs-dist worker browser me chalti hai.
- **Progress bar** — files/pages ke hisaab se percentage.

### Suggested Additions
- **Page range selection** — abhi PDF ke saare pages convert hote hain; specific pages/range choose karne ka option nahi.
- **PNG output option** — sirf JPG output hai, transparency-preserving PNG missing.
- **Custom scale/DPI control** — abhi fixed 1.65 scale hai, user-configurable resolution nahi.
- **Combine all pages into single long image** — vertical strip export option.
- **Crop margins before export**.

---

## 14. JPG to PDF
`app/pdf-tools/ConversionTool.tsx` (shared engine, slug: `jpg-to-pdf`)

### Current Features
- **Multi-file upload** — click ya drag-and-drop, multiple images ek saath.
- **Supported input formats** — JPG, PNG, HEIC, WEBP, BMP, GIF (accept list me sab included, par actual conversion logic sirf PNG ko `embedPng` se aur baaki sabko `embedJpg` se treat karta hai — is wajah se non-JPG/PNG formats jaise HEIC/WEBP/BMP/GIF technically fail ho sakte hain kyunki pdf-lib sirf JPEG/PNG embed karta hai).
- **Page orientation control** — Auto (image ke natural aspect ratio ke hisaab se), Portrait, Landscape — segmented button control.
- **Auto page-size selection** — A4 dimensions (595.28×841.89 pt portrait ya 841.89×595.28 pt landscape) har image ke liye.
- **Aspect-ratio-preserving fit** — image ko margin (28pt) ke andar center-fit kiya jaata hai, scale calculate karke.
- **Single combined PDF output** — saari uploaded images ek hi multi-page PDF me combine hoti hain (ek image = ek page).
- **Client-side only** — `pdf-lib` se poora processing browser me hota hai, "Files stay in your browser" badge.
- **Individual file remove / add more files**.
- **Progress bar** — combine hone ka single-step progress.
- **Download** — `<first-file-name>-combined.pdf` (multiple images) ya `<first-file-name>.pdf` (single image).
- **Error handling** — conversion fail hone par specific error message.

### Suggested Additions
- **True HEIC/WEBP/BMP/GIF support** — abhi accept list in formats ko allow karta hai par embed logic sirf JPEG/PNG handle karta hai; in formats ko pehle canvas se JPEG/PNG me convert karna chahiye taaki actual promise fulfill ho.
- **Drag-to-reorder pages** — image order set karne ka koi visual reorder nahi hai, sirf upload order follow hota hai.
- **Custom page size (A4/Letter/Fit to image)** — abhi hamesha A4 hai; "fit to image size" option missing.
- **Custom margin control** — margin hardcoded 28pt hai.
- **Multiple images per page (grid layout)** — collage-style multi-image-per-page option.
- **Page numbering option** — PDF me automatically page numbers add karna.
- **Image quality/compression control before combining** — bade JPG images directly embed hote hain bina resize/compress kiye, jisse output PDF bada ho sakta hai.
- **Preview thumbnails before conversion** — abhi sirf file list hai, actual visual thumbnail preview nahi.

---

## 15. Sign PDF
`app/pdf-tools/PdfSecurityTool.tsx` (shared engine, slug: `sign-pdf`)

### Current Features
- **Single PDF upload**, per-page thumbnail selection (signature applies to every selected page).
- **Two signature modes** — Type (styled italic text via HelveticaOblique font) or Upload image (PNG/JPG signature image).
- **Live signature preview overlay** directly on page thumbnails, showing exactly where it'll land.
- **Position control** — From-left / From-top percentage sliders.
- **Size control** — 12–72px slider (applies to both text height and image scaling).
- **Not a cryptographic/digital signature** — this is a *visual* stamp only (drawn text or image onto the page); it does not use PDF's native digital-signature/certificate mechanism, so it provides no tamper-evidence or legal e-signature validation.
- **Client-side only**, progress bar, single-file download — `-sign-pdf.pdf` suffix.

### Suggested Additions
- **True cryptographic digital signatures** — abhi purely visual stamp hai; ek "real" e-signature feature legally-binding signing ke liye PKI-based signing (certificate + hash) implement karna chahiye — abhi ka approach kisi bhi editor se copy kiya ja sakta hai, tamper-proof nahi hai.
- **Multi-signer workflow** — request signatures from others sequentially (pdfToolsData ka description "request electronic signatures from others" already promise karta hai, jo abhi implement nahi hai — sirf self-signing hai).
- **Signature audit trail / timestamp** — kaun, kab sign kiya, koi record nahi.
- **Saved signature reuse** — bar-bar type/upload karne ke bajaye pichli signature ko save karke reuse karna.
- **Initials-only stamp option** for multi-page quick-initial workflows.

---

## 16. Watermark
`app/pdf-tools/PdfEditTool.tsx` (shared engine, slug: `watermark-pdf`)

### Current Features
- **Single PDF upload**, per-page thumbnail selection.
- **Text-only watermark** — koi image/logo watermark option nahi (image-tools ke Watermark Image tool ke bilkul ulat, jo text + logo dono support karta hai).
- **Custom watermark text** (max 60 characters), font size aur color control.
- **Opacity slider** — 5–80%.
- **Rotation angle slider** — -90° se 90°.
- **Auto-centered placement** — watermark hamesha page ke horizontal center aur vertical middle me place hota hai (koi custom x/y positioning nahi).
- **Fixed large size scaling** — actual rendered size `fontSize * 3` (minimum 18px) hota hai, taaki watermark bada aur visible ho.
- **Applies to selected pages only**.
- **Client-side only**, progress bar, single-file download.

### Suggested Additions
- **Image/logo watermark support** — abhi sirf text hai; image watermark ek common requirement hai jo missing hai.
- **Custom position (not just center)** — corner/tile placement options.
- **Tile/repeat pattern mode** — poore page par repeating watermark.
- **Font family selection** — abhi sirf HelveticaBold hardcoded.
- **Multiple watermark layers** — sirf ek text watermark ek time me apply ho sakta hai.
- **Watermark preview live** before applying.

---

## 17. Rotate PDF
`app/pdf-tools/PdfEditTool.tsx` (shared engine, slug: `rotate-pdf`)

### Current Features
- **Single PDF upload**, thumbnail grid preview of every page (`pdfjs-dist` render, scaled ≤0.72).
- **Per-page selection** — click any thumbnail to toggle include/exclude, "Select all" / "Clear" quick actions; rotation applies only to selected pages.
- **Three rotation presets** — Left 90°, Right 90°, Flip 180° (button toggle).
- **Live rotation icon preview** on selected thumbnails showing the chosen direction before applying.
- **Cumulative rotation** — new rotation angle adds to page's existing rotation (`page.getRotation().angle + rotation`), normalized to 0–359°.
- **Permanent file-level rotation** — `pdf-lib`'s `setRotation` actually rewrites the PDF page rotation metadata (not just a view-only rotate), so it persists across viewers — this is the exact distinction the tool's own SEO copy emphasizes vs Adobe Reader/Chrome's view-only rotate.
- **Client-side only** — pdf-lib + pdfjs-dist, "Free · Private browser processing" badge.
- **Progress bar**, single-file download (`-rotate-pdf.pdf` suffix).
- **Replace PDF / Start over**.

### Suggested Additions
- **Custom arbitrary angle** — abhi sirf ±90°/180° presets hain, freeform degree input nahi.
- **Auto-detect sideways pages** — text-orientation heuristics se automatically suggest which pages need rotation.
- **Per-page individual rotation direction** — abhi sabhi selected pages ek hi direction me rotate hoti hain; alternating even/odd rotation ek common scenario hai (jaisa tool ki khud ki SEO copy mention karti hai) par UI me isko ek click me karne ka shortcut nahi.
- **Preview after rotation before download** — abhi thumbnails apply se pehle hi dikhti hain, applied result ka final preview alag view me milta hai.

---

## 18. HTML to PDF
`app/pdf-tools/ConversionTool.tsx` (shared engine, slug: `html-to-pdf`)

### Current Features
- **Multi-file upload** — `.html`/`.htm` files.
- **Text-only rendering (safety-first)** — `<script>`, `<style>`, `<noscript>` tags removed, sirf `innerText`/`textContent` extract hota hai — yeh full visual HTML→PDF render **nahi** hai.
- **No CSS/layout preservation** — plain text hi PDF me draw hota hai.
- **Client-side only** — DOMParser + pdf-lib, "Remote scripts and tracking are not executed" note.
- **Auto page-break** on content overflow.
- **Bulk ZIP / individual download**.

### Suggested Additions
- **Real visual HTML rendering** — abhi ka behavior sirf text-extraction hai; asli CSS-styled layout render karne ke liye (headless-browser server-side render, ya client-side html2canvas+pdf) — abhi ka naam "HTML to PDF" thoda misleading hai kyunki styling completely discard ho jaati hai.
- **Preserve links as clickable PDF links**.
- **Image embedding from HTML** — `<img>` tags currently ignore hote hain.
- **Table rendering as actual PDF tables**.
- **Support pasting raw HTML/URL** directly instead of file-only upload.

---

## 19. Markdown to PDF
`app/pdf-tools/markdown-to-pdf/MarkdownToPdfClient.tsx` (dedicated component — separate from `ConversionTool`'s "markdown-to-pdf" config, which exists in code but is not actually used by this route since the literal `markdown-to-pdf` folder takes routing precedence)

### Current Features
- **Live split-pane editor** — Markdown source on the left (textarea, pre-filled with a starter "Welcome to RepetiGo" template), live-rendered HTML preview on the right, updating on every keystroke (custom hand-written markdown-to-HTML converter, not a library).
- **Custom CSS tab** — a separate editable textarea for custom CSS (pre-filled with a sensible default theme) that's injected into the live preview via a `<style>` tag.
- **Fullscreen toggle** for a distraction-free editing view.
- **Hand-written Markdown parser** — supports headings (H1-H6), bold/italic/strikethrough, inline code, links, images (with figure/figcaption), blockquotes, unordered lists, tables (pipe syntax), fenced code blocks with basic syntax highlighting (keywords/strings/numbers/comments colored, JS and Python-aware keyword sets), and horizontal rules.
- **Separate, independent PDF-generation engine** — the live HTML preview is NOT what gets exported; `markdownToPdfBlob()` re-parses the same Markdown from scratch using `pdf-lib` primitives (manual text wrapping, table-row drawing as rectangles, code blocks as dark background boxes with per-token colored text, remote image fetching/embedding via `fetch` for `http(s)://` or `data:image/` URLs only).
- **Automatic pagination** — a new PDF page is added whenever content would overflow the current one.
- **Image embedding in PDF** — attempts to fetch and embed PNG/JPG images referenced in Markdown (falls back to showing the alt-text + URL as plain text if fetch fails or the URL isn't http(s)/data URI).
- **⚠️ The Custom CSS tab only affects the live browser preview, not the exported PDF** — the PDF generator has its own hardcoded color palette/styling entirely independent of the CSS textarea, so custom CSS edits have zero effect on the downloaded file.
- **Non-ASCII character sanitization** — maps common smart-quotes/dashes/arrows to ASCII equivalents and replaces any other non-ASCII character with `?` (same Devanagari/Unicode limitation as Word/Excel-to-PDF tools).
- **Single download** — filename `repetigo-markdown-<timestamp>.pdf`, auto-triggers browser download immediately after generation.
- **Client-side only** — no file upload at all; this is a compose-in-browser tool, not a file-converter (no "select file" step — unlike every other PDF tool in this suite).

### Suggested Additions
- **Make Custom CSS actually affect the exported PDF** — this is the most surprising gap: users editing the CSS tab reasonably expect it to change their downloaded PDF, but it silently only affects the on-screen preview.
- **File upload / import .md file** — abhi sirf inline textarea composition hai; ek existing `.md` file upload karke edit karna missing hai.
- **Unicode/Devanagari font embedding** — embedding a Unicode-capable font (not just StandardFonts) would fix Hindi/regional content.
- **Syntax highlighting language coverage** — abhi sirf JS aur Python-style keywords detect hote hain.
- **Save/autosave draft** — no local-storage persistence; refreshing the page loses all edits.
- **Table column width customization** — abhi columns equal-width split hoti hain.
- **Nested lists / ordered lists** — parser sirf flat unordered lists handle karta hai, numbered lists aur nesting support nahi.
- **PDF page size/margin options** — abhi fixed A4 + 52pt margin hardcoded hai.

---

## 20. Unlock PDF
`app/pdf-tools/PdfSecurityTool.tsx` (shared engine, slug: `unlock-pdf`)

### Current Features
- **Single PDF upload with password prompt** — password field (with show/hide toggle) needed *before* the file can even be previewed (page rendering itself requires the password to decrypt).
- **`@pdfsmaller/pdf-decrypt` library** — actual decryption performed client-side using the entered password.
- **Failure messaging** — wrong password shows "Enter the correct PDF password, then select the file again."
- **Once unlocked, standard page-thumbnail workspace** appears (though page selection isn't really used for this operation — the whole document is unlocked at once).
- **Client-side only** — password never sent to a server.
- **Single-file download** — `-unlock-pdf.pdf` suffix.

### Suggested Additions
- **Password strength/attempt feedback** — no indication of why unlock failed beyond generic message (e.g. distinguishing wrong password vs corrupted file).
- **Batch unlock (same password across multiple files)** — abhi ek time me ek hi PDF.
- **Remove owner-password-only restrictions without needing the open password** — many PDFs have permission restrictions (no printing/copying) but no open password; current flow always asks for a password even when one might not be needed.
- **Detect and report what protections existed** (open password vs permissions-only) before/after unlocking.

---

## 21. Protect PDF
`app/pdf-tools/PdfSecurityTool.tsx` (shared engine, slug: `protect-pdf`)

### Current Features
- **Single PDF upload**, no password needed to preview (file isn't encrypted yet).
- **AES-256 encryption** via `@pdfsmaller/pdf-encrypt` — genuinely strong, industry-standard encryption (not a weaker legacy PDF encryption scheme).
- **Open password** (required, min 4 characters) and **separate owner password** (optional — defaults to same as open password if left blank).
- **Granular permission checkboxes** — Allow printing, Allow copying, Allow editing (editing toggle also drives "allow annotating"; "allow filling forms" is always true, "allow extraction"/"allow assembly" always false, "allow high-quality print" mirrors the printing toggle).
- **Client-side only** — password and file never leave the browser.
- **Single-file download** — `-protect-pdf.pdf` suffix.

### Suggested Additions
- **Password strength meter/guidance** — abhi sirf "at least 4 characters" hard minimum hai, no strength feedback for weak passwords like "1234".
- **Per-permission granularity beyond the 3 checkboxes** — "allow extraction" and "allow assembly" are hardcoded false with no user control.
- **Batch protect (same password across multiple files)**.
- **Certificate-based encryption option** (beyond password-only), for enterprise use cases.
- **Expiring password/access option**.

---

## 22. Organize PDF
`app/pdf-tools/organize-pdf/page.tsx` (default export `OrganizePdfPage` — standalone component with logic inline) · `app/pdf-tools/organize-pdf/OrganizeSeoContent.tsx`

### Current Features
- **Multi-file upload** — multiple PDFs ek saath upload kiye ja sakte hain, sabka combined page-set ek hi organize canvas me aata hai.
- **Per-file page rendering** — har source PDF ke pages `pdfjs-dist` se thumbnail-render (scale `min(.72, 165/width)`, JPEG 0.82), har page apne source file id se linked rehta hai.
- **Drag-and-drop page reordering** — HTML5 native drag events se kisi bhi page card ko kisi bhi position par drop kar ke reorder kar sakte hain (yeh actual drag-drop hai, Merge PDF ke buttons-only reorder se alag).
- **Up/Down move buttons** — per-page alternative reorder control bhi hai (drag ke saath-saath).
- **Rotate individual page** — 90° increments me har page ko independently rotate kar sakte hain (visual preview ke saath), final PDF export me actual rotation apply hoti hai via `pdf-lib`.
- **Duplicate page** — kisi bhi page ko clone kar ke uske turant baad insert kar sakte hain.
- **Delete individual page** — kam se kam 1 page bachna chahiye (guard).
- **Insert blank page** — kisi bhi position ke baad blank page insert kar sakte hain; blank page ka size reference-page ke dimensions se derive hota hai (rotation ke hisaab se width/height swap bhi hoti hai).
- **Reverse order** — ek click me poori page-list reverse.
- **Restore original order** — saari rotations reset karke original upload-order par wapas.
- **Multi-source PDF composition** — different source files ke pages ek hi output document me freely mix ho sakte hain (letter-labeled source list: A, B, C... sidebar me).
- **Client-side organize via `pdf-lib`** — non-blank pages `copyPages` se copy hote hain (existing rotation + user rotation combine hoti hai), blank pages `addPage([w,h])` se create hote hain.
- **Progress bar** while building output.
- **Single-file download** — `repetigo-organized.pdf`.
- **Add PDF mid-flow, Reset all, error handling** (corrupt/protected source file par error).
- **Client-side only, no server upload.**

### Suggested Additions
- **Multi-select bulk actions** — abhi sabhi actions (rotate/duplicate/delete) per-page hain; ek saath multiple pages select karke bulk rotate/delete karna nahi hai.
- **Insert blank page with custom size/orientation picker** — abhi blank page size hamesha reference page se derive hoti hai, custom A4/Letter/custom-dimension choice nahi.
- **Thumbnail zoom/preview on click** — abhi sirf chhote thumbnails hain, full-size preview modal nahi.
- **Named source labeling** — abhi source files "A", "B", "C" letters se labeled hain sidebar me, filenames grid me kahin explicitly nahi dikhte per-page.
- **Extract selected pages as separate output** — organize karte waqt hi kuch pages ko main output se exclude kar ke alag file me nikaalna.
- **Keyboard shortcuts** — Delete key se selected page remove, arrow keys se move.
- **Undo/redo full history stack** — abhi sirf "Restore original order" hai (jo rotations bhi reset kar deta hai), granular undo nahi.
- **Page numbers/watermark insertion inline** — organize step ke saath hi combine karna in-flow.

---

## 23. PDF to PDF/A
`app/pdf-tools/ConversionTool.tsx` (shared engine, slug: `pdf-to-pdfa`)

### Current Features
- **Multi-file upload** — multiple PDFs.
- **Normalization, not formal PDF/A certification** — source PDF ko `pdf-lib` se re-parse karke ek nayi PDF me pages copy ki jaati hain, metadata (title/author/producer/creator/creation-date/modification-date) explicitly set hoti hai — yeh full ISO PDF/A validation/compliance **nahi** hai, jaisa UI note bhi explicitly bataata hai: "Formal PDF/A certification requires a dedicated validator."
- **`useObjectStreams: false, addDefaultPage: false`** save options use hote hain (compatibility ke liye).
- **Metadata fallback chain** — agar source me title/author missing ho to defaults use hote hain ("RepetiGo archival conversion" author, current date).
- **Client-side only** — pdf-lib.
- **Bulk ZIP / individual download**, filename `-archival.pdf` suffix.

### Suggested Additions
- **Actual PDF/A compliance validation** — abhi sirf metadata normalize hoti hai; real PDF/A (embedding all fonts, removing transparency/JS, ICC color profile, XMP metadata) implement karna bada scope hai lekin claim ko accurate banayega.
- **Font embedding check/fix** — PDF/A requires all fonts embedded; is check ka koi validation nahi.
- **PDF/A conformance level selection** (1a/1b/2a/2b/3a/3b).
- **Compliance report/certificate download**.
- **Warning when source PDF has features incompatible with PDF/A** (JavaScript, encryption, transparency).

---

## 24. Repair PDF
`app/pdf-tools/repair-pdf/page.tsx` (default export `RepairPdfPage` — standalone component) · `app/pdf-tools/repair-pdf/RepairSeoContent.tsx`

### Current Features
- **Multi-file upload** — multiple PDFs ek saath, per-file processing.
- **Three repair modes** (tab selector):
  - **Repair structure** — `PDFDocument.load(..., { ignoreEncryption: true, updateMetadata: false })` se source ko lenient mode me parse kar ke, `copyPages`+`addPage` se ek fresh PDFDocument me rebuild kiya jaata hai — yeh corrupted cross-reference tables/object streams ko effectively "rewrite" karta hai bina rasterize kiye (koi image quality loss nahi is mode me).
  - **Enhance quality** — pages ko `pdfjs-dist` se canvas par render (selectable resolution) kiya jaata hai, phir pixel-level contrast enhancement apply hota hai, optional grayscale conversion, phir JPEG-embedded naya PDF banta hai.
  - **Clean scan** — Enhance jaisa hi, par grayscale forced-on rehta hai, "high-contrast grayscale document" ke liye.
- **Output resolution selector** (Enhance/Scan modes only) — Standard 108 DPI, High 144 DPI (default), Best 180 DPI.
- **Contrast enhancement slider** (0–35%) — manual pixel-math formula RGB channels par per-pixel apply hoti hai.
- **Grayscale toggle** (Enhance mode only; Scan mode me hamesha on).
- **Per-file failure isolation** — agar ek file repair fail ho jaaye ("This file could not be recovered with the selected mode") to baaki files independently process hoti rehti hain.
- **Preview-read fallback messaging** — agar file itni corrupt hai ki thumbnail bhi na ban paaye, phir bhi "Structural repair may still recover this file" note dikha kar upload accept ho jaata hai.
- **Before/after compare modal** — original first-page thumbnail vs repaired/enhanced first-page side-by-side.
- **Per-file card UI** — filename, size, thumbnail, page count, progress %, result size, mode label.
- **Individual download / bulk ZIP download** (JSZip).
- **Add more files / remove individual file / start over.**
- **Client-side only processing** — koi server upload nahi.
- **Error handling** — non-PDF rejection, per-file recovery failure messaging.

### Suggested Additions
- **Automatic mode recommendation** — file analyze kar ke suggest karna ki structure repair chahiye ya quality enhance.
- **Corruption diagnostic report** — kya specifically galat tha PDF me (missing xref, broken stream, etc.) — abhi sirf pass/fail hota hai, reason nahi bataya jaata.
- **Combine structure-repair + enhance in one pass**.
- **Deskew/auto-straighten for scanned pages** — Enhance/Scan modes sirf contrast/grayscale karte hain, rotation correction nahi.
- **Noise/speckle removal filter** — scanned-document cleanup ke liye dedicated denoise.
- **Sharpen filter** — blurry scans ko crisp karne ka unsharp-mask jaisa option.
- **Batch mode auto-apply best settings per file** — abhi ek hi resolution/contrast setting saari files par apply hoti hai.
- **Password/encryption removal as part of repair.**

---

## 25. Page numbers
`app/pdf-tools/PdfEditTool.tsx` (shared engine, slug: `page-numbers`)

### Current Features
- **Single PDF upload**, per-page thumbnail selection (same grid pattern as Rotate PDF).
- **Starting number input** — custom start value (e.g. start at 5 instead of 1).
- **6 position options** — Top-left, Top-center, Top-right, Bottom-left, Bottom-center, Bottom-right.
- **Font size control** (6–96) aur color picker.
- **Sequential numbering across selected pages only** — offset-based, sirf selected pages count hoti hain, unselected pages skip ho jaate hain sequence me bhi.
- **Bold font** (HelveticaBold) use hota hai numbers ke liye.
- **Client-side only** — pdf-lib text-width measurement se accurate centering/right-alignment.
- **Progress bar**, single-file download.

### Suggested Additions
- **Custom number format** — abhi sirf plain number hai; "Page X of Y", Roman numerals, prefix/suffix text jaise formats missing.
- **Skip first page (cover page) option** — common requirement, title page ko number na dena.
- **Font family choice** — abhi sirf Helvetica Bold hardcoded hai.
- **Margin/offset fine-tuning** — position presets hain par exact pixel offset control nahi.
- **Preview numbering before applying** — abhi sirf apply ke baad result dikhta hai.

---

## 26. OCR PDF
`app/pdf-tools/ocr-pdf/page.tsx` (default export `OcrPdfPage`) · `app/pdf-tools/ocr-pdf/OcrSeoContent.tsx` · server: `cafemitra_server/api/views.py` (`extract_pdf_text`)

### ⚠️ Important finding — this is NOT real OCR
Despite the tool being named "OCR PDF" and the marketing copy (`OcrSeoContent.tsx`) claiming a full Optical Character Recognition engine ("detects text characters in the image... generates a precise text layer," with per-language accuracy tables for Hindi/Tamil/Telugu/etc.), the **actual implementation does not perform any image-based character recognition at all**:
- The client sends the PDF + selected page numbers to a Django backend endpoint `/api/tools/extract-pdf-text/`.
- The backend uses **PyMuPDF (`fitz`)** and simply calls `page.get_text("text")` on each selected page — this reads the PDF's **existing embedded text layer**. There is no rasterization of pages, no Tesseract, no ML/AI text-recognition model, and no image-to-text step anywhere in the pipeline.
- The tool's own UI is honest about this in one place: the language-selector helper text reads *"Server extraction reads the PDF text layer. Scanned image pages may return blank text."* — i.e., **a genuinely scanned/image-only PDF (no existing text layer) will return empty or near-empty text**, exactly the opposite of what the marketing copy promises.
- The downloadable "output PDF" is **not modified with any new text layer** — it is just the originally-selected pages re-saved via `pdf-lib`, byte-for-byte the same visual content as the input. No invisible text layer is ever embedded back into the PDF, contradicting an SEO claim like "adds an invisible text layer behind the visible scan."
- A **Language selector** exists in the UI (English / Hindi / English+Hindi) but the value is **never sent to the backend or used anywhere** — it's a dead/no-op control.

**This is a high-priority accuracy issue for SEO content:** the tool should be described as a "PDF text extractor" (existing text layer only) if writing accurately, not a true OCR/scanned-document recognizer, unless the product team wires up an actual OCR path (e.g., tesseract.js or a cloud OCR API) before this content ships.

### Current Features (as actually implemented)
- **Single-file upload** — one PDF at a time, thumbnails rendered client-side via `pdfjs-dist`.
- **Page selection grid** — click individual page thumbnails to select/deselect which pages to send for text extraction (all selected by default on upload).
- **Language dropdown (non-functional)** — English / Hindi / English+Hindi options exist in UI but are not passed to or used by the extraction request.
- **Server-side text extraction** — multipart form (`pdf` file + `pages` JSON array) to `/api/tools/extract-pdf-text/`; backend uses PyMuPDF to pull `get_text("text")` per selected page and returns `{ text, pages: [{page, text}], pageCount }`.
- **Simulated staged progress** — UI shows "Extracting PDF text on server..." then jumps progress to 70% on response, then "Preparing PDF download..." while it builds the client-side PDF, then 100%.
- **Client-side "selected pages" PDF assembly** — after the server call, a `pdf-lib` step copies just the selected pages into a new PDF for download — again, no OCR/text-layer injection happens here.
- **Recognized-text preview modal** — a modal shows the extracted text ("No readable text was detected." if empty).
- **Download TXT** — extracted text can be downloaded as a plain `.txt` file, separate from the PDF download.
- **Download selected-pages PDF** — `{name}-selected.pdf`.
- **Server-side error handling** — file-size limit (30 MB, backend-enforced, returns 413), non-PDF rejection, invalid/corrupted/encrypted PDF (400), missing PyMuPDF dependency on server (503), invalid `pages` JSON (400).
- **Select all / Clear page selection.**
- **Start over / Change settings.**

### Suggested Additions
- **Implement actual OCR for image-only/scanned PDFs** — integrate a real OCR engine (e.g., Tesseract.js client-side, or a server-side OCR service) so scanned pages with no existing text layer can actually be recognized — this is the single biggest gap versus the tool's own marketing claims and versus competitors (iLovePDF, Adobe Acrobat OCR both do real image-to-text recognition).
- **Wire up the language selector** — either use it to select an OCR language model (once real OCR exists) or remove it from the UI if it will remain a text-layer-only extractor.
- **Embed a real invisible text layer back into the output PDF** — so the downloaded PDF actually becomes searchable/selectable, matching the "searchable PDF" promise (currently only a `.txt` file has any text output).
- **Detect and warn upfront when a PDF has no text layer** — before running extraction, check if pages contain zero embedded text and show a proactive warning rather than only relying on the small helper caption.
- **Batch/multi-file text extraction.**
- **Confidence/accuracy indicator per page** — once real OCR exists.
- **Copy-to-clipboard for extracted text** — currently only full-file TXT download and a read-only preview modal exist.
- **Export extracted text with page-boundary markers as structured formats** — e.g. DOCX, beyond plain TXT.
- **Handwriting/low-quality-scan handling notice** — align actual capability messaging with what the SEO copy currently (over-)promises.

---

## 27. Compare PDF
`app/pdf-tools/PdfSecurityTool.tsx` (shared engine, slug: `compare-pdf`)

### Current Features
- **Two-file upload required** — exactly 2 PDFs (up to 2 accepted, extra selections ignored).
- **Page-by-page comparison** — for each page index, compares extracted text content.
- **Text-similarity scoring** — Jaccard-like word-overlap score (`common words / total unique words × 100`) when both pages have extractable text.
- **Image-similarity fallback** — if neither page has meaningful text (e.g. scanned PDFs), falls back to a very crude check: just compares whether the two rendered image data-URLs are byte-identical, returning either 100 (exact match) or 50 (any difference) — this is not a real visual diff algorithm.
- **Overall similarity score** — average of all page scores, displayed as both "% similarity" and "% difference".
- **Per-page visual side-by-side result** — thumbnails of both PDFs' corresponding pages shown together with a per-page difference percentage.
- **Different page counts handled** — pages missing on one side score 0 (fully different).
- **Client-side only**, no file output — comparison result is a visual report, not a downloadable PDF.

### Suggested Additions
- **Real visual diff for scanned/image-heavy PDFs** — abhi ka image comparison sirf identical-or-not hai; a proper perceptual-hash or pixel-difference-overlay algorithm would be much more useful for scanned documents.
- **Highlighted text differences** — abhi sirf ek similarity % milta hai; actual word-level diff highlighting missing hai.
- **Visual diff overlay** — side-by-side images ke bajaye ek overlay/heatmap jo exact changed regions highlight kare.
- **Downloadable comparison report** (PDF or text) summarizing differences.
- **Support comparing more than 2 files at once** (batch comparison against a baseline).

---

## 28. Redact PDF
`app/pdf-tools/PdfSecurityTool.tsx` (shared engine, slug: `redact-pdf`)

### Current Features
- **Single PDF upload**, per-page thumbnail selection (redaction area applies identically to every selected page).
- **Single rectangular redaction area** — Width/Height percentage sliders plus From-left/From-top position, live preview overlay on thumbnails.
- **True permanent flattening** — each selected page is rendered to a canvas, the redaction rectangle is filled solid black directly on the pixel data, then the *entire page* (not just the redacted area) is re-embedded as a flattened JPEG image in a brand-new PDF — this genuinely destroys the underlying text/vector content, unlike a simple black box drawn on top.
- **All pages become raster images** — even unselected pages are re-rendered and flattened, meaning the *entire* output PDF loses text-selectability/searchability, not just the redacted pages.
- **Client-side only**, progress bar, single-file download.

### Suggested Additions
- **Multiple redaction areas per page** — abhi sirf ek rectangle at a time (same position/size) apply hoti hai across all selected pages.
- **Preserve text-layer on non-redacted pages** — abhi poori PDF flatten ho jaati hai; sirf redacted pages ko rasterize karna aur baaki pages ko original vector quality me copy karna searchability preserve karega.
- **Auto-detect sensitive content** (emails, phone numbers, Aadhaar-like patterns) to suggest redaction areas automatically.
- **Redaction area per-page customization** — abhi ek hi rectangle position/size sabhi selected pages par same lagta hai.
- **Redaction color/label option** (e.g. "REDACTED" text stamp instead of plain black).

---

## 29. Crop PDF
`app/pdf-tools/PdfEditTool.tsx` (shared engine, slug: `crop-pdf`)

### Current Features
- **Single PDF upload**, per-page thumbnail selection.
- **Margin-based cropping (not freeform rectangle)** — Top/Right/Bottom/Left margin inputs (points), applies via `page.setCropBox()` — yeh visual drag-crop editor **nahi** hai, sirf numeric margin trimming hai.
- **Clamped margins** — max 1/3 of page width/height per side, minimum resulting size 10pt.
- **"72 points ≈ 1 inch" helper note** for users unfamiliar with PDF units.
- **Applies to selected pages only** — same margin values apply to all selected pages in one pass.
- **Client-side only**, progress bar, single-file download.

### Suggested Additions
- **Visual drag-to-crop editor** — abhi sirf numeric margin inputs hain; image-tools ke Crop Image tool jaisa interactive drag rectangle bahut zyada intuitive hoga.
- **Aspect-ratio presets** — abhi sirf margin-in-points hai, "crop to A4", "crop to square" jaise presets nahi.
- **Per-page different crop values** — abhi ek hi margin set saari selected pages par apply hota hai.
- **Auto-detect content bounding box** — whitespace automatically detect karke suggest karna kitna crop karna chahiye.
- **Preview crop result before applying**.

---

## 30. PDF Forms
`app/pdf-tools/PdfEditTool.tsx` (shared engine, slug: `pdf-forms`)

### Current Features
- **Single PDF upload**, automatic form-field detection on upload (`pdf-lib`'s `form.getFields()`).
- **Two modes depending on what's detected**:
  - **Existing interactive form fields found** → lists each field (name + current value + type label like "TextField"/"CheckBox"/"Dropdown") with editable inputs to change their values.
  - **No fields found** → switches to "create a new text field" mode: user names a field, sets a default value, and positions it via From-left/From-top percentage sliders.
- **Field type support for filling** — Text fields (set text), Checkboxes (check/uncheck), Dropdowns (select option) — other field types are silently left unchanged.
- **New field creation** — only supports adding a single new text field (not checkbox/radio/dropdown creation) placed on the first selected page, styled with a light blue border/background.
- **Per-page thumbnail selection** — same grid pattern as other PdfEditTool-based tools, though selection mainly matters for where a *new* field gets placed.
- **Form appearance refresh** — ensures filled values render correctly across PDF viewers.
- **Client-side only**, progress bar, single-file download.

### Suggested Additions
- **Radio button and dropdown-option creation** — abhi sirf naya text field banaya ja sakta hai; checkbox/radio/dropdown creation missing hai jabki filling in unke liye support hai.
- **Visual field placement (drag instead of % sliders)** — abhi naya field position sliders se set hota hai, drag-and-drop placement zyada intuitive hoga.
- **Multiple new fields in one session** — abhi ek baar me sirf ek naya field add karne ka flow simple hai.
- **Signature field creation** — SEO copy signature fields ka promise karti hai par is component me dedicated signature-field-type creation missing hai (Sign PDF tool alag hai).
- **Required-field validation/marking** — koi "required" flag UI me nahi hai.
- **Field auto-detection accuracy report** — kitne fields detect hue, kya un formats support nahi ho paaye, is baare me clearer status.

---

## Cross-tool observations (worth reviewing separately)

- **⚠️ OCR PDF is not real OCR** — sabse important finding. Yeh tool sirf PyMuPDF se PDF ke existing text layer ko read karta hai; koi image-recognition/Tesseract/AI model kahin nahi hai. `OcrSeoContent.tsx` ki marketing copy (per-language accuracy tables, "invisible text layer add hoti hai" jaisa claim) actual implementation se match nahi karti. Scanned/image-only PDFs is tool se blank text return karenge. SEO content likhne se pehle isko "PDF text extractor" (existing text layer only) ki tarah frame karna chahiye, ya product team se real OCR wire-up ka roadmap confirm karna chahiye.
- **Compress PDF poori PDF ko raster (JPEG-embedded) bana deta hai** har compression pass me by default — text selectability/searchability lose ho sakti hai. Agar SEO copy "lossless" ya "text stays selectable" jaisa claim karti hai, woh verify kiye bina na likhein.
- **Redact PDF aur Edit PDF dono poori PDF ko flatten/rasterize kar dete hain** jab kisi bhi page par change ho — sirf touched pages nahi, poori document raster ban jaati hai in dono tools me (Edit PDF me sirf edited pages raster hoti hain, unedited copy-through rehte hain; Redact PDF me saari pages raster ho jaati hain chahe redact na bhi ki gayi ho — yeh difference note karne layak hai).
- **Word/Excel/HTML/Markdown-to-PDF sab me non-Latin (Hindi/Devanagari) text `?` ban jaata hai** — `safeLatin()`/`safePdfText()` helper functions sirf ASCII range allow karte hain kyunki `pdf-lib`'s StandardFonts Unicode support nahi karte. Site ki India-focused SEO copy ke against yeh ek consistent gap hai across multiple conversion tools.
- **"Visual stamp" vs "true feature" gap in Sign PDF** — signature ek plain drawn text/image hai, PDF ka native cryptographic digital-signature mechanism use nahi hota. Legal/binding e-signature claims se bachna chahiye jab tak yeh implement na ho.
- **Merge PDF ka drag-icon "fake" hai** — visually drag-handle dikhta hai par sirf Up/Down move buttons kaam karte hain; Organize PDF me isके ulat, real HTML5 drag-and-drop implemented hai. Consistency ke liye Merge PDF me bhi real drag-drop add karna sensible follow-up hoga.
- **Extract Pages aur Split PDF ek hi component share karte hain** (`SplitPdfTool`), jaisa Image Tools me `ImageTransformTool.tsx` kai slugs share karta hai — behavior difference sirf ek prop-driven output-combining logic me hai.
- **PDF/A conversion sirf metadata normalize karta hai**, asli ISO PDF/A compliance validate/enforce nahi karta — tool ki khud ki UI note yeh honestly disclose karti hai ("Formal PDF/A certification requires a dedicated validator"), SEO copy me bhi yehi honesty maintain karni chahiye.
- **Batch/multi-file support inconsistent hai** — Merge, Compress, Split, Repair, Word/PPT/Excel/HTML-to-PDF, PDF-to-JPG/Word/PPT/Excel/PDFA sab multi-file support karte hain, lekin Remove Pages, Organize (multi-upload hai par per-operation single-canvas), Rotate, Page Numbers, Watermark, Crop, Edit PDF, PDF Forms, Sign, Unlock, Protect, Redact, OCR sab single-file hi hain. Yeh ek common "Suggested Addition" hai jo repeat ho raha hai across tools.

---

*Yeh document 30 me se 30 tools cover karta hai. Review ke baad batayein — kisi tool ka feature list expand/trim karna ho, ya SEO content ke liye alag format chahiye ho, to bata dein.*
