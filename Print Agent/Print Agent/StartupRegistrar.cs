using Microsoft.Win32;

namespace Print_Agent;

// ---------------------------------------------------------------
// First-run setup: registers the app to launch automatically at
// Windows sign-in, via both the HKCU Run key and a shortcut in the
// user's Startup folder (shell:startup) - belt and suspenders, since
// some environments only honor one of the two. Runs once, gated by a
// marker file in AgentPaths.ConfigDir - later runs are a no-op, so a
// user who later removes either entry won't have it re-added.
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
        // v2: bumped from autostart_installed.flag so installs that already
        // registered before --autostart existed pick up the new argument
        // once, without re-adding the entry for someone who removed it via
        // this app's own future "disable autostart" feature (not yet
        // built) rather than just deleting the flag file by hand.
        var markerPath = Path.Combine(AgentPaths.ConfigDir, "autostart_installed_v2.flag");
        if (File.Exists(markerPath)) return;

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
        finally
        {
            try
            {
                Directory.CreateDirectory(AgentPaths.ConfigDir);
                File.WriteAllText(markerPath, DateTime.Now.ToString("O"));
            }
            catch
            {
                // If we can't even write the marker, we'll just retry next launch.
            }
        }
    }
}
