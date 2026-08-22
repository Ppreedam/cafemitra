# Image Tools — Feature Audit

> Format: har tool ke liye pehle **Current Features** (jo code me actually implemented hai, direct source verify karke), fir **Suggested Additions** (naye feature ideas jo add kiye ja sakte hain — competitor tools jaise iLoveIMG, Canva, remove.bg se inspired).
> Total 26 tools cover kiye gaye hain, site par dikhne wale order (`imageToolsData.ts`) ke hisaab se. Yeh SEO content likhne ke base ke liye use hoga — isliye feature list factual hai, marketing fluff nahi.

---

## 1. Compress IMAGE
`app/image-tools/compress-image/CompressImageClient.tsx`

### Current Features
- **Multi-file upload** — click to select ya drag-and-drop, multiple images ek saath.
- **Supported formats** — JPG, JPEG, PNG, WebP (dono MIME type aur extension check se validate hota hai).
- **Auto-compress on upload** — files add hote hi default 60% level par automatically compress ho jaati hain.
- **Adjustable compression level slider** — 10% se 90% tak (step of 5), "higher = smaller file, lower quality".
- **Manual re-compress** — level change karne par purane results clear ho jaate hain; "Compress at X%" button se saari files fir se compress hoti hain.
- **Per-image progress indicator** — spinner + percentage overlay on thumbnail while compressing.
- **Smart format selection** — agar image me transparency hai to WebP use hota hai, warna JPEG (ya original WebP input WebP hi rehta hai).
- **Adaptive quality/scale algorithm** — target file size (`original size × (1 - level/100)`, min 18KB) achieve karne ke liye quality levels (0.9 → 0.27) aur image scale (0.88x per pass, 7 passes) dono progressively try kiye jaate hain.
- **Fallback safety** — agar target size na mile to sabse chhota achieved output use hota hai; original se bada kabhi nahi hota.
- **Per-file card UI** — filename, original size, live thumbnail, dimensions (width × height), compressed size, aur % saved dikhata hai.
- **Individual remove** — har file ko card se hi delete kar sakte hain (compress ke dauraan disabled).
- **Add more files** — studio view khulne ke baad bhi "Add images" button/card se aur files add kar sakte hain.
- **Compression quality preview modal** — original vs compressed image side-by-side comparison (zoom/eye icon se open hota hai), size + % saved bhi dikhta hai.
- **Individual download** — har compressed image ka apna download button (`-compressed` suffix ke saath naya filename).
- **Bulk ZIP download** — saari compressed images ek ZIP me (JSZip, DEFLATE level 6) download.
- **Clear all / Start over** — sab files aur results ek click me clear.
- **Client-side only processing** — sab kuch browser me hota hai (Canvas API), koi upload server par nahi jata — "Files stay in your browser" badge ke saath.
- **Error handling** — unsupported file type par error message; corrupt/unreadable image par bhi specific error.
- **Live summary panel** — total files count, kitni compress ho chuki, current status ("Compressing…", "All files ready" etc.)

### Suggested Additions
- **Target file size input** — sirf % slider ke bajaye "compress to under 200 KB" jaisा exact size target option.
- **Batch total savings summary** — total original size vs total compressed size aur overall % saved (abhi sirf per-file dikhta hai).
- **Format override control** — user manually choose kar sake output JPG/PNG/WebP (abhi automatic hai based on transparency).
- **EXIF metadata handling toggle** — option to strip or keep EXIF/location data (privacy feature).
- **Undo per-image compression** — single image ka result reset kar ke original level par wapas laane ka button.
- **Before/after slider (drag comparison)** — split-view draggable slider instead of sirf side-by-side static preview.
- **Max width/height constraint alongside compression** — compress + resize ek hi step me (abhi resize alag tool hai, par combine karna convenient hoga).
- **Compression presets** — "Web", "Email", "Social Media", "Print" jaise quick-preset buttons jo target size/quality auto set karein.
- **Drag-to-reorder files** — batch me file order rearrange karna.
- **Warning when quality drop is too aggressive** — agar output quality bahut low aa gayi (upscaled artifacts) to visual warning badge.
- **History/recent compressions** — last few compressed batches ka quick-access log (local only).
- **Keyboard shortcuts** — e.g. Delete key se selected image remove, Enter se compress trigger.
- **Progressive JPEG option** — output ko progressive JPEG banane ka toggle for faster perceived web loading.
- **Compare compression levels side-by-side** — same image ko 2-3 different levels par preview karke best choose karne ka option (without committing).

---

## 2. Upscale Image
`app/image-tools/upscale-image/UpscaleImageClient.tsx`

### Current Features
- **Multi-file upload** — click to select ya drag-and-drop, multiple images ek saath (`PdfToolUpload` component se, accept: JPG/JPEG/PNG/WebP).
- **Instant auto-preview on upload** — file add hote hi standard 2× WebP upscale automatically generate ho jaata hai, taaki thumbnail/preview turant dikh sake.
- **Thumbnail strip** — saari uploaded images ki thumbnails top par, click se switch between images; "+" tile se aur images add kar sakte hain.
- **Scale selector** — 2× ya 4× (button toggle).
- **Output format select** — WebP, PNG, ya JPG.
- **AI mode toggle** — "Need smarter enhancement? Use My AI Image Upscaler" button se AI Upscale mode on/off; on hone par processing local canvas ke bajaye server AI API (`/api/tools/ai-upscale-image/`) se hoti hai.
- **Standard client-side upscale algorithm** — original image ko canvas par progressive 2× steps me (`imageSmoothingQuality: high`) karke target scale tak resize kiya jaata hai, phir final canvas par high-quality draw; JPEG output ke liye white background fill hota hai (no alpha).
- **Size guard** — agar target width×height 48 million pixels se zyada ho to "Image too large" error (upscale block ho jaata hai).
- **Side-by-side comparison panel** — "Original" vs "Transformed" pane, dono me filename, dimensions, aur file size dikhta hai.
- **Download button** — result ready hone ke baad, filename `-{scale}x-upscaled.<ext>` suffix ke saath.
- **Individual remove** — active image ko list se delete karne ka button.
- **Client-side processing badge** — "Files stay in your browser" (standard mode ke liye).
- **Error handling** — invalid file type par specific error, upscale failure par generic fallback message ("Try a smaller image or 2× mode").
- **Drag-and-drop onto studio view** — image add karne ke baad bhi studio area par drag-drop se naye files add ho sakte hain.

### Suggested Additions
- **Before/after slider (draggable comparison)** — abhi sirf static side-by-side panes hain; ek drag-handle wala split-view comparison zyada intuitive hoga.
- **Batch upscale-all button** — abhi active image hi upscale hoti hai; "Upscale all X images" ek click me batch process kare.
- **Bulk ZIP download** — sabhi upscaled images ek ZIP me download karne ka option (jaise Compress tool me hai).
- **Custom scale input (e.g. 1.5×, 3×, 8×)** — abhi sirf fixed 2×/4× options hain.
- **Target resolution input** — user exact output width/height type kar sake instead of multiplier.
- **Sharpen/denoise post-process toggle** — standard mode me added sharpening filter jo upscale ke baad soft edges ko crisp kare.
- **Face/text-aware enhancement hint** — batana ki AI mode specifically photos ya text-heavy scans ke liye better hai.
- **Max file size / dimension limit messaging upfront** — 48MP limit ko upload screen par hi mention karna (abhi sirf fail hone par pata chalta hai).
- **Print-size preview (inches/cm at DPI)** — output dimensions ko physical print size me bhi dikhana.
- **Undo/reset to original** — dobara different scale try karne se pehle original par revert karne ka explicit button.

---

## 3. AI Image Upscaler
`app/image-tools/ai-upscale-image/AiUpscaleImageClient.tsx`

### Current Features
- **Same core UI/engine as Upscale Image** — but AI mode default ON (`aiMode` initial `true`), aur badge "Auto-deleted from our servers" (server processing imply karta hai).
- **AI enhancement via server API** — image FormData me (`image`, `scale`, `output_format`) ke saath `/api/tools/ai-upscale-image/` par POST hoti hai; response blob validate hota hai (`blob.type.startsWith("image/")`), warna "The AI service returned an invalid image" error.
- **Fallback to free standard upscaler** — toggle button se AI mode off karke local canvas-based upscale (same algorithm as Upscale Image tool) use kar sakte hain.
- **Instant local preview on upload** — file add hote hi (AI call se pehle) 2× WebP standard preview auto-generate hoti hai jab tak user "AI Upscale" na dabaaye.
- **Multi-file upload + thumbnail strip** — same as Upscale Image (click/drag-drop, multiple images, thumbnail switcher, "+" tile).
- **Scale (2×/4×) aur output format (WebP/PNG/JPG) selectors.**
- **Side-by-side Original vs Transformed comparison panel** with dimensions and file size.
- **Download** — filename `-{scale}x-ai-upscaled.<ext>` (AI mode) ya `-{scale}x-upscaled.<ext>` (fallback mode).
- **Error handling** — server error JSON parse karke message dikhana, ya binary/empty error response ke case me generic fallback message ("Try a smaller image, JPG/PNG/WebP under 15 MB, or switch off AI mode").
- **Size guard on fallback mode** — 48MP se zyada image reject.

### Suggested Additions
- **Visible AI processing progress/status** — abhi sirf spinner hai; koi "AI model warming up / analyzing / enhancing" jaisa staged status text nahi hai (background-remover tool me hai, isme nahi).
- **Model/quality tier selection** — e.g. "Fast" vs "High fidelity" AI model choice for different use-cases (old photo restore vs anime vs face).
- **Explicit file size/limit shown before upload** — mentioned "15 MB" only in error text, upload screen par nahi bataya gaya.
- **AI credits/usage counter** — kitne AI upscales free tier me remaining hain, isko UI me kahin nahi dikhaya.
- **Before/after zoom-compare tool** — pixel-level zoom to actually see AI detail vs interpolation difference.
- **Old photo / scanned document specific mode** — noise reduction, scratch removal preset for scanned images.
- **Batch AI upscale-all with progress queue** — abhi ek time me sirf active image AI upscale hoti hai.
- **Face enhancement toggle** — separate face-restoration pass for portraits.
- **Bulk ZIP download of AI results.**
- **Compare AI vs standard side-by-side (auto both) before committing** — run both algorithms and let user pick.

---

## 4. Remove Background
`app/image-tools/background-remover/BackgroundRemoverClient.tsx`

### Current Features
- **Single image upload** — click ya drag-and-drop, JPG/PNG/WEBP, max 15 MB (size aur type dono client-side validate hote hain).
- **"Enhance edges" toggle** — checkbox jo "enhance" flag ke saath server ko bhejta hai (hair/edges ke around color halo remove karne ke liye), processing shuru hone se pehle hi set karna padta hai.
- **Server-side AI background removal** — FormData (`image`, `enhance`) `/api/tools/remove-image-background/` endpoint par POST; response ek PNG blob (transparent background) hota hai.
- **Simulated progress bar** — real API call me incremental status nahi milta, isliye progress ko har 400ms me ease karke 90% tak le jaaya jaata hai (never quite finishing) jab tak actual response na aaye, phir turant 100%.
- **Original vs result preview grid** — side-by-side, result pane checkerboard pattern dikhata hai jab background transparent ho.
- **Instant client-side recoloring** — background remove hone ke baad, koi bhi solid color choose karne par naya server call nahi lagta; canvas par transparent PNG ko instantly nayi background color ke saath recompose kiya jaata hai (useEffect based, live).
- **Preset color swatches** — White, Light Grey, Sky Blue, Red, Black — plus custom color picker (native `<input type="color">`).
- **Transparent option** — swatch grid me ek "Transparent" toggle bhi hai jo bgColor null kar deta hai.
- **Download** — filename `<name>-bg.png` (colored) ya `<name>-no-bg.png` (transparent), hamesha PNG.
- **Start Over / reset button.**
- **Error handling** — file type/size validation errors, aur server-side failure par JSON message parse karke dikhana.

### Suggested Additions
- **Batch background removal** — abhi ek time me ek hi image process hoti hai; multi-upload + bulk process + ZIP download nahi hai (jabki Photo Editor aur Watermark tools me batch mode already implemented hai).
- **Custom background image upload** — solid colors ke alawa apni background image/photo daalne ka option (remove.bg jaisa).
- **Gradient/pattern background presets.**
- **Manual touch-up brush** — AI cutout ke edges ko manually erase/restore karne ka brush tool (missed spots fix karne ke liye).
- **Preview zoom for edge inspection** — hair/fine-detail edges ko zoom karke check karna before download.
- **JPG export option** — abhi sirf PNG output hai; solid background choose karne par JPG bhi useful hoga (smaller file).
- **Auto-crop to subject** — background remove karne ke baad transparent padding trim karke tight crop dena.
- **Shadow preservation/re-add option** — subject ke neeche soft drop shadow add karna (product photography use-case).
- **"Before you download" comparison slider** — drag-based comparison instead of static grid.
- **API quota/usage indicator** — kitne free background removals baaki hain.

---

## 5. Meme Generator
`app/image-tools/meme-generator/MemeGeneratorClient.tsx`

### Current Features
- **Single image upload** — JPG/PNG/WebP, click ya `PdfToolUpload` drop area se.
- **Default top/bottom captions** — upload hote hi "TOP TEXT" (y=10%) aur "BOTTOM TEXT" (y=90%) auto add ho jaate hain, font-size image width ke 7.5% ke hisaab se auto-calculated.
- **Draggable captions** — har caption ko canvas ke upar seedha pointer se drag karke position (x/y %) change kar sakte hain.
- **Add text button** — naya "NEW TEXT" caption center me add karta hai.
- **Per-caption controls** — text content (textarea), font family (Impact, Arial Black, Arial, Georgia, Verdana), size slider (18px se image-width-based max ~90px+), text color, outline color, outline width slider (0-16px), opacity slider (10-100%), uppercase toggle.
- **Delete selected caption.**
- **Canvas-based rendering** — 900-weight bold font, stroke (outline) phir fill draw hota hai; automatic word-wrap 90% image-width tak; multi-line captions vertically centered around anchor point.
- **Download format** — PNG ya JPG select.
- **Replace image button.**
- **Remove image / start over.**
- **Fully client-side** — koi server call nahi, sab canvas API se hota hai.
- **Error handling** — corrupt/unreadable image par specific error message.

### Suggested Additions
- **Meme template library** — popular pre-made meme templates (Drake, Distracted Boyfriend, etc.) select karke seedha use karna, abhi sirf apni image upload karni padti hai.
- **Text stroke style presets** — quick style buttons (classic white+black outline, yellow Impact, minimal) instead of manual color/width setup har baar.
- **Multi-line auto-fit font size** — text bahut lamba ho to font auto-shrink ho (abhi fixed size par wrap hota hai, overflow ho sakta hai).
- **Sticker/emoji overlay support** — memes me emoji/sticker add karna (Photo Editor me hai, Meme Generator me nahi).
- **Speech bubble / caption box shapes** — text ke peeche background box ya speech-bubble shape.
- **Save/share directly to social (copy image, share sheet)** — abhi sirf local download hai.
- **Undo/redo for caption edits** — text move/edit ka history stack nahi hai.
- **Duplicate caption button** — ek caption ko clone karke jaldi similar text add karna.
- **Meme text rotation** — captions ko tilt/rotate karne ka option (abhi horizontal-only hai).
- **Batch meme creation** — same captions ko multiple images par apply karna (Watermark/Photo Editor jaisa batch mode).
- **GIF/video meme support** — abhi sirf static images support hain.

---

## 6. Photo Editor
`app/image-tools/photo-editor/PhotoEditorClient.tsx`

### Current Features
- **Single image upload** with 11 tool tabs — Filter & Light, Resize, Crop, Transform, Draw, Text, Shapes, Stickers, Frame, Corners, Merge.
- **Filter & Light adjustments** — Brightness (0-200), Contrast (0-200), Saturation (0-200), Blur (0-20px), Grayscale (0-100), Sepia (0-100), sab CSS canvas `ctx.filter` string se apply hote hain (live).
- **Resize** — numeric width/height inputs (`outW`/`outH`) jo final output canvas size define karte hain.
- **Crop** — percentage-based manual X/Y/Width/Height number inputs; presets: Passport 35×45mm, Square 1:1, Portrait 3:4, Landscape 4:3 (auto-centered ratio crop); "Reset crop" button.
- **Transform** — 90° rotate, horizontal flip, vertical flip.
- **Draw tool** — freehand brush, color picker, brush width slider (1-40px), "Clear drawing" button; pointer-drag based path capture.
- **Text tool** — draggable text labels on canvas, custom color, add multiple.
- **Shapes tool** — draggable rectangle/circle outlines with color.
- **Stickers** — 8 preset emoji stickers, draggable on canvas.
- **Frame** — frame color picker + frame width slider (0-80px) drawn as border stroke.
- **Corners** — rounded corner radius slider (0-200), canvas `roundRect` clip applied to entire image.
- **Merge/overlay image** — dusri image upload karke draggable overlay ke roop me merge (fixed 65% opacity, drag se position/size).
- **Zoom control** — canvas stage ko 25%-150% zoom karke dekhna (editing area, output size affect nahi karta).
- **Undo/Redo history** — up to 24 steps ka undo stack, plus separate redo stack; "Reset" button original state par le jaata hai.
- **Download format** — PNG, JPG, ya WebP.
- **Batch apply** — same edit stack (filters, crop, drawings, text, stickers, overlay — sab kuch) additional uploaded photos par apply karna, per-photo thumbnail + individual download.
- **Bulk ZIP download** — batch results JSZip (DEFLATE level 6) se ek ZIP file me.
- **Fully client-side canvas rendering** — koi server call nahi.
- **Draggable object system** — labels, stickers, shapes, aur merge overlay sabke liye common pointer-drag mechanism, percentage-based positioning.

### Suggested Additions
- **Layer reordering / z-index control** — text, stickers, shapes sab ek hi order me render hote hain; user apni marzi se layer order change nahi kar sakta.
- **Text font family/style options** — abhi sirf fixed "700 Arial" font hai text/stickers ke liye (watermark/meme tools me font choice hai, photo editor me nahi).
- **AI background removal integration** — description me "background removal" mention hai par actual code me feature missing hai (worth flagging/adding as real feature).
- **Eraser tool for drawings** — sirf add kar sakte hain, individual stroke erase/undo nahi kar sakte (sirf pura "Clear drawing").
- **Selection/move/delete for individual shapes and stickers** — abhi drag hoti hai par ek dedicated delete button per-object nahi (sirf clear-all type actions).
- **Adjustment presets/filters (Instagram-style)** — one-click "Vintage", "B&W", "Warm" combined filter presets.
- **Curves/levels advanced editing** — sirf basic brightness/contrast/saturation sliders hain, professional tone curve nahi.
- **Red-eye removal tool.**
- **Vignette effect.**
- **Text shadow/background box for text tool.**
- **Aspect-ratio lock on resize** — abhi width/height independently change hote hain, proportion lock toggle nahi.
- **Sticker upload (custom stickers)** — sirf 8 fixed emoji hain, custom PNG sticker add karne ka option nahi.

---

## 7. Resize IMAGE
`app/image-tools/ImageTransformTool.tsx` (shared engine, slug: `resize-image`)

### Current Features
- **Single-file upload** — ek time me ek hi image (JPG, PNG, WebP) upload hoti hai.
- **Teen resize modes** — "By Size" (exact width/height px), "As Percentage" (10% se 200% tak slider), aur "Social Media" (ready-made preset dimensions).
- **Lock aspect ratio toggle** — width badalne par height auto-adjust (aur vice versa) jab ratio lock ho.
- **Social media presets** — Instagram Post (1080×1080), Instagram Story (1080×1920), Facebook Post (1200×630), LinkedIn Post (1200×627), YouTube Thumbnail (1280×720) — select karte hi width/height auto set ho jaate hain.
- **Output format choice** — WebP (smaller) ya PNG (lossless).
- **Quality slider (WebP only)** — 40% se 100% tak.
- **Target file size (optional)** — KB me target daalne par, quality 0.9 se 0.25 tak (step 0.08) progressively reduce karke target ke kareeb size laane ki koshish hoti hai (sirf non-PNG output ke liye).
- **Live preview** — replaced/uploaded image ka background preview, dimensions + size header me dikhta hai.
- **Replace file** — bina naya upload flow shuru kiye current file replace kar sakte hain.
- **Result footer** — final width × height aur file size download button ke saath.
- **Start over** button — poora reset.
- **Client-side only** — canvas API se browser me hi resize hota hai, "Files stay in your browser" badge.

### Suggested Additions
- **Batch resize** — multiple images ek saath same dimensions/preset par resize karna (abhi sirf single file).
- **More social presets** — Twitter/X header, Pinterest pin, WhatsApp DP, Threads post jaise aur platforms add karna.
- **Crop-to-fit vs letterbox option** — jab target aspect ratio original se match na kare to "cover" (crop) vs "contain" (pad) choice.
- **Batch ZIP download** — jab multi-file support add ho, tab sabko ek ZIP me download karne ka option.
- **DPI/print size resize** — inches/cm + DPI based resizing print use-case ke liye.
- **Undo/redo of dimension changes** — quickly previous size par wapas jaane ka option.
- **Before/after size comparison** — original vs resized file size % difference clearly dikhana (abhi sirf result size dikhta hai, original ka reference nahi).
- **Upscale warning** — agar user 100% se zyada percentage/size choose kare to quality-loss warning.

---

## 8. Crop IMAGE
`app/image-tools/ImageTransformTool.tsx` (shared engine, slug: `crop-image`)

### Current Features
- **Single-file upload** — JPG, PNG, WebP accepted.
- **Interactive drag-and-resize crop editor** — pointer-based draggable selection box directly image ke upar, 8 resize handles (nw, n, ne, e, se, s, sw, w) + move-by-drag.
- **Manual numeric controls** — Width, Height, Position X, Position Y sabhi ko number input se bhi precisely set kar sakte hain (auto-clamped to image bounds).
- **Aspect ratio presets** — FreeForm, 1:1, Circle, 4:3, 3:4, 16:9, 9:16 — select karte hi crop box us ratio me auto-center ho jaata hai.
- **Circle crop mode** — output transparent PNG banta hai jisme circle ke bahar ka area remove ho jaata hai (canvas clipping path use hoti hai).
- **Reset button** — crop rectangle ko poore image size par wapas laata hai aur ratio ko FreeForm kar deta hai.
- **Live crop preview stage** — image ke actual aspect ratio ke saath scaled preview, jisme shaded overlay crop area ke bahar dikhta hai.
- **Result preview + download** — cropped output ka final dimension aur size dikhta hai, download button ke saath.
- **Client-side only processing** — canvas drawImage se crop hota hai, koi upload server par nahi.

### Suggested Additions
- **Batch crop** — same crop coordinates/ratio multiple images par apply karna.
- **Rotate crop box** — crop selection ko angle par rotate karne ka option (abhi sirf axis-aligned rectangle).
- **Grid overlay (rule of thirds)** — composition guide lines crop editor me.
- **Zoom/pan inside crop editor** — bade images ko zoom karke precise crop select karna.
- **Preset shapes beyond circle** — star, heart, rounded-rectangle jaise custom clip shapes.
- **Undo/redo crop history** — multiple crop attempts ke beech switch karna.
- **Snap-to-edge / smart guides** — crop box ko image edges ya center ke saath snap karna.
- **Save custom aspect ratio** — user-defined ratio ko future use ke liye save karna.

---

## 9. Rotate IMAGE
`app/image-tools/rotate-image/RotateImageClient.tsx`

### Current Features
- **Multi-file upload** — click ya drag-and-drop, multiple JPG/PNG/WebP images ek saath.
- **Supported formats** — JPG, JPEG, PNG, WebP (MIME type + extension dono se validate).
- **Auto-rotate on upload** — files add hote hi current angle/flip settings ke saath automatically process ho jaati hain.
- **Quick rotate buttons** — "Left 90°", "Right 90°", "180°" one-click nudge buttons.
- **Custom angle input** — 0–360° tak koi bhi exact degree number input se enter kar sakte hain (auto-normalized).
- **Flip horizontal / flip vertical toggles** — independently on/off, rotation ke saath combine hote hain.
- **Reset button** — angle aur flips ek click me default (0°, no flip) par wapas.
- **Canvas-based rotation math** — output canvas ka width/height rotation angle ke hisaab se dynamically calculate hota hai (bounding box formula) taaki content crop na ho.
- **High-quality smoothing** — `imageSmoothingQuality: "high"` set hota hai rotate karte waqt.
- **Same-format output** — output file ka MIME type original file ke type se match karta hai (quality 0.92 par encode).
- **Per-file card UI** — filename, dimensions, live thumbnail (rotated result agar ready hai).
- **Individual remove** — har file card se hi delete (processing ke dauraan disabled).
- **Add more files** — studio open hone ke baad bhi aur images add kar sakte hain.
- **Preview modal** — original vs rotated image side-by-side comparison, dono ke dimensions ke saath.
- **Individual download** — `-rotated` suffix wale naye filename ke saath.
- **Bulk ZIP download** — JSZip se saari rotated images ek ZIP me (DEFLATE level 6).
- **Clear all / Start over** — sab files ek click me clear.
- **Client-side only processing** — Canvas API se browser me hi hota hai, "Files stay in your browser" badge.
- **Error handling** — unsupported format ya corrupt image par specific error message.
- **Live status panel** — total files, kitni rotate ho chuki, current processing status.

### Suggested Additions
- **Auto-straighten (EXIF orientation fix)** — iPhone/camera photos jo galat orientation me aati hain unhe auto-detect + fix karne ka option.
- **Free-form/manual straighten with grid overlay** — draggable protractor ya grid-line overlay taaki tilted horizon visually seedha kiya ja sake.
- **Per-image individual rotation** — abhi ek hi angle/flip saari files par apply hota hai; har image ko alag angle dene ka option.
- **Live preview before applying** — angle slider ke saath real-time canvas preview (currently sirf apply ke baad preview modal me dikhta hai).
- **Crop after rotate** — rotation se bane transparent/extra corners ko auto-crop karne ka toggle.
- **Background fill color picker** — non-90° rotation par jo corner gaps bante hain unke liye background color choose karna (abhi transparent/default).
- **Keyboard shortcuts** — arrow keys ya R/L keys se quick rotate.
- **Batch rotate presets by file** — different files ko different fixed angles (e.g. odd/even pages) assign karna.
- **Output format override** — output format manually choose karna (abhi hamesha input format match karta hai).

---

## 10. Convert to JPG
`app/image-tools/convert-to-jpg/ConvertToJpgClient.tsx`

### Current Features
- **Multi-file upload** — click ya drag-and-drop, multiple images ek saath.
- **Supported input formats** — PNG, WebP, GIF, BMP, SVG, aur HEIC/HEIF (MIME + extension check).
- **HEIC pre-processing** — HEIC/HEIF files ko `heic2any` library se pehle hi JPEG preview me convert kiya jaata hai (client-side); agar decode fail ho to standard "could not be opened" error aata hai.
- **Auto-convert on upload** — files add hote hi default 90% quality par automatically JPG me convert.
- **JPG quality slider** — 40% se 100% tak (step 5), higher = zyada detail, lower = chhota file.
- **Quality change re-converts** — slider change karne par purane results clear ho jaate hain (manual re-run "Convert at X%" button se).
- **White background fill** — transparency wale sources (PNG/WebP/SVG) me transparent areas JPG output me white se fill hote hain.
- **Canvas-based conversion** — HTMLCanvasElement + `toBlob("image/jpeg", quality/100)`.
- **Per-file card UI** — filename, original size, dimensions, converted JPG size, % size saved.
- **Individual remove / add more files**.
- **Preview modal** — original vs converted JPG side-by-side, size aur % change ke saath.
- **Individual download** — `.jpg` extension wale naye filename ke saath.
- **Bulk ZIP download** (JSZip, DEFLATE level 6).
- **Clear all / Start over**.
- **Client-side only processing** — "Files stay in your browser" badge.
- **Error handling** — unsupported type ya corrupt file par specific error.

### Suggested Additions
- **Animated GIF handling clarity** — GIF input se sirf first frame convert hota hai; UI me explicit note/warning add karna (jaisa GIF Converter tool me hai).
- **Batch total savings summary** — total original vs total converted size overall.
- **Background color picker for transparency fill** — sirf white ke bajaye custom color choose karna.
- **DPI/print-size metadata option** — print use-case ke liye DPI set karna.
- **Progressive JPEG toggle** — web loading ke liye progressive encoding option.
- **Max dimension / resize-on-convert** — bade images ko convert karte waqt hi resize karne ka option.
- **EXIF strip toggle** — privacy ke liye metadata remove karne ka control.
- **SVG rendering scale control** — SVG input ko higher resolution par render karne ka option (abhi natural SVG size par hi convert hota hai).
- **Compare multiple quality levels side-by-side** — best % choose karne ke liye.

---

## 11. Convert from JPG
`app/image-tools/ImageTransformTool.tsx` (shared engine, slug: `convert-from-jpg`)

### Current Features
- **Input formats** — sirf JPG/JPEG aur WebP accepted.
- **Output format choice** — PNG (lossless) ya WebP.
- **Quality slider** — sirf jab WebP output selected ho (40–100%).
- **Single-file only** — batch conversion supported nahi.
- **Replace file** — dusri image try karne ke liye upload replace kar sakte hain.
- **Live before/after preview** — result aane ke baad preview automatically update hota hai.
- **Client-side conversion** — canvas.toBlob se format convert hota hai, koi server upload nahi.
- **Download** — output file ka naam `<original>-convert-from-jpg.<ext>` pattern me.

### Suggested Additions
- **More output formats** — BMP, GIF, TIFF, ICO bhi output options me add karna (image-converter tool jaisa).
- **Batch/multi-file conversion** — ek saath kai JPG/WebP files convert karna + ZIP download.
- **Transparency preview warning** — JPG se PNG convert karte waqt clearly batana ki JPG me pehle se transparency nahi thi.
- **Resize during conversion** — output dimensions bhi saath me set karne ka option.
- **Drag-and-drop support check** — agar already hai to explicitly highlight; agar nahi to add karna.
- **Compression alongside conversion** — PNG output ka size bhi optimize karne ka toggle.

---

## 12. HTML to IMAGE
`app/image-tools/ImageTransformTool.tsx` (shared engine, slug: `html-to-image`)

### Current Features
- **HTML file upload** — `.html`/`.htm` files accept karta hai.
- **Auto-render on upload** — file select karte hi turant processing shuru ho jaati hai, koi manual "convert" button nahi (sirf status "Rendering HTML…" / "Rendered automatically" dikhta hai).
- **Text-only rendering (safety-first)** — HTML parse karke `<script>`, `<style>`, `<noscript>` tags remove kiye jaate hain, sirf visible text content (`innerText`/`textContent`) canvas par draw hota hai — yeh full visual HTML→image render **nahi** hai, sirf readable text ek styled canvas image me convert hota hai.
- **Fixed canvas layout** — 1200px width, text ke wrap hone ke hisaab se dynamic height (min 500px), title bold 30px font me file name ke saath, body 18px font, ~92 characters per line wrap.
- **Security note shown to user** — "Scripts, remote resources, and tracking are not executed. Readable HTML content is rendered locally."
- **Output** — hamesha PNG format me.
- **Download** — `<original>.png` naam se.
- **Client-side only** — DOMParser + canvas, koi server-side rendering nahi.

### Suggested Additions
- **True visual rendering option** — actual CSS-styled layout render karna (e.g. html2canvas library use karke) instead of sirf plain text extraction — abhi ka behavior misleading ho sakta hai users ke liye jo poora styled page expect karte hain.
- **Custom canvas styling controls** — font, font size, background color, text color user choose kar sake.
- **Multiple HTML files batch conversion**.
- **Preview before download** — abhi result seedha ban jaata hai, ek explicit "preview" step add karna.
- **Support pasting raw HTML/URL** — file upload ke alawa direct HTML text paste ya URL se fetch karne ka option (Website to Image tool jaisa).
- **Adjustable canvas width** — abhi fixed 1200px hai, isko configurable banana.

---

## 13. Website to Image
`app/image-tools/website-to-image/WebsiteToImageClient.tsx`

### Current Features
- **Single URL input** — website URL enter karke Enter key ya button se capture trigger.
- **Server-side screenshot API** — yeh tool client-side canvas nahi, balki backend API (`POST /api/tools/website-to-image/`) call karta hai jo actual screenshot capture karta hai.
- **Full-page vs viewport-only capture mode** — dropdown se select karna.
- **Browser width presets** — Desktop 1280px, Wide desktop 1440px (default), Full HD 1920px, Tablet 768px, Mobile 390px/375px.
- **Output format choice** — JPG (smaller file) ya PNG (best quality).
- **JPG quality presets** — Compressed 70%, High 90%, Maximum 100% (sirf JPG format ke liye dikhta hai).
- **Response validation** — agar API response image type ka nahi hai to error throw hota hai.
- **Auto filename generation** — hostname se derive hoke `{host}-full-page.jpg` ya `{host}-viewport.png` jaisa naam.
- **Single image preview** — capture ke baad screenshot inline dikhta hai; capture se pehle placeholder icon/instructions.
- **Loading state** — "Loading and capturing the complete webpage..." spinner ke saath.
- **Single download button** — file size ke saath.
- **Error handling** — API error message dikhta hai (e.g. login/paywall/private/local URLs blocked note UI me already dikhaya gaya hai).
- **No batch/multi-URL support** — ek time par sirf ek URL capture hoti hai.

### Suggested Additions
- **Batch URL capture** — multiple URLs ek saath queue me capture karke ZIP download.
- **Element/selector-specific capture** — pura page ke bajaye ek specific CSS selector/element ka screenshot lena.
- **Delay/wait-for-load control** — lazy-loaded content ke liye custom wait time set karna (JS-heavy sites ke liye).
- **Ad/cookie-banner blocking toggle** — cleaner screenshots ke liye auto-dismiss popups.
- **Dark mode / custom CSS injection** — capture se pehle custom styles inject karna.
- **Scheduled/recurring capture** — website changes track karne ke liye periodic screenshots (history).
- **Annotation tools** — screenshot par arrows/text/highlight add karna post-capture.
- **PDF export option** — image ke alawa full-page PDF bhi generate karna.
- **Device frame mockup** — screenshot ko browser/phone frame ke andar wrap karke export karna.

---

## 14. Image Converter
`app/image-tools/ImageTransformTool.tsx` (shared engine, slug: `image-converter`)

### Current Features
- **Universal input** — koi bhi image type (`image/*`) plus `.svg` accept karta hai.
- **7 output formats** — JPG, PNG, WebP, SVG, BMP, ICO, PDF.
- **Conversion route indicator** — "Source Format → Target Format" badge UI me clearly dikhta hai.
- **Resize output options** — Keep original size, 75%, 50%, 25%, ya Maximum 1920px (longest edge).
- **Quality slider** — JPG aur WebP output ke liye (40–100%).
- **Auto Orient checkbox** — browser-decoded image orientation ke hisaab se sahi rotate karta hai.
- **Strip Metadata checkbox** — canvas export se EXIF/profiles/comments already omit ho jaate hain, yeh checkbox informational hai (canvas hamesha strip karta hai).
- **Custom format encoders likhe gaye hain**:
  - **BMP** — hand-written 24-bit BMP encoder (row padding, bottom-up pixel order) canvas pixel data se.
  - **ICO** — hand-written single-image 32-bit ICO encoder jo PNG data ko ICO container me wrap karta hai.
  - **SVG** — "vectorization" nahi hai; ek SVG wrapper banta hai jisme raster PNG ek `<image>` element ke through embed hoti hai (data URI).
  - **PDF** — `pdf-lib` library use karke ek single-page PDF banta hai jisme image embed hoti hai.
- **Single file only** — batch conversion supported nahi.
- **Client-side only processing** — koi upload server par nahi jata.

### Suggested Additions
- **Batch conversion + ZIP download** — multiple files ek saath convert karna.
- **Real SVG vectorization** — actual path-tracing based vectorization (jaise PNG to SVG tool me hona chahiye) instead of raster-embedding wrapper — abhi ka "SVG" output asal me scalable nahi hai, sirf ek image tag wrapped hai.
- **Multi-page/multi-image PDF** — multiple images ek hi PDF me combine karne ka option.
- **Custom PDF page size** — A4/Letter/Custom dimensions choice (abhi image dimensions hi page size ban jaate hain).
- **True EXIF-preserving option** — kabhi kabhi user metadata (jaise copyright) intentionally rakhna chahta hai — currently hamesha strip hota hai, ek toggle jo actually kaam kare (canvas limitation ko bypass karne ke liye alternate encoding path chahiye).
- **ICO multi-resolution support** — abhi sirf single-size icon banta hai; Windows favicon standard multiple sizes (16/32/48/256) ek hi .ico me chahta hai.
- **GIF output support** — animated ya static GIF output missing hai output format list me.
- **Preset conversion shortcuts** — "Convert for Web", "Convert for Print" jaise quick presets jo format+resize+quality auto set karein.

---

## 15. HEIC to JPG
`app/image-tools/heic-to-jpg/HeicToJpgClient.tsx`

### Current Features
- **Multi-file upload** — click ya drag-and-drop, multiple HEIC/HEIF photos ek saath.
- **Supported input formats** — HEIC, HEIF, HEIC-sequence, HEIF-sequence (MIME + extension check).
- **Auto-convert on upload** — files add hote hi default 90% quality par automatically JPG me convert.
- **`heic2any` library** — decode aur conversion ke liye dynamically imported (`await import("heic2any")`), fully client-side.
- **JPG quality slider** — 40–100% (step 5); change hote hi saare items purane results clear kar ke turant re-convert hote hain.
- **Per-file conversion error isolation** — agar ek file corrupt/invalid HEIC hai to sirf uska error dikhta hai, baaki files unaffected rehti hain.
- **No live source preview** — HEIC ka original preview browser me nahi dikhaya jaata (kyunki most browsers HEIC render nahi karte, sirf Safari karta hai) — preview modal me explicit note hai.
- **Dimension detection post-conversion** — converted JPG blob se hi width/height nikalte hain.
- **Per-file card UI** — filename, original size, converted thumbnail, dimensions, converted JPG size.
- **Individual remove / add more photos**.
- **Preview modal** — "original HEIC" side unavailable message dikhata hai, "converted JPG" side actual image.
- **Individual download** — `.jpg` extension.
- **Bulk ZIP download** (JSZip, DEFLATE level 6).
- **Clear all / Start over**.
- **Client-side only** — "Files stay in your browser" / "Original HEIC files never leave your device" messaging.

### Suggested Additions
- **Batch EXIF/GPS data viewer or stripper** — iPhone HEIC photos me location data hoti hai, isko strip/keep karne ka toggle.
- **Live camera-icon based fallback preview** — Safari users ke liye actual live preview enable karna (Safari support hai already, but no code path shows it explicitly before conversion).
- **PNG output option** — sirf JPG ke bajaye HEIC ko PNG (lossless) me bhi convert karne ka choice.
- **Burst/Live Photo (HEIC sequence) frame selection** — HEIC-sequence files me multiple frames hote hain, sirf ek frame extract hota hai — user ko frame choose karne dena.
- **Auto-rotate based on EXIF orientation** — iPhone photos ke orientation tag ko respect karke output correctly rotate karna.
- **Original filename + date preservation** — capture date ko output filename me include karne ka option.
- **Batch rename pattern** — sequential numbering jaise "photo-1.jpg, photo-2.jpg".
- **Quality auto-detect based on source** — bade HEIC files ke liye smarter default quality suggestion.

---

## 16. SVG Converter
`app/image-tools/svg-converter/SvgConverterClient.tsx`

### Current Features
- **Multi-file upload** — click ya drag-and-drop, multiple SVG files ek saath.
- **Supported input** — sirf SVG (`image/svg+xml` MIME ya `.svg` extension).
- **Native dimension parsing** — SVG text se `width`/`height` attributes ya `viewBox` regex se parse; fallback 512×512 agar kuch na mile.
- **Auto-convert on upload** — default scale 4x, PNG format par automatically render.
- **Export scale options** — 1x, 2x, 4x (default), 8x — dropdown me actual pixel dimensions bhi preview hoti hain.
- **Output format choice** — PNG (transparency preserved) ya JPG (white background fill).
- **Rasterization via canvas** — SVG ko `<img>` element me load karke canvas par scaled size par draw kiya jaata hai (real vector-to-raster upscale, not just embedding).
- **High-quality smoothing** enabled.
- **JPG/PNG quality fixed at 0.95** — user-configurable quality slider nahi hai.
- **Per-file card UI** — filename, original size, source dimensions vs rendered output dimensions.
- **Individual remove / add more files**.
- **Preview modal** — original SVG vs converted raster side-by-side, rendered resolution ke saath.
- **Individual download** — `.png`/`.jpg` extension.
- **Bulk ZIP download** (format-specific naming: `repetigo-converted-png.zip`).
- **Clear all / Start over**.
- **Client-side only** — "Files stay in your browser" badge.

### Suggested Additions
- **Custom exact pixel dimensions input** — sirf preset multipliers (1x/2x/4x/8x) ke bajaye "width x height" exact number input.
- **WebP output option** — PNG/JPG ke alawa WebP bhi.
- **Background color picker** — sirf white ke bajaye custom color for JPG output.
- **SVG with external references warning** — agar SVG me external image/font references hain jo load nahi ho paate, unke liye specific error/warning.
- **Batch export multiple sizes at once** — ek hi SVG ko ek saath multiple scales (icon set generation - 16px, 32px, 64px, etc.) me export karna.
- **JPG/PNG quality slider** — abhi fixed 0.95 hai, user control add karna.
- **Aspect ratio lock / crop to square** — icon exports ke liye useful.
- **Animated SVG frame capture note** — agar SVG me CSS animation hai to sirf static frame capture hota hai, is baat ka explicit disclosure.

---

## 17. WebP to PNG
`app/image-tools/webp-to-png/WebpToPngClient.tsx`

### Current Features
- **Multi-file upload** — click ya drag-and-drop, multiple WebP images ek saath.
- **Supported input** — sirf WebP (`image/webp` MIME ya `.webp` extension).
- **Auto-convert on upload** — koi settings nahi, seedha PNG me convert ho jaata hai upload hote hi.
- **No configurable options** — na quality slider, na format choice — sirf ek fixed lossless PNG output ("nothing to configure" UI me explicitly bataya gaya hai).
- **Canvas-based conversion** — `clearRect` + `drawImage`, `toBlob("image/png")` (lossless, no quality param).
- **Transparency fully preserved** — WebP ka alpha channel exactly PNG me carry hota hai.
- **Per-file card UI** — filename, original size, dimensions, converted PNG size.
- **Individual remove / add more files**.
- **Preview modal** — original WebP vs converted PNG side-by-side.
- **Individual download** — `.png` extension.
- **Bulk ZIP download** (JSZip, DEFLATE level 6).
- **Clear all / Start over**.
- **Client-side only** — "Files stay in your browser" badge.
- **Error handling** — unsupported format ya unreadable file par error.

### Suggested Additions
- **Animated WebP handling disclosure** — agar animated WebP diya jaaye to sirf first frame convert hoga; iski explicit UI note (jaisa GIF Converter me hai) missing hai.
- **PNG compression level control** — output file size optimize karne ke liye (abhi browser default compression).
- **Batch resize on convert** — WebP se PNG banate waqt hi resize karna.
- **Output color profile / bit-depth option** — 8-bit vs 16-bit PNG choice.
- **Original vs converted size comparison text** — abhi sirf converted size dikhta hai, % change nahi (jaisa doosre tools me hai).
- **Alternate lossless format options** — WebP se TIFF ya lossless output alternatives.
- **EXIF metadata preservation toggle** — agar source WebP me metadata hai.

---

## 18. PNG Converter
`app/image-tools/png-converter/PngConverterClient.tsx`

### Current Features
- **Multi-file upload** — click ya drag-and-drop, multiple PNG images ek saath.
- **Supported input** — sirf PNG.
- **6 output formats** — JPG, WebP, GIF (256 colours), BMP, ICO (icon), PDF — dropdown se choose.
- **Auto-convert on upload** — default JPG format, 90% quality.
- **Quality slider (40–100%, step 5)** — sirf JPG aur WebP outputs ke liye dikhta hai (GIF/BMP/ICO/PDF ke liye chhupa hota hai).
- **Format-specific white background fill** — JPG output ke liye transparent areas white se fill hote hain.
- **Canvas-based rasterization** — sabhi formats ek hi canvas se derive hote hain.
- **GIF encoding via `gifenc`** — dynamically imported, `quantize` + `applyPalette` (rgba4444, 1-bit alpha) se 256-color palette + `GIFEncoder` se single-frame GIF banti hai.
- **BMP encoding — hand-rolled** — 24-bit uncompressed BMP binary format khud DataView se likha gaya hai (proper BITMAPFILEHEADER/BITMAPINFOHEADER).
- **ICO encoding — hand-rolled** — PNG data ko ICO container me wrap kiya jaata hai (single-image ICO format).
- **PDF export via `pdf-lib`** — dynamically imported; PNG canvas ko embed karke ek single full-page PDF banaya jaata hai.
- **Format-specific helper notes** — GIF/ICO/PDF/BMP/JPG-WebP ke liye alag explanatory text side panel me.
- **Per-file card UI, remove, add more files**.
- **Preview modal** — PDF format ke liye inline preview available nahi ("download to view" message), baaki formats ke liye image preview.
- **Individual download / Bulk ZIP download** (format-named ZIP file).
- **Clear all / Start over**.
- **Client-side only** — "Converted entirely in your browser" note.
- **Per-file error isolation** — ek file fail ho to baaki continue karti hain.

### Suggested Additions
- **TIFF output option** — professional/print workflows ke liye.
- **Multi-size ICO export** — abhi single-resolution ICO banta hai; standard ICO me multiple sizes (16/32/48/256) embed karna zyada useful hoga.
- **Animated GIF from multiple PNGs** — agar multiple PNG frames diye jayein to animated GIF banane ka mode.
- **Custom PDF page size / margins** — abhi image hi full page hai, koi margin/orientation control nahi.
- **Color palette preview for GIF** — quantization se pehle 256-color preview dikhana.
- **DPI setting for PDF/print output**.
- **Batch quality comparison** — same source ko 2-3 quality levels par side-by-side.
- **Transparent GIF alpha threshold control** — abhi fixed oneBitAlpha, custom threshold nahi.

---

## 19. WebP to JPG
`app/image-tools/webp-to-jpg/WebpToJpgClient.tsx`

### Current Features
- **Multi-file upload** — click ya drag-and-drop, multiple WebP images ek saath.
- **Supported input** — sirf WebP.
- **Auto-convert on upload** — default 90% quality.
- **JPG quality slider** — 40–100% (step 5); change hone par results clear ho kar re-convert available hote hain.
- **White background fill** — WebP transparency JPG me white se replace hoti hai.
- **Canvas-based conversion** — high-quality smoothing enabled.
- **Per-file card UI** — filename, original size, dimensions, converted size, % size saved (`savingText` helper).
- **Individual remove / add more files**.
- **Preview modal** — original vs converted, dono size aur saving % ke saath.
- **Individual download** (`.jpg`).
- **Bulk ZIP download** (JSZip).
- **Clear all / Start over**.
- **Client-side only** — "Files stay in your browser" badge.
- **Error handling** — unsupported/corrupt file specific errors.

### Suggested Additions
- **Animated WebP → first-frame disclosure** — currently silent, koi explicit note nahi (baaki similar tools jaise GIF converter me hai).
- **Background color picker** — white ke alawa custom fill color.
- **Batch original vs total savings summary**.
- **Resize-on-convert option**.
- **Progressive JPEG toggle**.
- **EXIF metadata handling toggle**.
- **Compare quality levels side-by-side before committing**.
- **Drag-to-reorder batch files**.

---

## 20. JPG to WebP
`app/image-tools/jpg-to-webp/JpgToWebpClient.tsx`

### Current Features
- **Multi-file upload** — click ya drag-and-drop, multiple JPG/JPEG images ek saath.
- **Supported input** — sirf JPG/JPEG (`image/jpeg` MIME ya `.jpg`/`.jpeg` extension).
- **Auto-convert on upload** — default 80% quality (WebP-specific default, doosre JPG-based tools ke 90% se alag).
- **WebP quality slider** — 40–100% (step 5).
- **No white-fill needed** — JPG source me transparency nahi hoti, isliye seedha draw hota hai bina background fill ke.
- **Canvas-based conversion** — `toBlob("image/webp", quality/100)`.
- **Per-file card UI** — filename, original size, dimensions, converted WebP size, % size saved.
- **Individual remove / add more files**.
- **Preview modal** — original vs converted, size saving % ke saath.
- **Individual download** (`.webp`).
- **Bulk ZIP download**.
- **Clear all / Start over**.
- **Client-side only** — "Files stay in your browser" badge; note: "At quality 80+, WebP output is visually identical to the JPG source."
- **Error handling** — unsupported/corrupt file errors.

### Suggested Additions
- **Lossless WebP mode toggle** — abhi hamesha lossy encode hota hai; canvas `toBlob` WebP lossless mode add karna (browser support ke hisaab se).
- **Batch total savings summary**.
- **Auto-quality recommendation** — source image content ke hisaab se best quality suggest karna.
- **Animated WebP output from multiple frames** — creative use-case, low priority.
- **Resize-on-convert combined step**.
- **EXIF preservation/strip toggle**.
- **Compare before/after with draggable slider** instead of static side-by-side.
- **Batch rename pattern for output files**.

---

## 21. JPG Converter
`app/image-tools/jpg-converter/JpgConverterClient.tsx`

### Current Features
- **Multi-file upload** — click ya drag-and-drop, multiple JPG images ek saath.
- **Supported input** — sirf JPG/JPEG.
- **7 output formats** — PNG, WebP, GIF (256 colours), BMP, ICO (icon), PDF, SVG (vector trace).
- **Auto-convert on upload** — default PNG format, 90% quality.
- **Quality slider** — sirf WebP output ke liye dikhta hai (PNG hamesha lossless quality 1 par encode hota hai; is tool me `QUALITY_FORMATS` sirf `["webp"]` hai, PNG Converter tool se yeh alag hai jahan JPG bhi quality-configurable hota hai).
- **SVG vector tracing** — `imagetracerjs` library se; max trace dimension 1000px tak downscale kiya jaata hai performance ke liye, phir `ImageTracer.imagedataToSVG(imageData, "default")` se actual path-based vector SVG banta hai (raster ko SVG wrapper me embed nahi karta, real tracing hai).
- **GIF encoding via `gifenc`** — `quantize`(rgb565 format) + `applyPalette` + `GIFEncoder`, single-frame.
- **BMP encoding — hand-rolled 24-bit uncompressed**.
- **ICO encoding — hand-rolled single-image ICO container**.
- **PDF export via `pdf-lib`** — JPG embed (`embedJpg`) full-page single-image PDF.
- **Format-specific notes** — PNG/GIF/ICO/PDF/BMP/SVG/WebP sabke liye alag explanatory helper text.
- **Per-file card UI, remove, add more files**.
- **Preview modal** — PDF format ke liye inline preview unavailable, baaki formats ke liye image preview.
- **Individual download / Bulk ZIP download** (format-named).
- **Clear all / Start over**.
- **Client-side only processing**.
- **Per-file error isolation** — ek file fail hone par baaki continue.

### Suggested Additions
- **SVG trace preview before commit** — trace settings adjust karke preview dekhne ka option (detail level abhi fixed "default" preset hai, koi UI control nahi).
- **Vector trace detail/color presets** — jaisa PNG to SVG tool me hai (Simple/Balanced/Detailed/Line Art), yahan sirf ek hi hardcoded preset use hota hai.
- **Multi-size ICO export**.
- **TIFF output option**.
- **Batch quality/format comparison**.
- **Custom PDF page size/orientation**.
- **DPI setting for print-oriented outputs**.
- **Resize-on-convert combined step**.

---

## 22. PNG to JPG
`app/image-tools/png-to-jpg/PngToJpgClient.tsx`

### Current Features
- **Multi-file upload** — click ya drag-and-drop, multiple images ek saath.
- **Supported input formats** — PNG, WebP, GIF, SVG (input labelling "PNG to JPG" hai lekin code me actually PNG/WebP/GIF/SVG sab accept hote hain — HEIC/HEIF extensions bhi accept list me hain par isSupported check unhe explicitly cover nahi karta consistently).
- **Auto-convert on upload** — default 90% quality.
- **JPG quality slider** — 40–100% (step 5).
- **White background fill** — sabhi transparency-capable sources (PNG/WebP/GIF/SVG) ke transparent areas white se fill hote hain JPG output me.
- **Canvas-based conversion** — high-quality smoothing.
- **Per-file card UI** — filename, original size, dimensions, converted size, % size saved.
- **Individual remove / add more files**.
- **Preview modal** — original vs converted, size saving % ke saath.
- **Individual download** (`.jpg`).
- **Bulk ZIP download**.
- **Clear all / Start over**.
- **Client-side only** — "Files stay in your browser" badge.
- **Error handling** — unsupported/corrupt file errors (message specifically PNG/WebP/GIF/SVG mention karta hai).

### Suggested Additions
- **Accept-list vs isSupported mismatch cleanup** — `accept` attribute me `.heic,.heif` listed hai par `isSupported()` function unhe reject karta hai (only checks png/webp/gif/svg types) — is edge case ko fix/clarify karna ek genuine improvement hai: agar HEIC try kiya jaaye to confusing "not supported" error milega jabki file picker usse allow karta hai.
- **Background color picker** — white ke alawa custom fill.
- **Animated GIF → first-frame explicit note** — abhi missing.
- **Batch total savings summary**.
- **Resize-on-convert combined step**.
- **EXIF handling toggle**.
- **Progressive JPEG toggle**.
- **Compare quality levels side-by-side**.

---

## 23. GIF Converter
`app/image-tools/gif-converter/GifConverterClient.tsx`

### Current Features
- **Multi-file upload** — click ya drag-and-drop, multiple GIF images ek saath.
- **Supported input** — sirf GIF.
- **7 output formats** — JPG, PNG (transparency), WebP, BMP, ICO (icon), PDF, SVG (vector trace).
- **First-frame only** — animated GIFs se sirf first frame liya jaata hai; UI me explicit disclosure hai ("first frame only for animated GIFs" preview modal footer me, aur JPG format note me bhi mention).
- **Auto-convert on upload** — default JPG format, 90% quality.
- **Quality slider** — sirf JPG aur WebP ke liye dikhta hai.
- **White background fill** — sirf JPG aur BMP outputs ke liye (`WHITE_BACKGROUND_FORMATS`); PNG/WebP transparency preserve karte hain.
- **SVG vector tracing** — `imagetracerjs`, max 1000px trace dimension.
- **GIF encoding library dependency note** — interesting quirk: GIF Converter khud GIF output produce nahi karta (GIF hi to source hai), lekin baaki 6 formats me convert kar sakta hai.
- **BMP/ICO hand-rolled encoders** (same pattern as other converters).
- **PDF export via `pdf-lib`** — first frame PNG embed, full-page single-image PDF.
- **Format-specific helper notes** — sabhi 7 formats ke liye.
- **Per-file card UI, remove, add more files**.
- **Preview modal** — PDF preview unavailable, baaki formats visible; footer explicitly "first frame only for animated GIFs" bataata hai.
- **Individual download / Bulk ZIP download** (format-named).
- **Clear all / Start over**.
- **Client-side only processing**.
- **Per-file error isolation**.

### Suggested Additions
- **Full animated GIF frame extraction** — sabhi frames ko separate images (ya animated WebP) me export karne ka mode — abhi sirf first frame handle hota hai, yeh sabse bada gap hai.
- **GIF-to-video (MP4/WebM) conversion** — animated GIFs ke liye common use-case.
- **Frame preview/timeline for multi-frame GIFs** — kaunsa frame convert karna hai choose karne ka option.
- **Vector trace detail presets** — abhi fixed "default", user-selectable presets missing.
- **Multi-size ICO export**.
- **Loop count / playback speed metadata display** (informational, source GIF ke baare me).
- **Batch quality comparison**.
- **Resize-on-convert combined step**.

---

## 24. PNG to SVG
`app/image-tools/png-to-svg/PngToSvgClient.tsx`

### Current Features
- **Multi-file upload** — click ya drag-and-drop, multiple PNG images ek saath.
- **Supported input** — sirf PNG.
- **Real vector tracing (not raster-embed)** — `imagetracerjs` library dynamically imported; canvas image data ko actual bezier/path-based SVG me convert karta hai (path tracing algorithm), image ko SVG wrapper me simply embed nahi karta.
- **4 detail-level presets** — "Simple - Logos & Icons" (`posterized1`), "Balanced (Recommended)" (`default`), "Detailed" (`detailed`), "Black & White - Line Art" (`grayscale`) — dropdown se choose, imagetracerjs ke built-in presets use karte hain.
- **Max trace dimension cap** — 1000px tak downscale hota hai tracing se pehle (performance/complexity control ke liye).
- **Auto-trace on upload** — default "Balanced" preset ke saath.
- **Detail change re-traces** — preset badalte hi purane results clear ho kar re-run available.
- **Per-file card UI** — filename, original size, dimensions, converted SVG size, size comparison text (smaller/larger/similar).
- **Individual remove / add more files**.
- **Preview modal** — original PNG vs traced SVG side-by-side, size comparison ke saath.
- **Individual download** (`.svg`).
- **Bulk ZIP download**.
- **Clear all / Start over**.
- **Client-side only** — "Files stay in your browser" badge.
- **Guidance note** — "Best results come from flat-colour logos, icons, and line art - not photos" explicitly UI me bataya gaya hai.

### Suggested Additions
- **Color count / palette control** — imagetracerjs ke advanced options (numberofcolors, colorquantcycles) expose karna fine-grained control ke liye.
- **Path simplification / smoothness slider** — curve fitting aggressiveness control.
- **Live before/after trace preview with adjustable settings** — settings badalte hi live preview (abhi sirf preset dropdown, apply karna padta hai).
- **Manual color-to-path threshold** — specific colors ko merge/split karne ka control.
- **SVG output optimization (SVGO-style minify)** — file size reduce karna without quality loss.
- **Stroke-only / outline-only trace mode** — line art specific mode alag se.
- **Trace quality preview thumbnail with path/node count** — kitne paths bane, user ko batana.
- **Background transparency threshold control** — PNG alpha channel ko trace me kaise treat karna hai (abhi implicit).

---

## 25. Watermark IMAGE
`app/image-tools/watermark-image/WatermarkImageClient.tsx`

### Current Features
- **Single base image upload** — JPG/PNG/WebP.
- **Multiple watermark layers** — text aur/ya logo image layers, unlimited count, ek layer list me manage hote hain.
- **Draggable layers** — har layer (text ya image) canvas preview par seedha pointer-drag se position (x/y %) set hoti hai.
- **Text layer controls** — content (textarea), font (Arial, Georgia, Verdana, Impact, Courier New), size (12-180px number input), Bold/Italic/Underline toggle buttons, color picker.
- **Image/logo layer** — apni logo/image upload karke watermark ke roop me add karna.
- **Per-layer size/scale slider** — text ke liye 10-250%, image ke liye 10-100%.
- **Per-layer opacity slider** — 5-100%.
- **Per-layer rotation slider** — -180° se 180°.
- **Delete selected layer.**
- **Canvas-based final render** — text font-size canvas-width/1200 ratio se scale hota hai (resolution-independent), underline manually rectangle draw karke banaya jaata hai; logos canvas-width ke relative scale hoke draw hote hain.
- **Download format** — PNG ya JPG.
- **Batch apply** — exact same watermark layer stack (text/logo, position, size, opacity, rotation — sab) additional uploaded images par apply karna.
- **Bulk ZIP download** — batch results ko JSZip (dynamically imported, DEFLATE level 6) se ek ZIP me download.
- **Per-batch-item individual download** — har processed image ka apna download link bhi hai thumbnail card par.
- **Replace image button.**
- **Fully client-side** — sab kuch canvas API se, koi server upload nahi. "Files stay in your browser" badge.
- **Error handling** — image open failure, batch/export failure par specific messages.

### Suggested Additions
- **Tile/repeat watermark pattern mode** — poore image par ek repeating diagonal watermark pattern (common anti-theft use-case), abhi sirf single positioned instance hota hai.
- **Watermark presets/save for reuse** — apna watermark design (text+logo+position) save karke future sessions me reuse karna (abhi session-only hota hai).
- **Opacity/position of underline styling refinement** — minor, but text stroke/shadow option for watermark legibility on busy backgrounds missing.
- **Corner-snap positioning shortcuts** — quick buttons "Bottom Right", "Center", "Top Left" instead of sirf free-drag.
- **Blend mode options** — Multiply/Screen jaise blend modes for logo watermark ko background ke saath better blend karna.
- **Watermark preview at multiple sizes** — kaisा dikhega thumbnail size par vs full size, ek quick preview.
- **Alignment guides/snapping** — drag karte waqt center/edge alignment guides nahi hain.
- **Lock aspect ratio on logo scale** — already proportional but no explicit lock indicator/control for combined width+height.
- **PDF/multi-page watermarking bridge** — cross-link with PDF watermark tool for mixed batches.
- **Export watermark position as reusable JSON/preset file.**

---

## 26. Blur Face
`app/image-tools/blur-face/BlurFaceClient.tsx`

### Current Features
- **Single image upload** — JPG/PNG/WebP.
- **Automatic face detection on upload** — image server par POST hoti hai (`/api/tools/detect-faces/`, FormData `image` + `sensitivity`) aur detected face bounding boxes wapas milte hain.
- **Sensitivity levels** — Low, Recommended, High — badalne par dobara detection API call trigger hoti hai.
- **Smart fallback** — agar koi face detect na ho ya detection API fail ho jaaye, to portrait/landscape orientation ke hisaab se ek heuristic suggested blur box automatically apply hota hai, saath me explanatory message ("No face was confidently detected..." / "Detection server is unavailable...").
- **Custom mode** — manually blur areas add karna ("Add blur area" button), drag se move, resize handle se resize.
- **Per-box delete button** — har blur box ke corner par ek delete icon.
- **Blur strength slider** — 6px se 50px tak.
- **Selective blur rendering** — poori image blur nahi hoti; ek fully-blurred padded copy (CSS `blur()` filter, edge-artifact avoid karne ke liye padding) banayi jaati hai, phir sirf selected box regions us blurred copy se sharp base image par composite kiye jaate hain.
- **"Detecting faces..." overlay** — spinner with label jab tak server response na aaye.
- **Download** — hamesha PNG format, filename `-faces-blurred.png`.
- **Privacy messaging** — "Image is discarded after detection" badge (batata hai ki actual blurring client-side hoti hai, sirf detection ke liye server call lagti hai).
- **Replace image / Remove image buttons.**
- **Error/status messaging** — `role="status"` ke saath accessible alerts.

### Suggested Additions
- **Batch face-blurring** — abhi ek time me ek hi image process hoti hai; multi-upload + bulk blur + ZIP download nahi hai.
- **Pixelate option (alongside blur)** — Gaussian blur ke alawa mosaic/pixelation style bhi common privacy-tool feature hota hai.
- **Solid color / emoji cover option** — face ko black box ya emoji se cover karne ka alternative to blur.
- **Auto-detect other sensitive regions** — license plates, ID cards/text detection presets (abhi sirf face-oriented hai, custom box banana padta hai manually).
- **Select/deselect individual detected faces before blurring** — abhi sab detected boxes automatically blur ho jaate hain; "skip this face" checkbox nahi hai.
- **Video/GIF frame-by-frame face blur** — abhi sirf static images support hain.
- **Detection confidence display** — kitna confident detection tha, per-box score dikhana.
- **Undo/redo for box edits** — manual resize/move/delete ka history stack nahi hai.
- **Export blur box coordinates (JSON)** — reuse ke liye positions save karna, especially batch use-case ke liye useful.
- **Format choice for download** — abhi hardcoded PNG hai; JPG/WebP output option nahi.

---

## Cross-tool observations (worth reviewing separately)

- **Photo Editor** ka upload description text "background removal" mention karta hai, par actual code me yeh feature implement nahi hai — copy fix ya feature add, dono me se ek karna chahiye.
- **PNG to JPG** tool ka file-picker `accept` attribute `.heic,.heif` allow karta hai, par uska `isSupported()` validator unhe reject kar deta hai — confusing error experience.
- **GIF-accepting tools** (Convert to JPG, PNG to JPG) me "first frame only for animated GIFs" ka explicit disclosure missing hai, jabki GIF Converter tool me yeh clearly mention hota hai — consistency ke liye sabme add karna chahiye.
- **SVG output** teen jagah alag tarike se banta hai: Image Converter me raster-embed wrapper hai (asli vector nahi), jabki JPG/GIF/PNG-to-SVG converters me `imagetracerjs` se real path tracing hoti hai — is inconsistency ko SEO content likhte waqt dhyan me rakhna zaroori hai taaki galat claim na ho.
- **Batch/multi-file support** har tool me uniform nahi hai — Compress, Rotate, Convert to JPG, aur saare format-converters batch support karte hain, lekin Remove Background, Blur Face, Meme Generator, Resize, Crop, HTML to Image, Image Converter, Website to Image sab single-file hi hain. Yeh sabse common "Suggested Addition" hai jo repeat ho raha hai across tools.

---

*Yeh document 26 me se 26 tools cover karta hai. Review ke baad batayein — kisi tool ka feature list expand/trim karna ho, ya SEO content ke liye alag format chahiye ho, to bata dein.*
