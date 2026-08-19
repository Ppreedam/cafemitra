# Biodata Maker — Feature List

_Reflects the actual `biodata-maker` implementation in `cafemitra_client` + `cafemitra_server` as of 2026-08-19. Split into what's shipped vs. what's proposed, since the two need separate SEO copy._

## Current Features (Implemented)

### Builder Experience
- 3 templates: Classic (matrimonial), Modern (matrimonial, colored header band), Simple (general-purpose, non-matrimonial)
- Template gallery — browse each template pre-filled with sample content before committing
- Switch template anytime while editing; entered content carries over
- Fields adapt automatically to template: matrimonial-only fields (marital status, height, complexion, gotra, rashi/nakshatra, annual income, family details, hobbies) are hidden when the Simple template is selected
- Local draft auto-persistence in browser storage while editing

### Biodata Sections
- Personal details: photo, full name, date of birth, gender, religion, caste
- Matrimonial-only: marital status, height, complexion, gotra, rashi/nakshatra
- Education & occupation, with annual income for matrimonial
- Family details (matrimonial only): father's name & occupation, mother's name & occupation, siblings
- Contact details: phone, email, native place, current address, permanent address
- Hobbies & interests (matrimonial only)

### Photo Tools
- Photo upload with an in-browser crop tool
- Auto-formatted to a square photo on save

### PDF Output
- Watermarked PDF preview before payment
- Clean, final PDF download after payment

### Account & Storage
- Save a biodata to the shop's account; reopen or delete later from a saved-list view
- Multiple saved biodatas per account

### Walk-in Customer & Payment Flow (shop-owner dashboard)
- "Charge a customer" toggle to bill a walk-in customer for a build
- Cash or online payment mode per order
- Razorpay online checkout integration
- Cash orders marked paid by staff from the Orders screen; download unlocks once paid
- Per-template pricing, configurable per shop (free by default until a price is set)

### Public Self-Service Kiosk (QR / shareable link)
- Shareable public link (`/s/{shop-code}/biodata-maker`) customers can open on their own phone/device
- Guided flow: pick a template (seeing sample content) → fill own details → pay → download
- Live payment status refresh while waiting on cash confirmation

## Suggested Features (Not Yet Built)

### More Matrimonial Depth
- Full horoscope/kundli block (birth time & place, manglik status) — currently only rashi/nakshatra as free text
- Partner preference section
- Community/religion-specific decorative templates (Hindu, Muslim, Sikh, Christian, Jain — currently 3 generic templates only)
- Multiple photo slots (individual + family photo)

### Job/Government-Form Biodata Format
- Tabular biodata layout for govt/teaching/panchayat-style forms (year-wise education table, declaration statement, signature field) — distinct from the current matrimonial-style Simple template

### Content Assistance
- AI-suggested hobby/interest phrasing
- Grammar & spell check
- Formal/traditional tone adjustment

### Import / Export
- Import details from an existing biodata (PDF/DOCX or photo via OCR)
- Export to DOCX and PNG/JPEG (currently PDF-only)
- WhatsApp-optimized single-image export for easy sharing on matrimonial groups

### Personalization
- Multi-language content and fonts (Hindi/Devanagari, regional scripts)
- Custom color/border theme per template

### Sharing & Review
- Share finished PDF directly via WhatsApp/Email from the app
- Family member review/comment before finalizing
- View/download analytics on a shared link

### Additional Utilities
- Kundli/horoscope matching integration (optional add-on)
- Sample biodata gallery by community/religion for reference
- Family biodata bundle (build for multiple relatives in one session)

### SEO / Content Angle Ideas (for landing page copy)
- "Free Marriage Biodata Maker Online — Hindu, Traditional & Simple Formats"
- "Create Shaadi Biodata in Minutes, Download as PDF"
- "Print-Ready Biodata at Your Nearest Cyber Cafe"
- "No Sign-up Needed — Build, Pay, Download"
- Target keywords: biodata maker online, marriage biodata format, shaadi biodata pdf, matrimonial biodata template, cyber cafe biodata print
