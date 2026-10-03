using System.Drawing.Printing;
using System.Runtime.InteropServices;
using System.Text.Json;

namespace Print_Agent;

/// A named print profile: one printer plus the exact driver settings
/// (DEVMODE) the shop owner chose in that printer's own Preferences dialog -
/// paper size, paper type (glossy/matte), quality, borderless, color, tray...
/// Jobs that arrive with this profile name print with those settings as-is,
/// instead of the paper-size/color preset grid.
internal sealed class PrintProfile
{
    public string Name { get; set; } = "";
    public string Printer { get; set; } = "";

    /// Full DEVMODE (public + driver-private part), base64. Driver-specific
    /// options like "Photo Paper Glossy" / "Best quality" live in the
    /// private part, so the whole blob is kept, not just the public fields.
    public string DevMode { get; set; } = "";

    public string UpdatedAt { get; set; } = "";

    public byte[] DevModeBytes()
    {
        try { return string.IsNullOrWhiteSpace(DevMode) ? [] : Convert.FromBase64String(DevMode); }
        catch { return []; }
    }
}

internal static class PrintProfileStore
{
    public static readonly string ProfilesPath = Path.Combine(AgentPaths.ConfigDir, "print_profiles.json");

    public static List<PrintProfile> Load()
    {
        try
        {
            if (!File.Exists(ProfilesPath)) return [];
            return JsonSerializer.Deserialize<List<PrintProfile>>(File.ReadAllText(ProfilesPath), JsonDefaults.Options) ?? [];
        }
        catch
        {
            return [];
        }
    }

    public static void Save(IEnumerable<PrintProfile> profiles)
    {
        Directory.CreateDirectory(AgentPaths.ConfigDir);
        var json = JsonSerializer.Serialize(profiles.OrderBy(p => p.Name, StringComparer.OrdinalIgnoreCase).ToList(), JsonDefaults.Options);
        // Write-then-move so a crash mid-save never leaves a half-written file.
        var temp = ProfilesPath + ".tmp";
        File.WriteAllText(temp, json);
        File.Move(temp, ProfilesPath, overwrite: true);
    }

    /// Adds or replaces a profile. <paramref name="originalName"/> is the
    /// name it had before (rename while editing); any profile with the new
    /// name is replaced too.
    public static void Upsert(string name, string printer, byte[] devMode, string? originalName = null)
    {
        name = name.Trim();
        var original = (originalName ?? "").Trim();
        var profiles = Load()
            .Where(p => !p.Name.Trim().Equals(name, StringComparison.OrdinalIgnoreCase)
                     && !(original.Length > 0 && p.Name.Trim().Equals(original, StringComparison.OrdinalIgnoreCase)))
            .ToList();
        profiles.Add(new PrintProfile
        {
            Name = name,
            Printer = printer,
            DevMode = Convert.ToBase64String(devMode),
            UpdatedAt = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
        });
        Save(profiles);
    }

    public static bool Delete(string name)
    {
        var key = name.Trim();
        var profiles = Load();
        var removed = profiles.RemoveAll(p => p.Name.Trim().Equals(key, StringComparison.OrdinalIgnoreCase));
        if (removed > 0) Save(profiles);
        return removed > 0;
    }

    /// Profile names are matched case-insensitively and ignoring outer spaces,
    /// so "4x6-Photo-Print-Best-Glossy " from the server still finds it.
    public static PrintProfile? Find(string? name)
    {
        var key = (name ?? "").Trim();
        if (key.Length == 0) return null;
        return Load().FirstOrDefault(p => p.Name.Trim().Equals(key, StringComparison.OrdinalIgnoreCase));
    }
}

/// Thin wrapper over the winspool DocumentProperties API - the same call
/// Windows' own "Printing Preferences" uses, so the shop owner sees their
/// driver's real dialog (paper type, quality, borderless...).
internal static class PrinterDevMode
{
    private const int DM_OUT_BUFFER = 2;
    private const int DM_IN_PROMPT = 4;
    private const int DM_IN_BUFFER = 8;
    private const int IDOK = 1;
    private const uint GMEM_MOVEABLE = 0x0002;

    [DllImport("winspool.drv", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern bool OpenPrinter(string pPrinterName, out IntPtr phPrinter, IntPtr pDefault);

    [DllImport("winspool.drv", SetLastError = true)]
    private static extern bool ClosePrinter(IntPtr hPrinter);

    [DllImport("winspool.drv", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern int DocumentProperties(IntPtr hWnd, IntPtr hPrinter, string pDeviceName, IntPtr pDevModeOutput, IntPtr pDevModeInput, int fMode);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern IntPtr GlobalAlloc(uint uFlags, UIntPtr dwBytes);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern IntPtr GlobalLock(IntPtr hMem);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool GlobalUnlock(IntPtr hMem);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern IntPtr GlobalFree(IntPtr hMem);

    /// Opens the printer's Preferences dialog, pre-filled with
    /// <paramref name="current"/> when given (editing an existing profile),
    /// otherwise with the printer's defaults. Returns the chosen DEVMODE, or
    /// null if the user pressed Cancel.
    public static byte[]? ShowPreferences(IWin32Window owner, string printerName, byte[]? current)
    {
        if (!OpenPrinter(printerName, out var hPrinter, IntPtr.Zero))
        {
            throw new InvalidOperationException($"Could not open printer \"{printerName}\" (error {Marshal.GetLastWin32Error()}).");
        }

        var input = IntPtr.Zero;
        var output = IntPtr.Zero;
        try
        {
            var size = DocumentProperties(owner.Handle, hPrinter, printerName, IntPtr.Zero, IntPtr.Zero, 0);
            if (size <= 0) throw new InvalidOperationException($"Printer driver for \"{printerName}\" did not return its settings.");

            output = Marshal.AllocHGlobal(size);

            // A saved DEVMODE is only reused if it belongs to this driver's
            // layout (same total size); otherwise start from the defaults.
            if (current is { Length: > 0 } && current.Length == size)
            {
                input = Marshal.AllocHGlobal(size);
                Marshal.Copy(current, 0, input, size);
            }
            else
            {
                input = Marshal.AllocHGlobal(size);
                if (DocumentProperties(owner.Handle, hPrinter, printerName, input, IntPtr.Zero, DM_OUT_BUFFER) < 0)
                {
                    throw new InvalidOperationException($"Could not read default settings of \"{printerName}\".");
                }
            }

            var result = DocumentProperties(owner.Handle, hPrinter, printerName, output, input, DM_IN_BUFFER | DM_IN_PROMPT | DM_OUT_BUFFER);
            if (result != IDOK) return null;

            var bytes = new byte[size];
            Marshal.Copy(output, bytes, 0, size);
            return bytes;
        }
        finally
        {
            if (input != IntPtr.Zero) Marshal.FreeHGlobal(input);
            if (output != IntPtr.Zero) Marshal.FreeHGlobal(output);
            ClosePrinter(hPrinter);
        }
    }

    /// Puts a saved profile's printer + DEVMODE onto a PrintDocument. Must be
    /// called after nothing else touches PrinterName (setting PrinterName
    /// again would reset the driver settings back to defaults).
    public static void Apply(PrintDocument document, PrintProfile profile)
    {
        document.PrinterSettings.PrinterName = profile.Printer;
        var devMode = profile.DevModeBytes();
        if (devMode.Length == 0) return;

        var hDevMode = GlobalAlloc(GMEM_MOVEABLE, (UIntPtr)devMode.Length);
        if (hDevMode == IntPtr.Zero) throw new OutOfMemoryException("Could not allocate printer settings buffer.");
        try
        {
            var ptr = GlobalLock(hDevMode);
            Marshal.Copy(devMode, 0, ptr, devMode.Length);
            GlobalUnlock(hDevMode);

            document.PrinterSettings.SetHdevmode(hDevMode);
            document.DefaultPageSettings.SetHdevmode(hDevMode);
        }
        finally
        {
            GlobalFree(hDevMode);
        }

        // Copies are driven by the job (one Print() per copy), not the profile.
        document.PrinterSettings.Copies = 1;
    }

    /// Short human summary of a DEVMODE's public fields, e.g.
    /// "4x6 in · Color · High quality", shown in the profile list.
    public static string Describe(PrintProfile profile)
    {
        try
        {
            using var document = new PrintDocument();
            Apply(document, profile);
            var page = document.DefaultPageSettings;
            var parts = new List<string> { page.PaperSize.PaperName };
            parts.Add(page.Color ? "Color" : "Grayscale");
            if (page.Landscape) parts.Add("Landscape");
            if (document.PrinterSettings.Duplex is Duplex.Vertical or Duplex.Horizontal) parts.Add("Duplex");
            var quality = page.PrinterResolution.Kind;
            if (quality != PrinterResolutionKind.Custom) parts.Add($"{quality} quality");
            return string.Join(" · ", parts);
        }
        catch
        {
            return "";
        }
    }
}
