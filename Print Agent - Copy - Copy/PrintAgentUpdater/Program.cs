namespace PrintAgentUpdater;

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
        var installDir = AppContext.BaseDirectory.TrimEnd(Path.DirectorySeparatorChar);
        var exePath = Path.Combine(installDir, "PrintAgent.exe");
        var apiBaseUrl = "http://localhost:8000";
        var pid = 0;

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
