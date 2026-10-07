namespace Print_Agent;

internal sealed class JobListResponse
{
    public List<PrintJob> Jobs { get; set; } = [];
}

internal sealed class PrintJob
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = "";
    public string TokenId { get; set; } = "";
    public int TokenNumber { get; set; }
    public string ShopCode { get; set; } = "";
    public string ServiceKey { get; set; } = "";
    public string ServiceName { get; set; } = "";
    public string PriceItemId { get; set; } = "";
    public string PriceLabel { get; set; } = "";
    public decimal Rate { get; set; }
    public int Pages { get; set; }
    public int Copies { get; set; }
    public decimal TotalAmount { get; set; }
    public string PaymentMode { get; set; } = "";
    public string PaymentStatus { get; set; } = "";
    public string Status { get; set; } = "";
    public string FileName { get; set; } = "";
    public string DownloadUrl { get; set; } = "";
    public string CreatedAt { get; set; } = "";
    public string AttireCategory { get; set; } = "";

    /// Explicit color instruction from the server, if present. Falls back to
    /// guessing from the price label when the server does not send one.
    public string? ColorMode { get; set; }

    /// Double-side print requested at order time. Older servers don't send
    /// these, so they default to a normal single-side job.
    public bool Duplex { get; set; }
    public string DuplexEdge { get; set; } = "long";

    /// Name of a print profile saved in this agent's "Profiles" window (e.g.
    /// "4x6-photo-print-best-glossy"). When set, the job prints on that
    /// profile's printer with its saved driver preferences.
    public string? ProfileName { get; set; }

    /// Explicit paper size from the server, if it ever sends one.
    public string? PaperSize { get; set; }

    /// "A3", "4x6", or "A4" (the default for everything else). Like the
    /// color mode, this is read from the print type's name when the server
    /// sends nothing: a shop that names a price item "A3 Color" or
    /// "4x6 Photo" gets those orders routed to its A3 / photo printer.
    public string ResolvedPaperSize
    {
        get
        {
            var explicitSize = (PaperSize ?? "").Trim().Replace(" ", "").Replace("×", "x").ToLowerInvariant();
            if (explicitSize == "4x6") return "4x6";
            if (explicitSize == "a3") return "A3";

            var value = $"{PriceItemId} {PriceLabel} {ServiceName}".ToLowerInvariant().Replace("×", "x");
            var compact = value.Replace(" ", "");
            if (compact.Contains("4x6")) return "4x6";
            if (System.Text.RegularExpressions.Regex.IsMatch(value, @"(^|[^a-z0-9])a3([^a-z0-9]|$)")) return "A3";
            return "A4";
        }
    }

    public bool IsCashApprovalPending =>
        PaymentStatus.Equals("cash_counter", StringComparison.OrdinalIgnoreCase)
        && Status.Equals("awaiting_approval", StringComparison.OrdinalIgnoreCase);

    public PrintColorMode PrintColorMode
    {
        get
        {
            if (!string.IsNullOrWhiteSpace(ColorMode))
            {
                return ColorMode.Trim().ToLowerInvariant() switch
                {
                    "color" or "colour" => PrintColorMode.Color,
                    _ => PrintColorMode.BlackWhite,
                };
            }

            var value = $"{PriceItemId} {PriceLabel} {ServiceName}".ToLowerInvariant();
            if (value.Contains("color") || value.Contains("colour"))
            {
                return PrintColorMode.Color;
            }

            return PrintColorMode.BlackWhite;
        }
    }

    public string PrintColorModeLabel => PrintColorMode.ToLabel();
}

internal enum PrintColorMode
{
    BlackWhite,
    Color,
}

internal static class PrintColorModeExtensions
{
    public static string ToLabel(this PrintColorMode mode)
    {
        return mode == PrintColorMode.Color ? "Color" : "Black & White";
    }

    /// Matches the "Color"/"Grayscale" values stored in printer_settings.txt
    /// (the printer-setting grid) - distinct from ToLabel(), which is for
    /// human-readable logs ("Black & White").
    public static string ToPresetColorMode(this PrintColorMode mode)
    {
        return mode == PrintColorMode.Color ? "Color" : "Grayscale";
    }
}

internal sealed class AuthResponse
{
    public string Token { get; set; } = "";
    public string RefreshToken { get; set; } = "";
    public AuthUser? User { get; set; }
    public AuthShop? Shop { get; set; }
}

internal sealed class AuthUser
{
    public string Id { get; set; } = "";
    public string Email { get; set; } = "";
    public string FullName { get; set; } = "";
    public string Phone { get; set; } = "";
}

internal sealed class AuthShop
{
    public string ShopName { get; set; } = "";
}

/// Thrown when the server explicitly rejects credentials (bad email/password).
/// Distinguished from connectivity failures so the caller knows whether to
/// keep silently retrying (offline) or stop and ask the user to log in again.
internal sealed class AuthenticationFailedException(string message) : Exception(message);

// ── Local bridge (website PrintPilot Setup page) DTOs ──────────────────

internal sealed class AgentStatusSnapshot
{
    public string App { get; set; } = "";
    public string Status { get; set; } = "stopped";
    public string Account { get; set; } = "";
    public string Printer { get; set; } = "";
    public IReadOnlyList<string> Printers { get; set; } = [];
    public string ApiBaseUrl { get; set; } = "";
    public string LastCheckAt { get; set; } = "";
    public string Version { get; set; } = "";
    public bool Online { get; set; }
}

internal sealed class LocalSettingsRequest
{
    public string? Printer { get; set; }
}

internal sealed class LocalTestPrintRequest
{
    public string? Printer { get; set; }
    public string? ShopName { get; set; }
    public string? ShopCode { get; set; }
    public string? QrUrl { get; set; }
    public string? QrImage { get; set; }
    public string? ColorMode { get; set; }
}

internal sealed class LocalTestPrintResult
{
    public string Message { get; set; } = "";
    public string Printer { get; set; } = "";
    public string PrintedAt { get; set; } = "";
    public IReadOnlyList<string> Printers { get; set; } = [];
}

/// One printer preset row as seen over the local bridge - mirrors a
/// printer_settings.txt line (Printer|PageSize|ColorType).
internal sealed class PrinterPresetDto
{
    public string? Printer { get; set; }
    public string? PaperSize { get; set; }
    public string? ColorMode { get; set; }
    /// Print profile used for this paper size + color mode ("" = none).
    public string? Profile { get; set; }
}

internal sealed class SavePrinterPresetRequest
{
    public string? Printer { get; set; }
    public string? PaperSize { get; set; }
    public string? ColorMode { get; set; }
    /// When set, the preset prints with this profile (and its printer).
    public string? Profile { get; set; }
    public PrinterPresetDto? Original { get; set; }
}

internal sealed class PrinterPresetsResponse
{
    public IReadOnlyList<PrinterPresetDto> Presets { get; set; } = [];
    public IReadOnlyList<string> Printers { get; set; } = [];
    public IReadOnlyList<string> PaperSizes { get; set; } = [];
    public IReadOnlyList<string> ColorModes { get; set; } = [];
}

/// One print profile as seen over the local bridge (website Printer Setup).
/// The driver settings themselves never leave this PC - only a summary.
internal sealed class PrintProfileDto
{
    public string Name { get; set; } = "";
    public string Printer { get; set; } = "";
    public string Summary { get; set; } = "";
    public string UpdatedAt { get; set; } = "";
    public bool Missing { get; set; }
}

internal sealed class PrintProfilesResponse
{
    public IReadOnlyList<PrintProfileDto> Profiles { get; set; } = [];
    public IReadOnlyList<string> Printers { get; set; } = [];
}

/// Create/edit a profile from the website: the agent opens the printer's
/// own Preferences dialog on this PC, then saves what the owner picked.
internal sealed class SavePrintProfileRequest
{
    public string? Name { get; set; }
    public string? Printer { get; set; }
    /// Name before editing, for a rename; empty for a new profile.
    public string? OriginalName { get; set; }
    /// Base64 DEVMODE from /print-profiles/preferences. When empty, the
    /// agent opens the Preferences dialog itself (or keeps the saved
    /// settings when only the name changed on the same printer).
    public string? DevMode { get; set; }
}

/// Opens a printer's Preferences dialog without saving anything yet.
internal sealed class PrintPreferencesRequest
{
    public string? Printer { get; set; }
    /// Profile being edited - its saved settings pre-fill the dialog.
    public string? OriginalName { get; set; }
    /// Settings picked earlier in this session - pre-fill the dialog.
    public string? DevMode { get; set; }
}

internal sealed class PrintPreferencesResult
{
    public string DevMode { get; set; } = "";
    public string Summary { get; set; } = "";
}

internal sealed class DeletePrintProfileRequest
{
    public string? Name { get; set; }
}

/// A ready-made PDF from a website tool (photo sheet, ID card, resume...)
/// sent straight to the printer through a print profile.
internal sealed class PrintFileRequest
{
    public string? Profile { get; set; }
    /// Used only when no profile is given (prints with driver defaults).
    public string? Printer { get; set; }
    public string? FileName { get; set; }
    public string? PdfBase64 { get; set; }
    public int Copies { get; set; } = 1;
}

internal sealed class PrintFileResult
{
    public string Message { get; set; } = "";
    public string Printer { get; set; } = "";
    public string Profile { get; set; } = "";
    public string PrintedAt { get; set; } = "";
}

/// Duplex printer slot as seen over the local bridge (website Setup page).
internal sealed class DuplexSettingsDto
{
    public string? Printer { get; set; }
    public string? Mode { get; set; }
    public bool Capable { get; set; }
    public bool Missing { get; set; }
    public IReadOnlyList<string> Printers { get; set; } = [];
}
