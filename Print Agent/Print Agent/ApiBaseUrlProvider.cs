namespace Print_Agent;

internal static class ApiBaseUrlProvider
{
    private const string BaseUrlSourceUrl =
        "https://raw.githubusercontent.com/httpsankit/cafemitra_updates/refs/heads/main/print_agent_baseurl";

    // The Django dev server's standard local port across this whole project
    // (cafemitra_admin/cafemitra_client both default NEXT_PUBLIC_API_BASE_URL
    // to this in dev). 127.0.0.1 rather than "localhost" - avoids .NET
    // resolving to ::1 first and failing/stalling against a runserver that's
    // only bound to the IPv4 loopback.
    private const string LocalDevBaseUrl = "http://127.0.0.1:8000/";

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

    /// Call after RefreshBaseUrl, before any login/polling starts. If a
    /// local `manage.py runserver` is reachable on localhost:8000, points
    /// this session's config.ApiBaseUrl at it instead - lets a developer
    /// test the agent against their own backend with zero manual config.
    /// Deliberately in-memory only (never written to config.json): a launch
    /// without the local server running must keep resolving to whatever
    /// RefreshBaseUrl set (production), not get stuck on a stale localhost
    /// value from a previous session.
    public static async Task UseLocalDevServerIfAvailable(AgentConfig config, Action<string> log)
    {
        try
        {
            using var http = new HttpClient { Timeout = TimeSpan.FromSeconds(2.5) };
            using var response = await http.GetAsync(LocalDevBaseUrl + "api/check/server/status/");
            if (!response.IsSuccessStatusCode)
            {
                log($"Local dev server check: {LocalDevBaseUrl} responded with HTTP {(int)response.StatusCode}, keeping {config.ApiBaseUrl}.");
                return;
            }

            log($"Local dev server detected at {LocalDevBaseUrl} - using it for this session instead of {config.ApiBaseUrl}.");
            config.ApiBaseUrl = LocalDevBaseUrl;
        }
        catch (Exception error)
        {
            // No local server running - the common case outside development.
            // Keep whatever RefreshBaseUrl already resolved.
            log($"Local dev server check skipped (not running at {LocalDevBaseUrl}): {error.Message}");
        }
    }
}
