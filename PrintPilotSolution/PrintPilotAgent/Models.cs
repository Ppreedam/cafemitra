using System.Text.Json.Serialization;

namespace PrintPilotAgent;

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

/// One printer preset as seen over the local bridge (website PrintPilot
/// Setup page) - mirrors PrinterPreset (PrinterSettingStore.cs) but with
/// camelCase JSON names matching the desktop dialog's own request shape.
internal sealed class PrinterPresetDto
{
    public string? Printer { get; set; }
    public string? PaperSize { get; set; }
    public string? ColorMode { get; set; }
}

/// Save request: PaperSize/ColorMode/Printer are the new values; Original,
/// when present, identifies the existing preset being edited (so it can be
/// replaced in place instead of added as a duplicate).
internal sealed class SavePrinterPresetRequest
{
    public string? Printer { get; set; }
    public string? PaperSize { get; set; }
    public string? ColorMode { get; set; }
    public PrinterPresetDto? Original { get; set; }
}

internal sealed class PrinterPresetsResponse
{
    public IReadOnlyList<PrinterPresetDto> Presets { get; set; } = [];
    public IReadOnlyList<string> Printers { get; set; } = [];
    public IReadOnlyList<string> PaperSizes { get; set; } = [];
    public IReadOnlyList<string> ColorModes { get; set; } = [];
}

internal sealed class LocalTestPrintRequest
{
    public string? Printer { get; set; }
    public string? ShopName { get; set; }
    public string? ShopCode { get; set; }
    public string? QrUrl { get; set; }
    public string? QrImage { get; set; }
    public string? ColorMode { get; set; } // "color" | "bw" - optional override coming from the browser
}

internal sealed class LocalTestPrintResult
{
    public string Message { get; set; } = "";
    public string Printer { get; set; } = "";
    public string PrintedAt { get; set; } = "";
    public IReadOnlyList<string> Printers { get; set; } = [];
}

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

    /// Explicit color instruction from the server, if present. Falls back to
    /// guessing from the price label when the server does not send one.
    public string? ColorMode { get; set; }

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

    /// Matches the "Color"/"Grayscale" values stored in printer presets
    /// (PrinterSettingForm/PrinterSettingStore) - kept distinct from
    /// ToLabel() since that one is for human-readable logs ("Black & White").
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
}

internal sealed class AuthUser
{
    public string Id { get; set; } = "";
    public string Email { get; set; } = "";
    public string FullName { get; set; } = "";
    public string Phone { get; set; } = "";
}

/// Thrown when the server explicitly rejects credentials (bad email/password).
/// Distinguished from connectivity failures so the caller knows whether to
/// keep silently retrying (offline) or stop and ask the user to log in again.
internal sealed class AuthenticationFailedException(string message) : Exception(message);

internal static class JsonDefaults
{
    public static readonly System.Text.Json.JsonSerializerOptions Options = new()
    {
        PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase,
        WriteIndented = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };
}
