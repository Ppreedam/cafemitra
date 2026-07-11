using System.Text.Json;

namespace PrintPilotAgent;

internal static class AgentPaths
{
    public static readonly string ConfigDir = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
        "CafeMitra",
        "PrintPilotAgent"
    );

    public static readonly string JobsDir = Path.Combine(ConfigDir, "jobs");
    public static readonly string ConfigPath = Path.Combine(ConfigDir, "config.json");

    // Disguised as a runtime dependency so it doesn't stand out as a
    // credentials file when someone browses the folder. Content itself is
    // still DPAPI-encrypted (see CredentialStore), so the name is just
    // cosmetic - not the actual protection.
    public static readonly string CredentialsPath = Path.Combine(ConfigDir, "PrintPilot.Core.dll");
}

internal sealed class AgentConfig
{
    public string ApiBaseUrl { get; set; } = "http://localhost:8000";
    public string AccessToken { get; set; } = "";
    public string RefreshToken { get; set; } = "";
    public string OwnerName { get; set; } = "";
    public string OwnerEmail { get; set; } = "";
    public string PrinterName { get; set; } = "";
    public int PollIntervalSeconds { get; set; } = 5;
    public int PrintSettleSeconds { get; set; } = 2;

    public static AgentConfig Load(string path)
    {
        if (!File.Exists(path))
        {
            return new AgentConfig();
        }

        try
        {
            var json = File.ReadAllText(path);
            return JsonSerializer.Deserialize<AgentConfig>(json, JsonDefaults.Options) ?? new AgentConfig();
        }
        catch
        {
            return new AgentConfig();
        }
    }

    public static void Save(string path, AgentConfig config)
    {
        var json = JsonSerializer.Serialize(config, JsonDefaults.Options);
        File.WriteAllText(path, json);
    }
}
