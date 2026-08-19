using System.Text.Json;
using System.Text.Json.Serialization;

namespace Print_Agent;

internal static class AgentPaths
{
    public static readonly string ConfigDir = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
        "CafeMitra",
        "PrintAgent"
    );

    public static readonly string JobsDir = Path.Combine(ConfigDir, "jobs");
    public static readonly string ConfigPath = Path.Combine(ConfigDir, "config.json");
    public static readonly string CredentialsPath = Path.Combine(ConfigDir, "credentials.dat");
}

internal sealed class AgentConfig
{
    public string ApiBaseUrl { get; set; } = "https://api.repetigo.com/";
    public string AccessToken { get; set; } = "";
    public string RefreshToken { get; set; } = "";
    public string OwnerName { get; set; } = "";
    public string OwnerEmail { get; set; } = "";
    public string ShopName { get; set; } = "";
    public int PollIntervalSeconds { get; set; } = 10;

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
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        var json = JsonSerializer.Serialize(config, JsonDefaults.Options);
        File.WriteAllText(path, json);
    }
}

internal static class JsonDefaults
{
    public static readonly JsonSerializerOptions Options = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };
}
