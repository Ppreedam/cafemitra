# SEO Ranking Plan — PDF Tools & Image Tools

> Goal: get repetigo.com's PDF Tools and Image Tools pages ranking on Google.
> This plan is built from an actual audit of this codebase (Aug 2026) plus live
> Google search checks — not generic SEO advice. Timelines are honest ranges,
> not promises.

---

## 1. Reality check first

I ran live searches before writing this plan. Results:

- `site:repetigo.com` — **no results**. The domain currently has little to no
  visible presence in Google's index.
- `"compress pdf online free"` — top 8 results are **Adobe, Smallpdf, iLovePDF,
  PDF24, Drawboard, PDFgear, APITemplate, freepdfconvert**. Every one of these
  is a domain with 5-15+ years of history and Domain Authority in the 80-95
  range (Ahrefs DR scale), with tens of thousands of backlinks.
- `"remove background from image free"` — top 7 are **remove.bg, Adobe
  Express, Jukebox Print, PhotoScissors, Slazzer, Pixelcut, Photiu** — same
  story.
- `"repetigo.com print shop software"` — **not found at all**, not even for
  the brand name itself.

**What this means:** repetigo.com is starting from close to zero domain
authority and zero backlinks, competing directly against some of the
best-funded, longest-established tool sites on the internet, for some of the
most competitive "free tool" search terms that exist. Technical SEO fixes
(what we did in the previous session) are necessary but they will not, by
themselves, out-rank Adobe or iLovePDF for `"compress pdf"`. Nothing short of
sustained content + backlink + time investment will.

The plan below is honest about that. It prioritizes terms that are actually
winnable in the near term, and treats head-term competition as a long game.

---

## 2. Where things stand today (as of this audit)

| Area | Status | Notes |
|---|---|---|
| Per-page `<title>`/`<meta description>` | ✅ Done | Fixed this session across pricing, passport-photo, id-card-maker/print; PDF-tools pages already had it via `layout.tsx` (initially missed, then confirmed) |
| `robots.txt` | ✅ Already solid | Pre-existing, includes AI-crawler content-signal directives, disallows private routes, points to sitemap |
| `sitemap.xml` | ✅ Already solid | Auto-generated from the `app/` route tree |
| Private pages (`/login`, `/dashboard`, `/wallet`, etc.) | ✅ Done | `noindex` meta tag added this session as a backstop to the robots.txt disallow |
| Open Graph share images | 🟡 Partially fixed | 25 broken image references removed this session (no more broken-image previews on share) — but **no real branded OG images exist yet**, so shares currently have no preview image at all. See Phase 2. |
| Image Tools (26 tools) content accuracy | ✅ Good | Audited separately (`image-tools-content-audit.md`): 24/26 tools' SEO copy is accurate and honest about limitations. Only 2 tools (AI Upscaler, Remove Background) have unverifiable privacy-policy wording worth softening. |
| PDF Tools (~30 tools) content accuracy | 🔴 **Needs urgent work** | Audited separately (`pdf-tools-content-audit.md`): most tools' SEO copy describes features that **don't actually exist in the code** — fake OCR accuracy tables, fake "editable PowerPoint" claims, fake ISO PDF/A compliance, fake drag-to-reorder, "legally binding" e-signature claims, etc. This is the single biggest risk in this whole plan — see Phase 1. |
| `/pdf-tools/[tool]` and `/image-tools/[tool]` dynamic catch-all routes | 🔴 Not done | These serve several tools by slug but have no per-slug metadata (`generateMetadata`). Flagged, not yet scoped. |
| Domain authority / backlinks | 🔴 Near zero | Confirmed via live search. This is the long pole — see Phase 4. |
| Core Web Vitals / page speed | ❓ Not audited | Should be checked (Phase 2) — plain `<img>` tags are used in several tools instead of `next/image`, which can hurt LCP. |
| Google Search Console | ❓ Unknown if set up | Needed to actually request indexing and see real ranking/impression data — see Phase 3. |

---

## 3. The plan

### Phase 1 — Fix PDF Tools content accuracy (do this first, before any push)

**Why first:** Google's quality guidelines explicitly penalize misleading
content, and PDF tools are used for sensitive documents (Aadhaar, bank
statements) where accuracy matters even more. A false claim ("real OCR",
"editable PowerPoint export") also directly causes the exact behavioral
signals that kill rankings: a user tries the tool expecting what the page
promised, doesn't get it, bounces back to Google within seconds, and tries a
competitor. That bounce is a ranking signal against this page. **Pushing
backlinks and traffic at broken-promise content before fixing it would make
the whole campaign start from a worse position, not a better one.**

Already scoped in `pdf-tools-content-audit.md` — follow its severity order:

1. **🔴 Critical (6 tools)** — content describes a feature that flatly doesn't
   exist: OCR PDF (fake per-language accuracy table, not real OCR), PDF to
   PowerPoint (claims editable slides, actually outputs an image screenshot
   per page), PDF to PDF/A (fake ISO 19005 validation), Compare PDF (fake
   color-diff/report, actual tool just gives a similarity %), Word/PowerPoint
   to PDF (claims formatting preserved, actually strips to plain text), JPG to
   PDF (claims HEIC/WEBP/BMP/GIF support that doesn't exist).
2. **🟠 High (14 tools)** — exaggerated or partially-fake feature claims
   (Compress PDF's "lossless, text preserved" claim, Merge PDF's fake
   drag-to-reorder, Sign PDF's unqualified "legally binding" claim, etc. — full
   list in the audit doc).
3. **Site-wide find-and-replace** — nearly every PDF tool's copy says the file
   is "uploaded to our server... auto-deleted within 60 minutes." Except OCR
   PDF, this is false — everything runs in the browser and never uploads. This
   is actually a **better** privacy story than what's currently claimed, so
   fixing it is a net positive, not just risk-reduction.
4. **🟡 Low (5 tools)** — minor omissions, not urgent.

**Estimated effort:** each tool's rewrite is a few hundred to ~1,000 words of
accurate copy plus updated FAQ/HowTo schema. Realistically 1 tool per session
if done carefully (accuracy matters more than speed here). Say the word when
ready to start — I can go one tool at a time starting with the 6 Critical
ones.

**Timeline: 1-3 weeks** depending on pace, before moving to Phase 4.

### Phase 2 — Close the remaining technical gaps

- **Real Open Graph images.** 25 pages currently have no share-preview image
  (removed the broken references, but nothing replaced them). Needs actual
  branded 1200×630 images per tool — a design task, not something I can
  generate credibly on my own. Until these exist, links shared on
  WhatsApp/LinkedIn/Twitter/Facebook show no preview image, which measurably
  lowers click-through from shares (not a Google-ranking factor directly, but
  it affects the traffic and link signals that indirectly feed ranking).
- **`generateMetadata` for the two dynamic `[tool]` catch-all routes** —
  `pdf-tools/[tool]` and `image-tools/[tool]` currently serve multiple tools
  under one file with no per-slug title/description. Needs the slug configs
  enumerated first (separate, scoped task).
- **Core Web Vitals audit** — run Lighthouse/PageSpeed Insights on a few
  representative tool pages. Several tools use plain `<img>` instead of
  `next/image`; large canvas-preview images could be hurting LCP. Page speed
  is a confirmed (if minor) Google ranking factor and matters more for mobile
  traffic, which is most of India.
- **Soften the 2 unverifiable privacy claims** in AI Upscale Image and Remove
  Background (per `image-tools-content-audit.md`) — quick, low-risk fix.

**Timeline: 1-2 weeks**, can run in parallel with Phase 1.

### Phase 3 — Get Google actually watching (do this immediately, costs nothing)

- Verify the domain in **Google Search Console** if not already done.
- Submit `sitemap.xml` there.
- Use "Request Indexing" on the highest-priority tool pages to speed up
  initial crawl instead of waiting for organic discovery.
- Set up **Bing Webmaster Tools** too (smaller volume, but free and it also
  feeds some AI search surfaces like Copilot).
- This step doesn't move rankings by itself, but skipping it means flying
  blind — Search Console is also how we'll measure everything in Phase 6.

**Timeline: same day.** Do this regardless of anything else.

### Phase 4 — Backlinks & domain authority (the long pole — mostly not code)

This is the part that actually decides whether repetigo.com can ever compete
with Adobe/Smallpdf/iLovePDF/remove.bg on head terms, and it is **the one
part of this plan I cannot execute directly** — it needs business/marketing
effort, not code changes. Realistic, low-cost starting points for a new
Indian SaaS tool site:

- **Directory & tool-listing submissions**: Product Hunt launch, AlternativeTo,
  SaaSHub, G2/Capterra (if applicable to PrintPilot), free-tool directories
  (There's An AI For That, Toolify, etc.). Low effort, gives early low-authority
  backlinks and some direct traffic.
- **India-specific channels**: cyber cafe / CSC (Common Service Centre)
  associations, print-shop owner Facebook/WhatsApp groups, local business
  directories (JustDial, IndiaMART) linking back to repetigo.com.
- **Guest posts / mentions** on blogs about small business tools, Indian
  startup press (YourStory, Inc42) if there's a founder story angle.
- **HARO / journalist requests** for quotes on print-shop digitization, PDF
  privacy, etc. — earns editorial backlinks from real publications.
- **Internal linking** from the main RepetiGo/PrintPilot marketing pages into
  the tool pages, and between related tools (already partially in place via
  "Related Tools" sections — keep that pattern consistent everywhere).

**Timeline: ongoing, months 1-12+.** Backlink accumulation compounds slowly;
there is no shortcut. Budget for this being the slowest-moving, highest-payoff
part of the plan.

### Phase 5 — Content marketing for long-tail traffic (parallel, ongoing)

Instead of only fighting head terms Adobe already owns, target queries where
there's far less competition:

- India-specific queries: "aadhaar photo size online", "passport photo size
  india cm", "exam form photo size kb", "how to reduce pdf size for govt
  portal upload".
- "How to" content that funnels into the tool (this pattern already exists
  inside the compress-pdf article — e.g. its GIMP/Photoshop/Illustrator
  comparison section captures searches for those too).
- A blog (there's already a `/blog` route in the sitemap — worth checking
  what's actually on it) publishing India-focused, print-shop-focused content
  that links back to the tools.

**Timeline: ongoing.** First movement on long-tail terms is realistically
achievable in 4-8 weeks after Phase 1-3 are done and pages are indexed; this
is the fastest-moving part of the whole plan.

### Phase 6 — Measure and iterate

- Weekly Search Console check: impressions, average position, CTR per page.
- Watch for pages stuck at position 40-100 (indexed but not yet
  competitive) vs pages with zero impressions (not indexed / not discovered).
- Re-prioritize Phase 1/5 content work based on which pages are closest to
  breaking into page 1-2 — small pushes on "almost there" pages often beat
  starting new ones from zero.

---

## 4. Realistic timelines (honest, not aspirational)

| Tier | Example terms | Realistic first movement | Realistic page-1 shot |
|---|---|---|---|
| **India-specific long-tail** | "aadhaar photo size online", "passport photo maker india free" | 4-8 weeks after indexing | 3-6 months |
| **Medium-competition tool terms** | "organize pdf pages online", "repair damaged pdf online", "png to svg converter" | 2-4 months | 6-9 months |
| **High-competition head terms** | "compress pdf online free", "remove background from image free", "merge pdf" | Unlikely to see meaningful movement under ~6 months | 12-24+ months, with sustained backlink investment — and even then, unseating Adobe/Smallpdf/iLovePDF/remove.bg specifically is not guaranteed at any timeline without a large, sustained link-building budget |

**Bottom line:** "Top ranking" is not a single number of days — it depends
entirely on which keyword tier you mean. Long-tail, India-specific wins are
realistic within a quarter. Beating Adobe for "compress pdf" is a 1-2+ year
campaign, if it's achievable at all for a small domain without significant
backlink investment. Anyone promising #1 ranking in weeks for a competitive
head term is not being straight with you — that's not how Google works
against DA-90 incumbents.

---

## 5. Division of work

| Task | Who |
|---|---|
| Fix PDF tools content accuracy (Phase 1) | Me (Claude), one tool at a time |
| Technical fixes — metadata, schema, Core Web Vitals (Phase 2) | Me (Claude) |
| Search Console / Bing Webmaster setup (Phase 3) | You (needs account access/verification) — I can prep the sitemap submission details |
| Real branded OG images | Design work — you or a designer; I can write the exact spec (dimensions, per-tool copy) |
| Backlinks, directory submissions, PR, community outreach (Phase 4) | You / marketing — not something I can execute |
| Blog content (Phase 5) | Could be either — I can draft, you'd want to review India-market accuracy and publish |

---

## 6. Immediate next step

Say which to start first:
1. **Phase 1** — I start rewriting the 6 Critical PDF tools (OCR PDF first, since
   it's the most-searched and most broken).
2. **Phase 3** — confirm Search Console/sitemap submission status so we know
   what's actually indexed right now.
3. Both in parallel — I do Phase 1 while you handle Phase 3.
