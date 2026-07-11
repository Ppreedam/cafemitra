using System.Diagnostics;
using System.Net.Http;

namespace PrintPilotAgent;

internal static class VersionChecker
{
    /// Compares the running build's version.txt against GET api/agent/version-check/.
    /// Returns true if an update was launched (caller should exit immediately
    /// and let Updater.exe take over). Any network failure here is treated as
    /// "no update available right now" - a version check must never block the
    /// app from starting when the shop's internet is down.
    public static async Task<bool> CheckAndLaunchUpdaterIfNeeded(string apiBaseUrl, Action<string> log)
    {
        try
        {
            using var http = new HttpClient { Timeout = TimeSpan.FromSeconds(8) };
            var remoteVersion = (await http.GetStringAsync($"{apiBaseUrl.TrimEnd('/')}/api/agent/version-check/")).Trim();

            var localVersionPath = Path.Combine(AppContext.BaseDirectory, "version.txt");
            var localVersion = File.Exists(localVersionPath)
                ? File.ReadAllText(localVersionPath).Trim()
                : "";

            if (string.IsNullOrWhiteSpace(remoteVersion))
            {
                log("Version check: server returned empty version, skipping update.");
                return false;
            }

            if (string.Equals(remoteVersion, localVersion, StringComparison.Ordinal))
            {
                log($"Version check: up to date (v{localVersion}).");
                return false;
            }

            log($"Version check: local v{(string.IsNullOrEmpty(localVersion) ? "unknown" : localVersion)} != server v{remoteVersion}. Launching updater.");
            return LaunchUpdater(apiBaseUrl, log);
        }
        catch (Exception error)
        {
            log($"Version check skipped (offline or server unreachable): {error.Message}");
            return false;
        }
    }

    private static bool LaunchUpdater(string apiBaseUrl, Action<string> log)
    {
        try
        {
            var installDir = AppContext.BaseDirectory.TrimEnd(Path.DirectorySeparatorChar);
            var updaterPath = Path.Combine(installDir, "Updater.exe");

            if (!File.Exists(updaterPath))
            {
                log($"Updater.exe not found at {updaterPath}. Skipping update, continuing with current version.");
                return false;
            }

            var exePath = Path.Combine(installDir, "PrintPilot.exe");
            var currentPid = Environment.ProcessId;

            var startInfo = new ProcessStartInfo
            {
                FileName = updaterPath,
                Arguments =
                    $"--pid {currentPid} " +
                    $"--dir \"{installDir}\" " +
                    $"--exe \"{exePath}\" " +
                    $"--api \"{apiBaseUrl.TrimEnd('/')}\"",
                UseShellExecute = true,
                WorkingDirectory = installDir,
            };

            Process.Start(startInfo);
            return true;
        }
        catch (Exception error)
        {
            log($"Could not launch updater: {error.Message}. Continuing with current version.");
            return false;
        }
    }
}
