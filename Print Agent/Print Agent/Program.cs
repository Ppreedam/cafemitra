namespace Print_Agent
{
    internal static class Program
    {
        private const string SingleInstanceMutexName = "PrintAgent_SingleInstance_Mutex";
        private const string ShowExistingInstanceEventName = "PrintAgent_ShowExistingInstance_Event";

        /// <summary>
        ///  The main entry point for the application.
        /// </summary>
        [STAThread]
        static void Main()
        {
            using var singleInstanceMutex = new Mutex(true, SingleInstanceMutexName, out var createdNew);
            if (!createdNew)
            {
                // Another instance is already running - ask it to restore
                // itself from the tray instead of starting a new one.
                try
                {
                    using var showEvent = EventWaitHandle.OpenExisting(ShowExistingInstanceEventName);
                    showEvent.Set();
                }
                catch
                {
                    // Best-effort - if the existing instance's handle isn't reachable, just exit.
                }
                return;
            }

            try
            {
                // To customize application configuration such as set high DPI settings or default font,
                // see https://aka.ms/applicationconfiguration.
                ApplicationConfiguration.Initialize();

                Directory.CreateDirectory(AgentPaths.ConfigDir);

                ShortcutInstaller.EnsureInstalledOnce();
                StartupRegistrar.EnsureEnabledOnce();

                // "--autostart" is only present when Windows itself launched
                // this at sign-in (see StartupRegistrar) - a deliberate
                // double-click of the desktop/Start-Menu shortcut never
                // carries it, so that path still opens visibly as expected.
                var startedByWindows = Environment.GetCommandLineArgs()
                    .Skip(1)
                    .Any(a => a.Equals("--autostart", StringComparison.OrdinalIgnoreCase));

                var form = new Form1(startMinimized: startedByWindows);

                using var showEvent = new EventWaitHandle(false, EventResetMode.AutoReset, ShowExistingInstanceEventName);
                var listenerThread = new Thread(() =>
                {
                    while (showEvent.WaitOne())
                    {
                        if (form.IsHandleCreated)
                            form.BeginInvoke(new Action(form.RestoreFromTray));
                    }
                })
                { IsBackground = true };
                listenerThread.Start();

                // The version check now happens on Form1's Load event instead
                // of here, so it runs against the loaded UI's version label.
                Application.Run(form);
            }
            catch (Exception error)
            {
                WriteStartupLog($"Startup failed: {error}");
                MessageBox.Show(error.Message, "Print Agent startup failed", MessageBoxButtons.OK, MessageBoxIcon.Error);
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