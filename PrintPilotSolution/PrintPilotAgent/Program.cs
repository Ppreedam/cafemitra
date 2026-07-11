using System.Windows.Forms;

namespace PrintPilotAgent;

internal static class Program
{
    [STAThread]
    private static void Main()
    {
        try
        {
            ApplicationConfiguration.Initialize();
            Application.SetUnhandledExceptionMode(UnhandledExceptionMode.CatchException);
            Application.ThreadException += (_, error) => WriteStartupLog($"UI thread exception: {error.Exception}");
            AppDomain.CurrentDomain.UnhandledException += (_, error) => WriteStartupLog($"Unhandled exception: {error.ExceptionObject}");

            Directory.CreateDirectory(AgentPaths.ConfigDir);
            var config = AgentConfig.Load(AgentPaths.ConfigPath);

            // Version check happens before any UI is created. If it's out of
            // date we hand off to Updater.exe and exit immediately - the
            // updater relaunches PrintPilot.exe once the new files are in place.
            var updateLaunched = VersionChecker
                .CheckAndLaunchUpdaterIfNeeded(config.ApiBaseUrl, WriteStartupLog)
                .GetAwaiter()
                .GetResult();

            if (updateLaunched)
            {
                return;
            }

            Application.Run(new AgentForm(config));
        }
        catch (Exception error)
        {
            WriteStartupLog($"Startup failed: {error}");
            MessageBox.Show(error.Message, "PrintPilot startup failed", MessageBoxButtons.OK, MessageBoxIcon.Error);
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
