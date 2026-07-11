using System.Diagnostics;
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Printing;
using System.Runtime.InteropServices;
using PDFtoImage;
using SkiaSharp;

namespace PrintPilotAgent;

internal static class PrinterService
{
    [DllImport("shell32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern nint ShellExecuteW(
        nint hwnd,
        string lpOperation,
        string lpFile,
        string lpParameters,
        string lpDirectory,
        int nShowCmd
    );

    public static IReadOnlyList<string> ListPrinters()
    {
        if (!OperatingSystem.IsWindows())
        {
            return [];
        }

        var startInfo = new ProcessStartInfo
        {
            FileName = "powershell.exe",
            Arguments = "-NoProfile -Command \"Get-Printer | Select-Object -ExpandProperty Name\"",
            UseShellExecute = false,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            CreateNoWindow = true,
        };

        using var process = Process.Start(startInfo);
        if (process is null)
        {
            return [];
        }

        var output = process.StandardOutput.ReadToEnd();
        process.WaitForExit(10000);
        return output
            .Split(Environment.NewLine, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(name => !string.IsNullOrWhiteSpace(name))
            .ToArray();
    }

    private static readonly string[] RenderableImageExtensions = [".jpg", ".jpeg", ".png", ".bmp"];

    /// Prints a job. PDFs and images are rendered and (for black &amp; white
    /// jobs) desaturated by this app itself before being handed to the
    /// printer - this guarantees correct B/W output even on the many
    /// consumer drivers that silently ignore a queue-level color toggle
    /// (Set-PrintConfiguration, used below only as a last-resort fallback
    /// for file types we can't render ourselves, is well known to be a
    /// no-op on such drivers).
    public static string PrintFile(string filePath, string printerName, PrintJob job, Func<PrintJob, string, string> choosePdfOutputPath)
    {
        if (!OperatingSystem.IsWindows())
        {
            throw new PlatformNotSupportedException("Printing is supported only on Windows.");
        }

        if (!File.Exists(filePath))
        {
            throw new FileNotFoundException("Print file not found.", filePath);
        }

        if (string.IsNullOrWhiteSpace(printerName))
        {
            throw new InvalidOperationException("Printer name is required.");
        }

        if (printerName.Equals("Microsoft Print to PDF", StringComparison.OrdinalIgnoreCase))
        {
            var output = choosePdfOutputPath(job, filePath);
            if (string.IsNullOrWhiteSpace(output))
            {
                throw new InvalidOperationException("Microsoft Print to PDF save cancelled.");
            }
            File.Copy(filePath, output, overwrite: true);
            return $"Test print saved for Microsoft Print to PDF ({job.PrintColorModeLabel}): {output}";
        }

        var extension = Path.GetExtension(filePath).ToLowerInvariant();
        if (extension == ".pdf")
        {
            return PrintPdfDocument(filePath, printerName, job);
        }

        if (RenderableImageExtensions.Contains(extension))
        {
            return PrintImageDocument(filePath, printerName, job);
        }

        return PrintViaShellFallback(filePath, printerName, job);
    }

    /// Renders every PDF page with pdfium's native grayscale mode (for B/W
    /// jobs) or full color, then prints the rendered pages directly - no
    /// dependency on the printer driver honoring a color switch.
    private static string PrintPdfDocument(string filePath, string printerName, PrintJob job)
    {
        var pdfBytes = File.ReadAllBytes(filePath);
        var options = new RenderOptions(Dpi: 200, WithAspectRatio: true, Grayscale: job.PrintColorMode == PrintColorMode.BlackWhite);

        var pages = new List<Bitmap>();
        foreach (var pageBitmap in Conversion.ToImages(pdfBytes, options: options))
        {
            using (pageBitmap)
            {
                pages.Add(ToGdiBitmap(pageBitmap));
            }
        }

        return PrintBitmapPages(pages, printerName, job, $"PrintPilot Job - {job.TokenId}");
    }

    /// Loads the image and, for B/W jobs, desaturates it in software (a
    /// ColorMatrix grayscale conversion) before printing - same guarantee as
    /// the PDF path above.
    private static string PrintImageDocument(string filePath, string printerName, PrintJob job)
    {
        using var original = Image.FromFile(filePath);
        var page = job.PrintColorMode == PrintColorMode.BlackWhite
            ? ConvertToGrayscale(original)
            : new Bitmap(original);

        return PrintBitmapPages([page], printerName, job, $"PrintPilot Job - {job.TokenId}");
    }

    /// Last-resort path for file types we don't render ourselves (e.g.
    /// .docx) - hands off to Windows' default handler for the file type via
    /// the "printto" verb. Color mode here is only as reliable as the
    /// printer driver's own Set-PrintConfiguration support.
    private static string PrintViaShellFallback(string filePath, string printerName, PrintJob job)
    {
        var colorResult = ApplyColorMode(printerName, job.PrintColorMode);
        var copies = Math.Max(job.Copies, 1);
        for (var copy = 1; copy <= copies; copy++)
        {
            var result = ShellExecuteW(
                nint.Zero,
                "printto",
                filePath,
                $"\"{printerName}\"",
                Path.GetDirectoryName(filePath) ?? "",
                0
            );

            if (result <= 32)
            {
                throw new InvalidOperationException($"Windows print command failed for copy {copy} of {copies}. ShellExecute code: {result}.");
            }
        }

        return $"Sent to {printerName} as {job.PrintColorModeLabel}, {copies} cop{(copies == 1 ? "y" : "ies")} (color accuracy not guaranteed for this file type). {colorResult}";
    }

    private static Bitmap ToGdiBitmap(SKBitmap skBitmap)
    {
        using var image = SKImage.FromBitmap(skBitmap);
        using var data = image.Encode(SKEncodedImageFormat.Png, 100);
        using var stream = new MemoryStream(data.ToArray());
        using var loaded = new Bitmap(stream);
        return new Bitmap(loaded);
    }

    /// Prints already-rendered pages via a self-owned PrintDocument, so
    /// paper size and copy count are set by this app rather than whatever
    /// the file's default handler happens to use.
    private static string PrintBitmapPages(IReadOnlyList<Bitmap> pages, string printerName, PrintJob job, string documentName)
    {
        if (pages.Count == 0)
        {
            throw new InvalidOperationException("Rendered document had no pages to print.");
        }

        try
        {
            using var document = new PrintDocument();
            document.PrinterSettings.PrinterName = printerName;
            document.DocumentName = documentName;
            document.PrinterSettings.Copies = (short)Math.Max(job.Copies, 1);
            document.DefaultPageSettings.Margins = new Margins(0, 0, 0, 0);
            // The real fix: this is the standard DEVMODE monochrome hint
            // (dmColor) that GDI printing sends to the driver - it's what
            // actually keeps the color ink/toner engine off, on top of the
            // pixels themselves already being desaturated above.
            document.DefaultPageSettings.Color = job.PrintColorMode == PrintColorMode.Color;
            ApplyPaperSize(document, "A4");

            var pageIndex = 0;
            document.PrintPage += (_, eventArgs) =>
            {
                if (eventArgs.Graphics is null) return;

                var bitmap = pages[pageIndex];
                var bounds = eventArgs.MarginBounds;
                var ratio = Math.Min((float)bounds.Width / bitmap.Width, (float)bounds.Height / bitmap.Height);
                var width = (int)(bitmap.Width * ratio);
                var height = (int)(bitmap.Height * ratio);
                var x = bounds.X + (bounds.Width - width) / 2;
                var y = bounds.Y + (bounds.Height - height) / 2;
                eventArgs.Graphics.DrawImage(bitmap, x, y, width, height);

                pageIndex++;
                eventArgs.HasMorePages = pageIndex < pages.Count;
            };

            document.Print();

            return $"Sent to {printerName} as {job.PrintColorModeLabel}, {document.PrinterSettings.Copies} cop{(document.PrinterSettings.Copies == 1 ? "y" : "ies")}, {pages.Count} page(s).";
        }
        finally
        {
            foreach (var bitmap in pages)
            {
                bitmap.Dispose();
            }
        }
    }

    /// Matches the printer's own supported paper size by name (so it prints
    /// at the driver's true A4 dimensions) and only falls back to a manual
    /// size if the driver doesn't expose one under that name.
    private static void ApplyPaperSize(PrintDocument document, string paperName)
    {
        foreach (PaperSize size in document.PrinterSettings.PaperSizes)
        {
            if (size.PaperName.Equals(paperName, StringComparison.OrdinalIgnoreCase))
            {
                document.DefaultPageSettings.PaperSize = size;
                return;
            }
        }

        if (paperName.Equals("A4", StringComparison.OrdinalIgnoreCase))
        {
            document.DefaultPageSettings.PaperSize = new PaperSize("A4", 827, 1169);
        }
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

    public static string PrintQrTestPage(string printerName, string shopName, string shopCode, string qrUrl, string qrImage, PrintColorMode colorMode)
    {
        return PrintQrPage(
            printerName,
            shopName,
            shopCode,
            qrUrl,
            qrImage,
            colorMode,
            $"CafeMitra PrintPilot Test - {shopCode}",
            "CafeMitra PrintPilot Test Page",
            includePrinterLine: true,
            successMessage: $"QR test page sent to {printerName} ({colorMode.ToLabel()})."
        );
    }

    public static string PrintQrPoster(string printerName, string shopName, string shopCode, string qrUrl, string qrImage, PrintColorMode colorMode)
    {
        return PrintQrPage(
            printerName,
            shopName,
            shopCode,
            qrUrl,
            qrImage,
            colorMode,
            $"CafeMitra QR Poster - {shopCode}",
            "Scan to upload print documents",
            includePrinterLine: false,
            successMessage: $"QR poster sent to {printerName} ({colorMode.ToLabel()})."
        );
    }

    private static string PrintQrPage(string printerName, string shopName, string shopCode, string qrUrl, string qrImage, PrintColorMode colorMode, string documentName, string subtitle, bool includePrinterLine, string successMessage)
    {
        if (!OperatingSystem.IsWindows())
        {
            throw new PlatformNotSupportedException("Printing is supported only on Windows.");
        }

        if (string.IsNullOrWhiteSpace(printerName))
        {
            throw new InvalidOperationException("Printer name is required.");
        }

        var colorResult = ApplyColorMode(printerName, colorMode);

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
            using var posterTitleFont = new Font("Arial", 28, FontStyle.Bold);
            using var posterSubtitleFont = new Font("Arial", 15, FontStyle.Bold);
            using var posterCodeFont = new Font("Arial", 18, FontStyle.Bold);
            // Brush colors are picked in software when B/W is requested, rather
            // than relying on the printer driver to desaturate them - the same
            // reasoning as PrintBitmapPages above.
            using var brandBrush = new SolidBrush(GrayscaleSafe(Color.FromArgb(13, 23, 72), colorMode));
            using var accentBrush = new SolidBrush(GrayscaleSafe(Color.FromArgb(87, 64, 237), colorMode));
            using var orangeBrush = new SolidBrush(GrayscaleSafe(Color.FromArgb(255, 123, 26), colorMode));
            using var mutedBrush = new SolidBrush(GrayscaleSafe(Color.FromArgb(89, 101, 140), colorMode));
            using var softBrush = new SolidBrush(GrayscaleSafe(Color.FromArgb(245, 247, 252), colorMode));
            using var whiteBrush = new SolidBrush(Color.White);
            using var borderPen = new Pen(GrayscaleSafe(Color.FromArgb(214, 221, 236), colorMode), 2);

            if (!includePrinterLine)
            {
                var content = new Rectangle(bounds.Left, bounds.Top, bounds.Width, bounds.Height);
                eventArgs.Graphics.FillRectangle(softBrush, content);

                var poster = new Rectangle(content.Left + 18, content.Top + 18, content.Width - 36, content.Height - 36);
                eventArgs.Graphics.FillRectangle(whiteBrush, poster);
                eventArgs.Graphics.DrawRectangle(borderPen, poster);

                var header = new Rectangle(poster.Left, poster.Top, poster.Width, 150);
                eventArgs.Graphics.FillRectangle(accentBrush, header);
                DrawCentered(eventArgs.Graphics, shopName, posterTitleFont, whiteBrush, header.Left + 24, header.Width - 48, header.Top + 32);
                DrawCentered(eventArgs.Graphics, "Scan. Upload. Pay. Print.", posterSubtitleFont, orangeBrush, header.Left + 24, header.Width - 48, header.Top + 88);

                var posterQrSize = Math.Min(330, Math.Min(poster.Width - 110, poster.Height - 330));
                var posterQrX = poster.Left + (poster.Width - posterQrSize) / 2;
                var posterQrY = header.Bottom + 54;
                var qrCard = new Rectangle(posterQrX - 24, posterQrY - 24, posterQrSize + 48, posterQrSize + 48);
                eventArgs.Graphics.FillRectangle(whiteBrush, qrCard);
                eventArgs.Graphics.DrawRectangle(borderPen, qrCard);

                using var posterQrBitmap = DecodeDataUrlImage(qrImage, colorMode);
                if (posterQrBitmap is not null)
                {
                    eventArgs.Graphics.DrawImage(posterQrBitmap, posterQrX, posterQrY, posterQrSize, posterQrSize);
                    var badge = new Rectangle(posterQrX + (posterQrSize - 150) / 2, posterQrY + (posterQrSize - 38) / 2, 150, 38);
                    eventArgs.Graphics.FillRectangle(whiteBrush, badge);
                    eventArgs.Graphics.DrawRectangle(borderPen, badge);
                    DrawCentered(eventArgs.Graphics, "CafeMitra", subtitleFont, brandBrush, badge.Left, badge.Width, badge.Top + 5);
                }
                else
                {
                    DrawCentered(eventArgs.Graphics, "QR not available", subtitleFont, accentBrush, posterQrX, posterQrSize, posterQrY + (posterQrSize / 2) - 10);
                }

                var footerY = qrCard.Bottom + 34;
                DrawCentered(eventArgs.Graphics, string.IsNullOrWhiteSpace(shopCode) ? "CafeMitra" : shopCode, posterCodeFont, brandBrush, poster.Left, poster.Width, footerY);
                DrawCentered(eventArgs.Graphics, "Upload documents from your phone", subtitleFont, mutedBrush, poster.Left, poster.Width, footerY + 38);
                eventArgs.Graphics.FillRectangle(brandBrush, poster.Left + 54, poster.Bottom - 88, poster.Width - 108, 48);
                DrawCentered(eventArgs.Graphics, "CafeMitra PrintPilot", subtitleFont, whiteBrush, poster.Left + 54, poster.Width - 108, poster.Bottom - 78);
                eventArgs.HasMorePages = false;
                return;
            }

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
            DrawCentered(eventArgs.Graphics, $"Printer: {printerName} ({colorMode.ToLabel()})", smallFont, mutedBrush, bounds.Left, bounds.Width, y);
            y += 18;
            DrawCentered(eventArgs.Graphics, $"Printed: {DateTime.Now:dd MMM yyyy hh:mm tt}", smallFont, mutedBrush, bounds.Left, bounds.Width, y);
            eventArgs.HasMorePages = false;
        };

        document.Print();
        return $"{successMessage} {colorResult}";
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
        var rect = new RectangleF(x, y, width, font.GetHeight(graphics) + 8);
        using var format = new StringFormat { Alignment = StringAlignment.Center, LineAlignment = StringAlignment.Center };
        graphics.DrawString(text, font, brush, rect, format);
    }

    /// Switches the given Windows printer's default color setting before the
    /// job is sent. Not every printer/driver supports Set-PrintConfiguration
    /// (e.g. pure B/W laser printers) - in that case we log and continue
    /// instead of failing the whole print job.
    private static string ApplyColorMode(string printerName, PrintColorMode mode)
    {
        var colorArg = mode == PrintColorMode.Color ? "$true" : "$false";
        var escapedPrinter = printerName.Replace("'", "''");
        var command = $"Set-PrintConfiguration -PrinterName '{escapedPrinter}' -Color {colorArg}";
        var startInfo = new ProcessStartInfo
        {
            FileName = "powershell.exe",
            Arguments = $"-NoProfile -ExecutionPolicy Bypass -Command \"{command}\"",
            UseShellExecute = false,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            CreateNoWindow = true,
        };

        using var process = Process.Start(startInfo);
        if (process is null)
        {
            return $"Could not set {mode.ToLabel()} mode (PowerShell failed to start).";
        }

        var error = process.StandardError.ReadToEnd();
        process.WaitForExit(10000);
        if (process.ExitCode != 0)
        {
            // This printer/driver likely doesn't expose a color toggle - not fatal.
            return $"Note: printer does not support switching to {mode.ToLabel()} automatically ({error.Trim()}).";
        }

        return $"Printer mode set to {mode.ToLabel()}.";
    }
}
