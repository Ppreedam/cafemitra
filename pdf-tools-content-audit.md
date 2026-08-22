# PDF Tools — SEO Content vs Actual Feature Audit

> Har tool ka page.tsx (SEO copy) uske actual code implementation (`pdf-tools.md` ground truth) se compare kiya gaya. Verdict scale: **Accurate** / **Mostly accurate, minor issues** / **Contains false or misleading claims**.

## Cross-cutting issue (affects all 30 tools)

Sab PDF tools **100% browser me** chalte hain — koi file kabhi server par upload nahi hoti (sirf OCR PDF exception hai, neeche dekhein). Lekin har tool ki content baar-baar likhti hai: "your file travels to our server over HTTPS," "isolated processing session," "auto-deleted from our servers within 60 minutes." Ye **factually galat** hai. Sach — aur asal me zyada strong privacy pitch — ye hai: **"file kabhi aapke browser se bahar hi nahi jaati, upload hi nahi hoti."**

Sirf **Rotate PDF** aisa tool hai jo pehle se sahi bolta hai ("100% browser-based, never uploaded").

---

## Ye SEO ranking ke liye kyun bura hai

Content jo tool ke actual feature se match nahi karti, wo direct aur indirect dono tarike se ranking ko nuksaan pahunchati hai — koi turant "penalty" nahi aata, lekin ye ek slow, silent ranking killer hai.

1. **Google Search Quality guidelines ke against** — Google ke Search Quality Rater Guidelines me "misleading content" (jo product/service ke baare me false claim kare) low-quality/spam signal maana jaata hai. Ye PDF tools YMYL-adjacent category me aate hain (log Aadhaar, bank statement, legal documents jaise sensitive files ke liye use karte hain) — isliye Google accuracy/trust ko yahan extra weight deta hai.

2. **Behavioral signals kharab honge (sabse bada real-world risk)** — Ye indirect hai par sabse zyada asar karta hai:
   - User "PDF to PowerPoint" try karta hai, content promise karta hai "editable slides," par milta hai ek screenshot — user turant frustrate ho kar site chhod deta hai.
   - High bounce rate, low dwell time (page par kam time rukna), aur user ka wapas Google search results par jaake dusra tool try karna — ye sab Google ko signal deta hai ki page searcher ka intent satisfy nahi kar raha, jo ranking girata hai.
   - Negative reviews/social media complaints ("ye tool jhooth bolta hai") backlink aur mention profile ko bhi damage karte hain.

3. **FAQPage rich snippet risk** — FAQ schema (JSON-LD) directly Google ko jaati hai. Agar usme galat claim hai (jaise "OCR 93% Hindi accuracy" ya "legally binding signature") aur wo flag ho jaaye, to sirf ranking hi nahi, rich-result eligibility bhi permanently revoke ho sakti hai.

4. **Legal/liability angle (SEO se alag, lekin zyada zaroori)** — "Legally binding e-signature" (IT Act reference) ya "ISO 19005 PDF/A compliant" jaise claims — agar koi business/government portal isi par rely karke reject ho jaaye, to ye false-advertising/consumer-protection issue ban sakta hai, sirf SEO issue nahi.

**Bottom line:** Google submit karne se pehle Critical list wale tools fix karna zaroori hai — warna jaanbujh kar aisi content submit hogi jo apne hi launch ko (engagement metrics aur trust dono se) nuksaan degi.

---

## Severity ranking (sabse zaroori pehle)

### 🔴 Critical — poora feature hi fake describe kiya gaya hai
1. **OCR PDF** — Sabse bada issue. Yeh real OCR hai hi nahi (koi image-recognition/Tesseract/AI model nahi) — sirf PDF ke existing text layer ko read karta hai. Per-language accuracy table (Hindi 93%, Tamil 92%, etc.) pura fabricated hai. "Invisible text layer add hoti hai" claim bhi galat hai — output original jaisa hi hai. Scanned PDFs (jinke liye ye tool bana hai, per marketing) blank text return karte hain — yani core promise hi ulta hai.
2. **PDF to PowerPoint** — Content explicitly likhta hai "this is NOT a screenshot, real editable objects hain" — jabki actual tool har page ka JPEG screenshot bana kar ek slide banata hai. Bilkul opposite claim.
3. **PDF to PDF/A** — "ISO 19005 compliance validated," conformance-level selector (PDF/A-1a/1b/2), font/color-profile embedding — sab fake. Tool sirf metadata ke kuch fields normalize karta hai, kuch validate nahi karta.
4. **Compare PDF** — Color-coded diff (green/red highlighting), move-detection, downloadable comparison-report PDF — sab fake. Actual tool sirf ek word-overlap similarity % dikhata hai, koi PDF output nahi banata.
5. **Word to PDF / PowerPoint to PDF** — "Fonts, tables, images, layout preserved" — bilkul galat. Dono sirf plain text extract karte hain, formatting/images/tables kuch nahi bachta.
6. **JPG to PDF** — HEIC/WEBP/BMP/GIF support ka flagship claim (India ke liye "iPhone HEIC problem solve") — false, sirf JPEG/PNG kaam karte hain. Drag-to-reorder bhi fake hai.

### 🟠 High — significant feature gaps ya exaggerated claims
7. **PDF to Word** — Tables/images/fonts/hyperlinks "preserved" bolta hai, sirf plain text milta hai.
8. **PDF to Excel** — OCR/scanned-PDF support aur precise accuracy % (85-95%) claim karta hai — koi OCR hai hi nahi.
9. **Compress PDF** — "Lossless Standard mode, text/links preserved" — galat, tool hamesha page ko JPEG me rasterize karta hai (text selectable nahi rehta). "Multiple files not supported" bhi galat — actually multi-file + ZIP download support hai.
10. **Merge PDF** — "Drag-to-reorder" claim fake hai — sirf Up/Down buttons kaam karte hain.
11. **PDF to JPG** — 96/150/300 DPI selector aur page-range selection — dono fake features (actual: quality % slider, hamesha saare pages).
12. **Sign PDF** — "Legally binding" (IT Act/eSign Act) unqualified claim — jabki ye sirf ek drawn/typed image stamp hai, koi cryptographic signature/audit-trail nahi.
13. **HTML to PDF** — Poora "paste a URL to convert webpage" feature hi exist nahi karta — sirf local .html file upload hota hai, wo bhi bina CSS ke (sirf plain text).
14. **Markdown to PDF** — "Upload .md file" (galat, sirf textarea hai), fake "PDF to Markdown" reverse tool link (route exist hi nahi karta), custom CSS/font/page-size controls jo hain hi nahi.
15. **Page numbers** — Format options (Roman numerals, "Page X of Y", letters) aur "skip cover page" — dono fake, sirf plain number + position kaam karta hai.
16. **Crop PDF** — "Drag crop handles" (fake — sirf numeric margin inputs hain), units bhi galat hain (content mm bolta hai, tool points leta hai).
17. **Redact PDF** — Teen redaction modes (text/image/area) claim karta hai, actual me sirf ek fixed rectangle hota hai.
18. **PDF Forms** — Checkbox/radio/dropdown/signature/date-field creation claim karta hai — sirf ek text field create ho sakta hai.
19. **Watermark** — Position control (top/bottom/center) aur 100% opacity — galat, hamesha center, max 80% opacity.
20. **Protect PDF** — Content "AES-128" bolta hai jabki actual tool **AES-256** use karta hai (ye ek downgrade-claim hai, real feature isse strong hai).

### 🟡 Low — mostly theek, chhoti si baatein
21. **Split PDF** — Size-based split mode content me mention hi nahi hua (feature exist karta hai par describe nahi).
22. **Extract Pages, Remove Pages, Organize PDF, Repair PDF, Unlock PDF** — Feature-description accurate hai, sirf server-language wala common issue hai.
23. **Excel to PDF** — Formatting-preserve wala jhooth nahi bolta (sahi se Excel/Sheets ke built-in export ko credit deta hai), lekin orientation/"fit to width" jaisa control claim karta hai jo nahi hai.
24. **Edit PDF** — Feature-description theek hai, par ye disclose nahi karta ki edited page raster (image) ban jaata hai — text-searchability chali jaati hai.

### ✅ Accurate
- **Rotate PDF** — Sahi hai, already "100% browser-based" bolta hai.

---

## Recommendation

Ye scope bahut bada hai — practically har tool ki content ko dobara likhna padega (kai hazaar words per tool). Do tarah se aage badh sakte hain:

1. **Sabse pehle 🔴 Critical wale 6 tools fix karo** (OCR, PDF to PowerPoint, PDF/A, Compare, Word/PowerPoint to PDF, JPG to PDF) — ye sabse zyada risk wale hain (Google ko misleading content, ya user trust break).
2. Phir server-language wala site-wide fix ek baar me sabhi 30 pages me kar do (find & replace pattern — "uploaded to our server / auto-deleted in 60 min" → "never leaves your browser").
3. Baaki 🟠/🟡 items batch me fix karo.

Batayein kis order se shuru karna hai — main ek tool se shuru kar sakta hoon (jaise OCR PDF ya Compress PDF), content ko actual feature ke mutabik rewrite karke.
