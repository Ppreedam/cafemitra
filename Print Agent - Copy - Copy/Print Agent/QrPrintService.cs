using System.Drawing.Imaging;
using System.Drawing.Printing;

namespace Print_Agent;

/// Prints the "Test Print" / QR poster pages the website's PrintPilot Setup
/// wizard asks for. Deliberately self-contained (its own PrintDocument, own
/// grayscale conversion) - it does not call or modify PrintPdf/PrintImage or
/// any of the PDF rendering in Form1.cs.
internal static class QrPrintService
{
    public static string PrintQrTestPage(string printerName, string shopName, string shopCode, string qrUrl, string qrImage, PrintColorMode colorMode)
    {
        return PrintQrPage(
            printerName, shopName, shopCode, qrUrl, qrImage, colorMode,
            $"CafeMitra PrintAgent Test - {shopCode}",
            "CafeMitra PrintAgent Test Page",
            includePrinterLine: true,
            successMessage: $"QR test page sent to {printerName} ({colorMode.ToLabel()})."
        );
    }

    public static string PrintQrPoster(string printerName, string shopName, string shopCode, string qrUrl, string qrImage, PrintColorMode colorMode)
    {
        return PrintQrPage(
            printerName, shopName, shopCode, qrUrl, qrImage, colorMode,
            $"CafeMitra QR Poster - {shopCode}",
            "Scan to upload print documents",
            includePrinterLine: false,
            successMessage: $"QR poster sent to {printerName} ({colorMode.ToLabel()})."
        );
    }

    private static string PrintQrPage(string printerName, string shopName, string shopCode, string qrUrl, string qrImage, PrintColorMode colorMode, string documentName, string subtitle, bool includePrinterLine, string successMessage)
    {
        if (string.IsNullOrWhiteSpace(printerName))
        {
            throw new InvalidOperationException("Printer name is required.");
        }

        using var document = new PrintDocument();
        document.PrinterSettings.PrinterName = printerName;
        document.DocumentName = documentName;
        document.DefaultPageSettings.Color = colorMode == PrintColorMode.Color;

        document.PrintPage += (_, eventArgs) =>
        {
            if (eventArgs.Graphics is null) return;

            var bounds = eventArgs.MarginBounds;
            eventArgs.Graphics.FillRectangle(Brushes.White, eventArgs.PageBounds);
            using var titleFont = new Font("Arial", 24, FontStyle.Bold);
            using var subtitleFont = new Font("Arial", 12, FontStyle.Bold);
            using var bodyFont = new Font("Arial", 10, FontStyle.Regular);
            using var smallFont = new Font("Arial", 8, FontStyle.Regular);
            using var brandBrush = new SolidBrush(GrayscaleSafe(Color.FromArgb(13, 23, 72), colorMode));
            using var accentBrush = new SolidBrush(GrayscaleSafe(Color.FromArgb(87, 64, 237), colorMode));
            using var mutedBrush = new SolidBrush(GrayscaleSafe(Color.FromArgb(89, 101, 140), colorMode));
            using var borderPen = new Pen(GrayscaleSafe(Color.FromArgb(214, 221, 236), colorMode), 2);

            var y = bounds.Top;
            DrawCentered(eventArgs.Graphics, shopName, titleFont, brandBrush, bounds.Left, bounds.Width, y);
            y += 42;
            DrawCentered(eventArgs.Graphics, subtitle, subtitleFont, mutedBrush, bounds.Left, bounds.Width, y);
            y += 36;

            var qrSize = Math.Min(320, Math.Min(bounds.Width - 80, bounds.Height - 250));
            var qrX = bounds.Left + (bounds.Width - qrSize) / 2;
            using var qrBitmap = DecodeDataUrlImage(qrImage, colorMode);
            eventArgs.Graphics.DrawRectangle(borderPen, qrX - 12, y - 12, qrSize + 24, qrSize + 24);
            if (qrBitmap is not null)
            {
                eventArgs.Graphics.DrawImage(qrBitmap, qrX, y, qrSize, qrSize);
            }
            else
            {
                DrawCentered(eventArgs.Graphics, "QR not available", subtitleFont, accentBrush, qrX, qrSize, y + (qrSize / 2) - 10);
            }

            y += qrSize + 38;
            DrawCentered(eventArgs.Graphics, string.IsNullOrWhiteSpace(shopCode) ? "CafeMitra" : shopCode, subtitleFont, accentBrush, bounds.Left, bounds.Width, y);
            y += 28;
            DrawCentered(eventArgs.Graphics, qrUrl, bodyFont, brandBrush, bounds.Left, bounds.Width, y);
            y += 32;
            DrawCentered(eventArgs.Graphics, includePrinterLine ? $"Printer: {printerName} ({colorMode.ToLabel()})" : "", smallFont, mutedBrush, bounds.Left, bounds.Width, y);
            y += 18;
            DrawCentered(eventArgs.Graphics, $"Printed: {DateTime.Now:dd MMM yyyy hh:mm tt}", smallFont, mutedBrush, bounds.Left, bounds.Width, y);
            eventArgs.HasMorePages = false;
        };

        document.Print();
        return successMessage;
    }

    private static Image? DecodeDataUrlImage(string dataUrl, PrintColorMode colorMode)
    {
        if (string.IsNullOrWhiteSpace(dataUrl))
        {
            return null;
        }

        var commaIndex = dataUrl.IndexOf(',');
        var base64 = commaIndex >= 0 ? dataUrl[(commaIndex + 1)..] : dataUrl;
        var bytes = Convert.FromBase64String(base64);
        using var decoded = Image.FromStream(new MemoryStream(bytes));
        return colorMode == PrintColorMode.BlackWhite ? ConvertToGrayscale(decoded) : new Bitmap(decoded);
    }

    private static Bitmap ConvertToGrayscale(Image original)
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

    private static Color GrayscaleSafe(Color color, PrintColorMode colorMode)
    {
        if (colorMode != PrintColorMode.BlackWhite)
        {
            return color;
        }

        var luminance = (byte)(0.299 * color.R + 0.587 * color.G + 0.114 * color.B);
        return Color.FromArgb(color.A, luminance, luminance, luminance);
    }

    private static void DrawCentered(Graphics graphics, string text, Font font, Brush brush, int x, int width, int y)
    {
        if (string.IsNullOrEmpty(text)) return;
        var rect = new RectangleF(x, y, width, font.GetHeight(graphics) + 8);
        using var format = new StringFormat { Alignment = StringAlignment.Center, LineAlignment = StringAlignment.Center };
        graphics.DrawString(text, font, brush, rect, format);
    }
}
