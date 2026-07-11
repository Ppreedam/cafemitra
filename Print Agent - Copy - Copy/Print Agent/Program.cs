using System.Diagnostics;

namespace Print_Agent
{
    internal static class Program
    {
        // Only one Print Agent should ever be running at once. "Global\" makes
        // this visible across all sessions on the machine, not just this user.
        private const string SingleInstanceMutexName = "Global\\CafeMitra_PrintAgent_SingleInstance";

        /// <summary>
        ///  The main entry point for the application.
        /// </summary>
        [STAThread]
        static void Main()
        {
            using var singleInstanceMutex = new Mutex(initiallyOwned: true, SingleInstanceMutexName, out var isNewInstance);
            if (!isNewInstance)
            {
                // Another Print Agent is already running - do not open a second one.
                return;
            }

            try
            {
                // To customize application configuration such as set high DPI settings or default font,
                // see https://aka.ms/applicationconfiguration.
                ApplicationConfiguration.Initialize();

                Directory.CreateDirectory(AgentPaths.ConfigDir);
                var config = AgentConfig.Load(AgentPaths.ConfigPath);

                // A stop flag from a previous session should never carry over
                // into this one - only *this* run's own Exit should suppress
                // its own watchdog restart.
                TryDeleteStopFlag();
                StartRestartWatchdog();

                // Version check happens before any UI is created. If it's out
                // of date we hand off to Updater.exe and exit immediately -
                // the updater relaunches PrintAgent.exe once done.
                var updateLaunched = VersionChecker
                    .CheckAndLaunchUpdaterIfNeeded(config.ApiBaseUrl, WriteStartupLog)
                    .GetAwaiter()
                    .GetResult();

                if (updateLaunched)
                {
                    return;
                }

                Application.Run(new Form1());
            }
            catch (Exception error)
            {
                WriteStartupLog($"Startup failed: {error}");
                MessageBox.Show(error.Message, "Print Agent startup failed", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        /// Spawns a short-lived, invisible PowerShell watchdog that waits for
        /// this process to exit, then (unless the exit was a deliberate tray
        /// "Exit" - see AgentPaths.StopFlagPath) waits 5 seconds and relaunches
        /// the agent. The relaunched instance spawns its own watchdog the same
        /// way, so this keeps working across repeated crashes/kills.
        private static void StartRestartWatchdog()
        {
            try
            {
                var exePath = Path.Combine(AppContext.BaseDirectory, "PrintAgent.exe");
                var pid = Environment.ProcessId;
                var script =
                    $"Wait-Process -Id {pid} -ErrorAction SilentlyContinue; " +
                    "Start-Sleep -Seconds 5; " +
                    $"if (Test-Path '{AgentPaths.StopFlagPath}') {{ Remove-Item '{AgentPaths.StopFlagPath}' -Force -ErrorAction SilentlyContinue }} " +
                    $"elseif (-not (Get-Process -Name 'PrintAgent' -ErrorAction SilentlyContinue)) {{ Start-Process -FilePath '{exePath}' -WorkingDirectory '{AppContext.BaseDirectory}' }}";

                Process.Start(new ProcessStartInfo
                {
                    FileName = "powershell.exe",
                    Arguments = $"-NoProfile -WindowStyle Hidden -Command \"{script}\"",
                    UseShellExecute = false,
                    CreateNoWindow = true,
                });
            }
            catch (Exception error)
            {
                WriteStartupLog($"Could not start restart watchdog: {error.Message}");
            }
        }

        private static void TryDeleteStopFlag()
        {
            try
            {
                if (File.Exists(AgentPaths.StopFlagPath))
                {
                    File.Delete(AgentPaths.StopFlagPath);
                }
            }
            catch
            {
                // Best effort - a stale flag just means one extra skipped restart.
            }
        }

        private static void WriteStartupLog(string message)
        {
            try
            {
                Directory.CreateDirectory(AgentPaths.ConfigDir);
                File.AppendAllText(
                    Path.Combine(AgentPaths.ConfigDir, "startup.log"),
                    $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] {message}\n"
                );
            }
            catch
            {
                // Last-resort startup logging must not throw.
            }
        }
    }
}