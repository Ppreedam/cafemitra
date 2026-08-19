namespace Print_Agent;

internal static class ApiBaseUrlProvider
{
    private const string BaseUrlSourceUrl =
        "https://raw.githubusercontent.com/httpsankit/cafemitra_updates/refs/heads/main/print_agent_baseurl";

    /// Refreshes AgentConfig.ApiBaseUrl from the published GitHub source and
    /// persists it to config.json when it changed. Any network failure here
    /// is treated as "keep using whatever is already in config.json" - this
    /// must never block the app from working when the shop's internet is down.
    public static async Task RefreshBaseUrl(AgentConfig config, string configPath, Action<string> log)
    {
        try
        {
            using var http = new HttpClient { Timeout = TimeSpan.FromSeconds(8) };
            var remoteBaseUrl = (await http.GetStringAsync(BaseUrlSourceUrl)).Trim();

            if (string.IsNullOrWhiteSpace(remoteBaseUrl))
            {
                log("Base URL check: server returned empty value, keeping current base URL.");
                return;
            }

            if (!Uri.TryCreate(remoteBaseUrl, UriKind.Absolute, out _))
            {
                log($"Base URL check: server returned an invalid URL ({remoteBaseUrl}), keeping current base URL.");
                return;
            }

            if (string.Equals(remoteBaseUrl, config.ApiBaseUrl, StringComparison.OrdinalIgnoreCase))
            {
                return;
            }

            log($"Base URL check: updating API base URL to {remoteBaseUrl}.");
            config.ApiBaseUrl = remoteBaseUrl;
            AgentConfig.Save(configPath, config);
        }
        catch (Exception error)
        {
            log($"Base URL check skipped (offline or server unreachable): {error.Message}");
        }
    }
}
