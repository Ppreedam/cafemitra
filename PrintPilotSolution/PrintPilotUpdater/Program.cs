using System.Windows.Forms;

namespace PrintPilotUpdater;

internal static class Program
{
    [STAThread]
    private static void Main(string[] args)
    {
        ApplicationConfiguration.Initialize();

        var options = UpdateOptions.Parse(args);
        Application.Run(new UpdaterForm(options));
    }
}

internal sealed class UpdateOptions
{
    public int ParentPid { get; private init; }
    public string InstallDir { get; private init; } = AppContext.BaseDirectory;
    public string ExePath { get; private init; } = "";
    public string ApiBaseUrl { get; private init; } = "http://localhost:8000";

    public static UpdateOptions Parse(string[] args)
    {
        var options = new UpdateOptions
        {
            InstallDir = AppContext.BaseDirectory.TrimEnd(Path.DirectorySeparatorChar),
        };

        var pid = 0;
        var installDir = options.InstallDir;
        var exePath = Path.Combine(installDir, "PrintPilot.exe");
        var apiBaseUrl = options.ApiBaseUrl;

        for (var i = 0; i < args.Length; i++)
        {
            var value = i + 1 < args.Length ? args[i + 1] : "";
            switch (args[i])
            {
                case "--pid":
                    int.TryParse(value, out pid);
                    i++;
                    break;
                case "--dir":
                    installDir = value;
                    i++;
                    break;
                case "--exe":
                    exePath = value;
                    i++;
                    break;
                case "--api":
                    apiBaseUrl = value;
                    i++;
                    break;
            }
        }

        return new UpdateOptions
        {
            ParentPid = pid,
            InstallDir = installDir,
            ExePath = exePath,
            ApiBaseUrl = apiBaseUrl,
        };
    }
}
