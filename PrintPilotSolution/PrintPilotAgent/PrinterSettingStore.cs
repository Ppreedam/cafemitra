namespace PrintPilotAgent;

/// One saved printer/paper-size/color combination.
internal sealed class PrinterPreset
{
    public string PrinterName { get; set; } = "";
    public string PaperSize { get; set; } = "";
    public string ColorMode { get; set; } = "Color";
}

/// Persists presets as pipe-delimited lines in printerSetting.text next to
/// the exe (the application folder), per spec - not %AppData%, so it's
/// visible/editable alongside the install.
internal static class PrinterSettingStore
{
    public static readonly string FilePath = Path.Combine(AppContext.BaseDirectory, "printerSetting.text");

    // Shared with PrinterSettingForm (desktop dialog) and LocalStatusServer
    // (website bridge) so both surfaces offer the same fixed choices.
    public static readonly string[] PaperSizes = ["A4", "A5", "Letter"];
    public static readonly string[] ColorModes = ["Color", "Grayscale"];

    private const char Separator = '|';

    public static List<PrinterPreset> Load()
    {
        var presets = new List<PrinterPreset>();
        if (!File.Exists(FilePath))
        {
            return presets;
        }

        foreach (var line in File.ReadAllLines(FilePath))
        {
            if (string.IsNullOrWhiteSpace(line)) continue;
            var parts = line.Split(Separator);
            if (parts.Length < 3) continue;

            presets.Add(new PrinterPreset
            {
                PrinterName = parts[0],
                PaperSize = parts[1],
                ColorMode = parts[2],
            });
        }

        return presets;
    }

    public static void Save(IEnumerable<PrinterPreset> presets)
    {
        var lines = presets.Select(p => string.Join(Separator, [Clean(p.PrinterName), Clean(p.PaperSize), Clean(p.ColorMode)]));
        File.WriteAllLines(FilePath, lines);
    }

    private static string Clean(string value) => value.Replace(Separator, ' ').Replace('\n', ' ').Replace('\r', ' ');
}
