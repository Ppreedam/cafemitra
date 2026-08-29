# Resume Builder — Feature List

_Reflects the actual `resume-builder` implementation in `cafemitra_client` + `cafemitra_server` as of 2026-08-19. Split into what's shipped vs. what's proposed, since the two need separate SEO copy._

## Current Features (Implemented)

### Builder Experience
- 9 templates: Classic, Modern, Minimal, Elegant, Bold, Sidebar Photo, Sidebar Photo (Right), ATS-Ultra, Timeline
- Template gallery — browse each template pre-filled with sample content before committing
- Switch template anytime while editing; entered content carries over
- Local draft auto-persistence in browser storage while editing

### Resume Sections
- Personal details: photo, full name, role, email, phone, location, LinkedIn, website
- Professional summary and skills (free text)
- Work experience — multiple entries, "currently working here" toggle, bullet points per role
- Education — multiple entries (degree, school, dates, score)
- Projects — multiple entries (name, tech stack, description, link)
- Certifications — multiple entries (name, issuer, year)
- Add/remove/reorder items within each repeatable section

### Photo Tools
- Photo upload with an in-browser crop tool
- Auto-formatted to a square photo on save

### PDF Output
- Watermarked PDF preview before payment
- Clean, final PDF download after payment

### Account & Storage
- Save a resume to the shop's account; reopen or delete later from a saved-list view
- Multiple saved resumes per account

### Walk-in Customer & Payment Flow (shop-owner dashboard)
- "Charge a customer" toggle to bill a walk-in customer for a build
- Cash or online payment mode per order
- Razorpay online checkout integration
- Cash orders marked paid by staff from the Orders screen; download unlocks once paid
- Per-template pricing, configurable per shop (free by default until a price is set)

### Public Self-Service Kiosk (QR / shareable link)
- Shareable public link (`/s/{shop-code}/resume-builder`) customers can open on their own phone/device
- Guided flow: pick a template (seeing sample content) → fill own details → pay → download
- Live payment status refresh while waiting on cash confirmation

## Suggested Features (Not Yet Built)

### Content Assistance
- AI-generated professional summary / objective
- AI bullet-point rewriter (stronger action verbs, quantified impact)
- Grammar & spell check
- AI-suggested skills based on job title/industry

### ATS Tools
- ATS-compatibility score/checker (beyond the existing "ATS-Ultra" plain-design template)
- Resume vs. job-description keyword match analysis

### Import / Export
- Import existing resume from PDF/DOCX or a LinkedIn profile
- Export to DOCX and PNG/JPEG (currently PDF-only)
- View-only public web resume link (separate from the payment/kiosk link)
- QR code generator for a finished resume

### Personalization
- Industry-specific template recommendations (IT, healthcare, teaching, government)
- Fresher vs. experienced template variants
- Custom color theme per template (currently fixed per-template accent colors)
- Multi-language content support (Hindi, regional languages)

### Sharing & Review
- Share finished PDF directly via WhatsApp/Email from the app
- Mentor/friend feedback or comment mode on a draft
- View/download analytics on a shared link

### Additional Utilities
- Matching cover letter builder
- LinkedIn "About" section generator from resume content
- Resume health-check (length, readability, formatting warnings)
- Job application tracker linked to saved resumes

### SEO / Content Angle Ideas (for landing page copy)
- "Free Resume Builder Online — Pick a Template, Fill Details, Download PDF"
- "9 Resume Templates Including an ATS-Safe Design"
- "Print-Ready Resume in Minutes at Your Nearest Cyber Cafe"
- "No Sign-up Needed — Build, Pay, Download"
- Target keywords: resume builder online, resume maker near me, ATS resume template, cyber cafe resume print, CV maker India
