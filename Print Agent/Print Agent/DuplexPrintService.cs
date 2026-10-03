using PDFtoImage;
using SkiaSharp;
using System.Drawing.Imaging;
using System.Drawing.Printing;

namespace Print_Agent;

/// Double-side printing for PDF jobs. Deliberately self-contained (its own
/// PrintDocument and page renderer), like QrPrintService - it does not call
/// or change PrintPdf/PdfPrintPage in Form1.cs, so single-side jobs keep the
/// exact path that is already confirmed working.
internal static class DuplexPrintService
{
    public const string ModeAuto = "auto";
    public const string ModeManual = "manual";

    /// Anything other than "manual" (including empty/garbled values) means
    /// Auto, matching the Setup card's default.
    public static string NormalizeMode(string? mode)
    {
        return string.Equals(mode?.Trim(), ModeManual, StringComparison.OrdinalIgnoreCase) ? ModeManual : ModeAuto;
    }

    public static bool CanDuplex(string printerName)
    {
        try
        {
            return new PrinterSettings { PrinterName = printerName }.CanDuplex;
        }
        catch
        {
            return false;
        }
    }

    internal sealed record Result(int CopiesPrinted, bool BackSkipped);

    /// Prints the whole PDF double-sided. Throws if the printer rejects a
    /// pass (the caller reports the job as failed) - never falls back to
    /// another printer. Manual mode asks `askFlipBack` between the passes;
    /// false means the owner chose to skip the back side, which stops the
    /// remaining copies too.
    public static Result Print(
        string filePath,
        string printerName,
        PrintColorMode colorMode,
        string paperSize,
        int copies,
        string mode,
        string edge,
        Func<bool> askFlipBack)
    {
        if (string.IsNullOrWhiteSpace(printerName))
        {
            throw new InvalidOperationException("Duplex printer is not set.");
        }

        var pdfBytes = File.ReadAllBytes(filePath);
        var pageCount = Conversion.GetPageCount(pdfBytes);
        copies = Math.Max(copies, 1);
        var longEdge = !string.Equals(edge?.Trim(), "short", StringComparison.OrdinalIgnoreCase);
        var printed = 0;

        if (NormalizeMode(mode) == ModeAuto)
        {
            var all = Enumerable.Range(0, pageCount).ToList();
            for (var copy = 0; copy < copies; copy++)
            {
                PrintPass(pdfBytes, all, printerName, colorMode, paperSize, longEdge ? Duplex.Vertical : Duplex.Horizontal);
                printed++;
            }
            return new Result(printed, false);
        }

        var odd = Enumerable.Range(0, pageCount).Where(i => i % 2 == 0).ToList();   // pages 1,3,5...
        var even = Enumerable.Range(0, pageCount).Where(i => i % 2 == 1).ToList();  // pages 2,4,6...
        for (var copy = 0; copy < copies; copy++)
        {
            PrintPass(pdfBytes, odd, printerName, colorMode, paperSize, Duplex.Simplex);
            if (even.Count > 0)
            {
                if (!askFlipBack())
                {
                    return new Result(printed + 1, true);
                }
                PrintPass(pdfBytes, even, printerName, colorMode, paperSize, Duplex.Simplex);
            }
            printed++;
        }
        return new Result(printed, false);
    }

    private static void PrintPass(byte[] pdfBytes, IReadOnlyList<int> pageIndexes, string printerName, PrintColorMode colorMode, string paperSize, Duplex duplex)
    {
        using var document = new PrintDocument();
        document.PrinterSettings.PrinterName = printerName;
        if (!document.PrinterSettings.IsValid)
        {
            throw new InvalidOperationException($"Printer not valid: {printerName}");
        }

        document.PrinterSettings.Duplex = duplex;
        document.DefaultPageSettings.Landscape = false;
        document.DefaultPageSettings.Margins = new Margins(0, 0, 0, 0);
        document.DefaultPageSettings.Color = colorMode == PrintColorMode.Color;
        foreach (PaperSize size in document.PrinterSettings.PaperSizes)
        {
            if (size.PaperName.Equals(paperSize, StringComparison.OrdinalIgnoreCase))
            {
                document.DefaultPageSettings.PaperSize = size;
                break;
            }
        }

        var position = 0;
        document.PrintPage += (_, e) =>
        {
            if (e.Graphics is null) return;

            var bounds = e.MarginBounds;
            var dpi = e.Graphics.DpiX > 0 ? e.Graphics.DpiX : 96f;
            using var skBitmap = Conversion.ToImage(pdfBytes, pageIndexes[position], options: new RenderOptions(Dpi: (int)dpi, WithAnnotations: true));
            using var gdiBitmap = new Bitmap(skBitmap.Width, skBitmap.Height, skBitmap.RowBytes, PixelFormat.Format32bppArgb, skBitmap.GetPixels());
            using var gray = colorMode == PrintColorMode.BlackWhite ? ToGrayscale(gdiBitmap) : null;
            var toPrint = gray ?? gdiBitmap;

            var ratio = Math.Min((float)bounds.Width / toPrint.Width, (float)bounds.Height / toPrint.Height);
            var w = (int)(toPrint.Width * ratio);
            var h = (int)(toPrint.Height * ratio);
            e.Graphics.DrawImage(toPrint, bounds.X + (bounds.Width - w) / 2, bounds.Y + (bounds.Height - h) / 2, w, h);

            position++;
            e.HasMorePages = position < pageIndexes.Count;
        };

        document.Print();
    }

    private static Bitmap ToGrayscale(Bitmap original)
    {
        var gray = new Bitmap(original.Width, original.Height);
        using var graphics = Graphics.FromImage(gray);
        var matrix = new ColorMatrix([
            [0.299f, 0.299f, 0.299f, 0, 0],
            [0.587f, 0.587f, 0.587f, 0, 0],
            [0.114f, 0.114f, 0.114f, 0, 0],
            [0, 0, 0, 1, 0],
            [0, 0, 0, 0, 1],
        ]);
        using var attributes = new ImageAttributes();
        attributes.SetColorMatrix(matrix);
        graphics.DrawImage(original, new Rectangle(0, 0, gray.Width, gray.Height), 0, 0, original.Width, original.Height, GraphicsUnit.Pixel, attributes);
        return gray;
    }
}
