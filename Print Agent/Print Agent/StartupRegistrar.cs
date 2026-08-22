using Microsoft.Win32;

namespace Print_Agent;

// ---------------------------------------------------------------
// Registers the app to launch automatically at Windows sign-in, via
// both the HKCU Run key and a shortcut in the user's Startup folder
// (shell:startup) - belt and suspenders, since some environments only
// honor one of the two. Runs (and replaces both entries) on every
// launch instead of a one-time flag, so a user who deletes either
// entry - or an exe path that changed after an update/move - gets it
// restored/refreshed the next time the app starts.
// ---------------------------------------------------------------
internal static class StartupRegistrar
{
    private const string RunKeyPath = @"Software\Microsoft\Windows\CurrentVersion\Run";
    private const string ValueName = "RepetiGo Print Agent";
    private const string StartupShortcutName = "Repetigo Print Agent.lnk";

    // "--autostart" tells Program.cs this launch came from Windows sign-in
    // (not the user double-clicking the app), so it can open straight to
    // the tray instead of popping the window up on every reboot.
    private const string AutostartArg = "--autostart";

    public static void EnsureEnabledOnce()
    {
        try
        {
            var exePath = Environment.ProcessPath;
            if (!string.IsNullOrWhiteSpace(exePath) && File.Exists(exePath))
            {
                using var key = Registry.CurrentUser.OpenSubKey(RunKeyPath, writable: true);
                key?.SetValue(ValueName, $"\"{exePath}\" {AutostartArg}", RegistryValueKind.String);

                var startupShortcut = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.Startup), StartupShortcutName);
                ShortcutInstaller.CreateShortcut(startupShortcut, exePath, AutostartArg);
            }
        }
        catch
        {
            // Best-effort - a failed autostart registration should never block startup.
        }
    }
}
