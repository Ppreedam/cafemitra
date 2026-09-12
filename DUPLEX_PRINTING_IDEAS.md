# Duplex / Double-Tray Printer Support — Idea Notes

_Status: discussion only, not implemented. Captured 2026-09-12 so the
context isn't lost before this gets picked up._

## What this is

A duplex printer prints both sides of the paper automatically (no manual
flip). A double-tray printer additionally has two separate paper trays,
which can hold different sizes/types of paper (e.g. A4 in one, letterhead
in the other) without swapping paper between jobs.

Today's Print Agent has no concept of either - printer presets are just
**Paper Size + Color Mode → Printer** (see `dataGridPrinterSetting` /
`FindMatchingPrinter` in `Print Agent/Print Agent/Form1.cs`, and the
matching `/printer-presets` API the website's Printer Settings section
talks to).

## The one big open question — decide this first

**Who chooses duplex: the shop, or the customer per order?**

- **(A) Shop-level fixed setting** — same shape as the existing Color/
  Grayscale preset: the shop picks it once in Printer Setup, every
  matching job prints that way. Small scope: one new field on the preset
  (agent grid + website Printer Settings UI + the shared `/printer-presets`
  payload), no order-flow or pricing changes.
- **(B) Customer-choice per order** — like a pricing option (single-sided
  vs double-sided) picked at order time, similar to Color vs B&W selection
  in the print flow. Bigger scope: touches `PrintOrder`, pricing/wallet
  calculations, and the customer-facing order UI, not just the agent.

Everything below assumes (A) unless (B) is explicitly chosen later - (B)
needs its own design pass on top of this.

## Config/feature list (assuming shop-level presets, option A)

1. **Duplex mode per preset** - `Off` / `Long-edge flip` (book-style,
   most common) / `Short-edge flip` (flip-chart/calendar style). Maps
   directly to `System.Drawing.Printing.PrinterSettings.Duplex`
   (`Duplex.Simplex` / `Duplex.Vertical` / `Duplex.Horizontal`) - .NET
   already models this, so applying it is cheap once the preset UI/storage
   has the field.
2. **Tray selection** (only worth adding if actually needed) -
   `PrinterSettings.PaperSources` exposes available trays. Most printers
   already auto-pick the right tray based on requested paper size, so an
   explicit tray setting mainly matters when two trays hold the *same*
   size but different paper (e.g. letterhead vs plain A4), or to override
   auto-selection.
3. **Fallback when the matched printer can't duplex** -
   `PrinterSettings.CanDuplex` is `false` for virtually all built-in
   virtual printers (Print to PDF, XPS Writer) and any real printer
   without the hardware. Recommendation: fall back to simplex and log it,
   **not** a hard block/popup like the offline/jam/wrong-printer alerts -
   paper still comes out, just single-sided, which is a much smaller
   problem than "nothing printed."
4. **Pricing** (business decision, not code) - if duplex halves paper
   usage, should per-page pricing reflect that? Needs a product-owner
   call, not something to assume in the agent.

## How to test without a real duplex printer

Two different things, two different answers:

- **Code logic** (doesn't crash, detects no-duplex-support correctly,
  falls back to simplex, preset saves/loads right) - testable today with
  a virtual printer ("Microsoft Print to PDF" always reports
  `CanDuplex = false`, so it's a ready-made test of the fallback path).
- **Actual physical double-sided output being correct** (page order, flip
  orientation) - genuinely needs real hardware; no virtual printer can
  simulate this.
- **Middle ground**: Windows lets you add a printer via "Add a local
  printer" with a duplex-capable manufacturer driver pointed at a dummy
  port (e.g. `FILE:`), with no physical device attached.
  `PrinterSettings.CanDuplex` reflects driver capability, not physical
  connection, so this reports `true` and lets the "duplex IS supported"
  code path (not just the fallback path) be exercised locally too - still
  doesn't confirm real paper output, but covers both branches of the
  logic before it ever reaches a real printer.
