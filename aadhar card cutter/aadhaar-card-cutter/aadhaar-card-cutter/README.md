# Aadhaar Card Cutter

Browser-only tool that turns a UIDAI e-Aadhaar letter PDF (password protected or not) into a print-ready card PDF.
Nothing is uploaded; all processing happens in the browser.

## Features
- Password popup for encrypted e-Aadhaar PDFs (AES-256, AES-128, RC4)
- Crops the front and back of the card, keeping real searchable, selectable text
- Photo clean-up popup: brightness, contrast, sharpness, auto-fix
- Front text size and line spacing (name, DOB, gender in Hindi and English)
- Back address size and line spacing; long lines wrap at word gaps so they never reach the QR code (QR size stays fixed)
- Bold option for front details and back address
- Adds "Mobile No.: XXXXXXXXXX" below gender (auto-read from the letter, editable)
- Option to remove the "Aadhaar is proof of identity" info box
- Downloads: 2-page card PDF, A4 sheet, 4x6 sheet (cards at CR80 size 85.6 x 54 mm, optional cut lines)

## Run
Open `index.html` in a browser, or serve the folder:

    npx serve .
    # or
    python3 -m http.server 8080

Libraries load from CDNs:
- @cantoo/pdf-lib 2.11.1 (pdf-lib fork with password decryption)
- pdf.js 3.11.174 (text positions, mobile number, preview rendering)

## Files
- `index.html` – markup, password and photo dialogs
- `src/styles.css` – styles (light and dark theme)
- `src/aadhaar-core.js` – PDF engine: content-stream tokenizer, layout detection, text scaling/wrapping, bold, image swap/removal, card and sheet builders. Works in Node too (`module.exports`).
- `src/app.js` – UI wiring, photo editor, downloads
- `test/node-test.js` – Node smoke test that writes sample outputs

## How the text editing works
The e-Aadhaar content stream draws each word run in its own BT/ET block with a `Tm` at the line origin and `Td` offsets.
The core parses the stream, finds the lines in the front and back card regions by position, and rewrites only the `Tm`
matrices (scale + new origin), so glyphs stay the original embedded fonts. Wrapping moves whole blocks to a new line
at word gaps detected from pdf.js text items. Bold uses text render mode 2 (fill + thin stroke) wrapped in q/Q.

## Limits
- Tuned for the current UIDAI e-Aadhaar layout (612 x 792 pt page). Other layouts show a warning and disable text options.
- The UIDAI digital signature does not survive any crop or edit.
- Cropping hides, but does not delete, the rest of the letter inside the PDF.
