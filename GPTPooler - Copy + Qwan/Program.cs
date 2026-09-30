namespace GeminiPool;

internal static class Program
{
    [STAThread]
    static void Main()
    {
        ApplicationConfiguration.Initialize();
        Directory.CreateDirectory(AgentPaths.ConfigDir);
        Application.Run(new Form1());
    }
}
