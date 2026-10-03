using PDFtoImage;
using System.Drawing.Imaging;
using System.Drawing.Printing;

namespace Print_Agent;

/// Prints a ready-made PDF from the website's tools (photo sheet, ID card,
/// resume...) with a print profile: the profile's printer and its saved
/// driver preferences (paper size, paper type, quality...). Self-contained
/// like DuplexPrintService, so the order-queue print path is untouched.
internal static class ProfilePrintService
{
    public static int Print(byte[] pdfBytes, PrintProfile profile, int copies)
    {
        var pageCount = Conversion.GetPageCount(pdfBytes);
        if (pageCount <= 0) throw new InvalidOperationException("The file has no pages to print.");

        copies = Math.Clamp(copies, 1, 50);
        for (var copy = 0; copy < copies; copy++)
        {
            PrintOnce(pdfBytes, pageCount, profile);
        }
        return pageCount;
    }

    private static void PrintOnce(byte[] pdfBytes, int pageCount, PrintProfile profile)
    {
        using var document = new PrintDocument();
        PrinterDevMode.Apply(document, profile);
        if (!document.PrinterSettings.IsValid)
        {
            throw new InvalidOperationException($"Printer \"{profile.Printer}\" is not installed on this PC.");
        }
        document.DefaultPageSettings.Margins = new Margins(0, 0, 0, 0);
        document.DocumentName = $"PrintPilot - {profile.Name}";

        var position = 0;
        document.PrintPage += (_, e) =>
        {
            if (e.Graphics is null) return;

            var bounds = e.MarginBounds;
            var renderDpi = (int)Math.Min(e.Graphics.DpiX > 0 ? e.Graphics.DpiX : 300f, 600);
            using var skBitmap = Conversion.ToImage(pdfBytes, position, options: new RenderOptions(Dpi: renderDpi, WithAnnotations: true));
            using var bitmap = new Bitmap(skBitmap.Width, skBitmap.Height, skBitmap.RowBytes, PixelFormat.Format32bppArgb, skBitmap.GetPixels());

            // Actual size (page units are 1/100 inch), shrunk only when the
            // PDF page is bigger than the paper - an ID card on A4 stays
            // card-sized instead of being blown up to fill the sheet.
            var naturalW = bitmap.Width * 100f / renderDpi;
            var naturalH = bitmap.Height * 100f / renderDpi;

            // A page that doesn't fit as-is and has the other orientation
            // (landscape card on portrait card stock, ...) is turned rather
            // than shrunk to a strip.
            var fits = naturalW <= bounds.Width * 1.02f && naturalH <= bounds.Height * 1.02f;
            var turn = !fits && (naturalW > naturalH) != (bounds.Width > bounds.Height);
            using var rotated = turn ? (Bitmap)bitmap.Clone() : null;
            rotated?.RotateFlip(RotateFlipType.Rotate90FlipNone);
            var toPrint = rotated ?? bitmap;
            if (turn) (naturalW, naturalH) = (naturalH, naturalW);
            var ratio = Math.Min(1f, Math.Min(bounds.Width / naturalW, bounds.Height / naturalH));
            var w = (int)(naturalW * ratio);
            var h = (int)(naturalH * ratio);
            e.Graphics.DrawImage(toPrint, bounds.X + (bounds.Width - w) / 2, bounds.Y + (bounds.Height - h) / 2, w, h);

            position++;
            e.HasMorePages = position < pageCount;
        };

        document.Print();
    }
}
