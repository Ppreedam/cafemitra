using System.Diagnostics;

namespace Print_Agent;

internal static class VersionChecker
{
    private const string LatestVersionUrl =
        "https://raw.githubusercontent.com/httpsankit/cafemitra_updates/refs/heads/main/letest_version";

    /// Compares the running build's version label against the latest version
    /// published on GitHub. Returns true if an update was launched (caller
    /// should close the form immediately and let Updater.exe take over -
    /// it closes this process, installs the update, and relaunches
    /// PrintAgent.exe when done). Any network failure here is treated as
    /// "no update available right now" - a version check must never block
    /// the app from working when the shop's internet is down.
    public static async Task<bool> CheckAndLaunchUpdaterIfNeeded(string currentVersion, Action<string> log)
    {
        try
        {
            using var http = new HttpClient { Timeout = TimeSpan.FromSeconds(8) };
            var remoteVersion = (await http.GetStringAsync(LatestVersionUrl)).Trim();

            if (string.IsNullOrWhiteSpace(remoteVersion))
            {
                log("Version check: server returned empty version, skipping update.");
                return false;
            }

            var localVersion = currentVersion.Trim();
            if (string.Equals(remoteVersion, localVersion, StringComparison.OrdinalIgnoreCase))
            {
                log($"Version check: up to date (v{localVersion}).");
                return false;
            }

            log($"Version check: local v{(string.IsNullOrEmpty(localVersion) ? "unknown" : localVersion)} != latest v{remoteVersion}. Launching updater.");
            return LaunchUpdater(log);
        }
        catch (Exception error)
        {
            log($"Version check skipped (offline or server unreachable): {error.Message}");
            return false;
        }
    }

    private static bool LaunchUpdater(Action<string> log)
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

            var exePath = Path.Combine(installDir, "PrintAgent.exe");
            var currentPid = Environment.ProcessId;

            var startInfo = new ProcessStartInfo
            {
                FileName = updaterPath,
                Arguments =
                    $"--pid {currentPid} " +
                    $"--dir \"{installDir}\" " +
                    $"--exe \"{exePath}\"",
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
