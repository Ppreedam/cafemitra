namespace PrintAgentUpdater;

internal static class Program
{
    private const string SingleInstanceMutexName = "PrintAgentUpdater_SingleInstance_Mutex";

    [STAThread]
    private static void Main(string[] args)
    {
        // PrintAgent launches an Updater whenever its own version check sees
        // a mismatch. If that fires more than once in a row (a relaunched
        // instance re-checking before the first update has finished writing
        // the new files), every launch would otherwise race the same
        // download/extract/copy against the others and can corrupt the
        // install. Only the first Updater actually runs; the rest are
        // no-ops - the one already running will finish the job and relaunch
        // PrintAgent with the version that stops the mismatch loop.
        using var singleInstanceMutex = new Mutex(true, SingleInstanceMutexName, out var createdNew);
        if (!createdNew)
        {
            return;
        }

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

    public static UpdateOptions Parse(string[] args)
    {
        var installDir = AppContext.BaseDirectory.TrimEnd(Path.DirectorySeparatorChar);
        var exePath = Path.Combine(installDir, "PrintAgent.exe");
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
            }
        }

        return new UpdateOptions
        {
            ParentPid = pid,
            InstallDir = installDir,
            ExePath = exePath,
        };
    }
}
