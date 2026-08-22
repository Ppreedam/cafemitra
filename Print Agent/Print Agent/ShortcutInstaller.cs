using System.Reflection;
using System.Runtime.InteropServices;

namespace Print_Agent;

// ---------------------------------------------------------------
// Startup setup: makes sure a Desktop shortcut and a Start Menu
// shortcut for the app (both carrying its .ico) exist, then
// best-effort pins it to the taskbar. The Desktop shortcut is
// recreated (replaced) on every launch so it always points at the
// current exe/icon even if the user moved the install or an update
// changed the path; the Start Menu shortcut is only created if
// missing. Runs on every launch instead of a one-time flag, so a
// shortcut the user deletes gets restored next time the app starts.
// ---------------------------------------------------------------
internal static class ShortcutInstaller
{
    private const string ShortcutName = "Repetigo.lnk";

    public static void EnsureInstalledOnce()
    {
        try
        {
            var exePath = Environment.ProcessPath;
            if (string.IsNullOrWhiteSpace(exePath) || !File.Exists(exePath)) return;

            var desktopShortcut = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.Desktop), ShortcutName);
            var startMenuShortcut = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.Programs), ShortcutName);

            // Always (re)create - replaces a stale/existing shortcut too.
            CreateShortcut(desktopShortcut, exePath);
            if (!File.Exists(startMenuShortcut)) CreateShortcut(startMenuShortcut, exePath);
            TryPinToTaskbar(exePath);
        }
        catch
        {
            // Best-effort - a failed shortcut/pin attempt should never block startup.
        }
    }

    // Uses the WScript.Shell COM object (always present on Windows) via
    // reflection so we don't need a COM/NuGet reference just to write a
    // .lnk file. Internal so StartupRegistrar can reuse it for the
    // Startup-folder shortcut. `arguments` lets the Startup-folder variant
    // pass "--autostart" (see StartupRegistrar) so Program.cs can tell a
    // Windows-login auto-launch apart from the user deliberately opening
    // the app - the Desktop/Start-Menu shortcuts leave this empty.
    internal static void CreateShortcut(string shortcutPath, string exePath, string arguments = "")
    {
        var shellType = Type.GetTypeFromProgID("WScript.Shell");
        if (shellType is null) return;

        object? shell = null;
        object? shortcut = null;
        try
        {
            shell = Activator.CreateInstance(shellType);
            shortcut = shellType.InvokeMember(
                "CreateShortcut", BindingFlags.InvokeMethod, null, shell, new object[] { shortcutPath });
            var shortcutType = shortcut!.GetType();

            shortcutType.InvokeMember("TargetPath", BindingFlags.SetProperty, null, shortcut, new object[] { exePath });
            shortcutType.InvokeMember("WorkingDirectory", BindingFlags.SetProperty, null, shortcut, new object[] { Path.GetDirectoryName(exePath)! });
            shortcutType.InvokeMember("IconLocation", BindingFlags.SetProperty, null, shortcut, new object[] { $"{exePath},0" });
            shortcutType.InvokeMember("Description", BindingFlags.SetProperty, null, shortcut, new object[] { "RepetiGo Print Agent" });
            if (!string.IsNullOrWhiteSpace(arguments))
            {
                shortcutType.InvokeMember("Arguments", BindingFlags.SetProperty, null, shortcut, new object[] { arguments });
            }
            shortcutType.InvokeMember("Save", BindingFlags.InvokeMethod, null, shortcut, null);
        }
        finally
        {
            if (shortcut is not null) Marshal.FinalReleaseComObject(shortcut);
            if (shell is not null) Marshal.FinalReleaseComObject(shell);
        }
    }

    // Windows removed the public/scriptable "Pin to taskbar" verb for
    // non-Store apps starting with Windows 10 1809, so this only succeeds
    // on older builds - everywhere else it's a silent no-op and the user
    // pins the shortcut manually the first time (it then stays pinned).
    private static void TryPinToTaskbar(string exePath)
    {
        var shellAppType = Type.GetTypeFromProgID("Shell.Application");
        if (shellAppType is null) return;

        object? shellApp = null;
        object? folder = null;
        object? item = null;
        object? verbs = null;
        try
        {
            shellApp = Activator.CreateInstance(shellAppType);
            var dir = Path.GetDirectoryName(exePath)!;
            var file = Path.GetFileName(exePath);

            folder = shellAppType.InvokeMember("NameSpace", BindingFlags.InvokeMethod, null, shellApp, new object[] { dir });
            if (folder is null) return;
            var folderType = folder.GetType();

            item = folderType.InvokeMember("ParseName", BindingFlags.InvokeMethod, null, folder, new object[] { file });
            if (item is null) return;
            var itemType = item.GetType();

            verbs = itemType.InvokeMember("Verbs", BindingFlags.InvokeMethod, null, item, null);
            var verbsType = verbs!.GetType();
            var count = (int)verbsType.InvokeMember("Count", BindingFlags.GetProperty, null, verbs, null)!;

            for (var i = 0; i < count; i++)
            {
                object? verb = null;
                try
                {
                    verb = verbsType.InvokeMember("Item", BindingFlags.InvokeMethod, null, verbs, new object[] { i });
                    var verbType = verb!.GetType();
                    var name = (string)verbType.InvokeMember("Name", BindingFlags.GetProperty, null, verb, null)!;

                    if (name.Replace("&", "").Trim().Equals("Pin to taskbar", StringComparison.OrdinalIgnoreCase))
                    {
                        verbType.InvokeMember("DoIt", BindingFlags.InvokeMethod, null, verb, null);
                        return;
                    }
                }
                finally
                {
                    if (verb is not null) Marshal.FinalReleaseComObject(verb);
                }
            }
        }
        finally
        {
            if (verbs is not null) Marshal.FinalReleaseComObject(verbs);
            if (item is not null) Marshal.FinalReleaseComObject(item);
            if (folder is not null) Marshal.FinalReleaseComObject(folder);
            if (shellApp is not null) Marshal.FinalReleaseComObject(shellApp);
        }
    }
}
