using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;

namespace PrintPilotAgent;

internal sealed class CafeMitraApi(HttpClient http, AgentConfig config, string configPath)
{
    public async Task<AuthResponse> Login(string email, string password)
    {
        AuthResponse? response;
        try
        {
            response = await SendJson<AuthResponse>(
                HttpMethod.Post,
                "api/auth/login/",
                new { email, password },
                CancellationToken.None,
                auth: false
            );
        }
        catch (HttpRequestException error)
        {
            // Network-level failure (no internet, DNS, refused, timeout) - caller
            // can tell this apart from bad credentials and decide to retry quietly.
            throw new HttpRequestException($"Network error during login: {error.Message}", error);
        }
        catch (TaskCanceledException error)
        {
            throw new HttpRequestException($"Login request timed out: {error.Message}", error);
        }

        if (response is null || string.IsNullOrWhiteSpace(response.Token))
        {
            throw new AuthenticationFailedException("Login response token missing.");
        }

        config.AccessToken = response.Token;
        config.RefreshToken = response.RefreshToken;
        AgentConfig.Save(configPath, config);
        return response;
    }

    public async Task<IReadOnlyList<PrintJob>> FetchJobs(CancellationToken token)
    {
        var result = await SendJson<JobListResponse>(HttpMethod.Get, "api/agent/jobs/", null, token);
        return result?.Jobs ?? [];
    }

    public async Task UpdateStatus(int orderId, string status, string message, CancellationToken token)
    {
        await SendJson<System.Text.Json.JsonElement>(
            HttpMethod.Post,
            $"api/agent/jobs/{orderId}/status/",
            new { status, message },
            token
        );
    }

    public async Task ApproveCashOrder(int orderId, CancellationToken token)
    {
        await SendJson<System.Text.Json.JsonElement>(HttpMethod.Post, $"api/orders/{orderId}/approve-cash/", null, token);
    }

    public async Task RejectCashOrder(int orderId, CancellationToken token)
    {
        await SendJson<System.Text.Json.JsonElement>(HttpMethod.Post, $"api/orders/{orderId}/reject-cash/", null, token);
    }

    public async Task DownloadFile(string url, string destination, CancellationToken token)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, url);
        AddAuth(request);
        using var response = await http.SendAsync(request, token);
        if (response.StatusCode == HttpStatusCode.Unauthorized && await RefreshToken(token))
        {
            using var retry = new HttpRequestMessage(HttpMethod.Get, url);
            AddAuth(retry);
            using var retryResponse = await http.SendAsync(retry, token);
            retryResponse.EnsureSuccessStatusCode();
            await using var retryStream = await retryResponse.Content.ReadAsStreamAsync(token);
            await using var retryFile = File.Create(destination);
            await retryStream.CopyToAsync(retryFile, token);
            return;
        }

        response.EnsureSuccessStatusCode();
        await using var stream = await response.Content.ReadAsStreamAsync(token);
        await using var file = File.Create(destination);
        await stream.CopyToAsync(file, token);
    }

    private async Task<T?> SendJson<T>(
        HttpMethod method,
        string path,
        object? body,
        CancellationToken token,
        bool auth = true,
        bool allowRefresh = true
    )
    {
        using var request = new HttpRequestMessage(method, path);
        if (auth)
        {
            AddAuth(request);
        }
        else
        {
            request.Headers.UserAgent.ParseAdd("CafeMitra-PrintPilot/1.0");
        }

        if (body is not null)
        {
            request.Content = JsonBody(body);
        }

        using var response = await http.SendAsync(request, token);
        if (response.StatusCode == HttpStatusCode.Unauthorized && auth && allowRefresh && await RefreshToken(token))
        {
            return await SendJson<T>(method, path, body, token, auth, allowRefresh: false);
        }

        if (response.StatusCode is HttpStatusCode.Unauthorized or HttpStatusCode.BadRequest && !auth)
        {
            var error = await response.Content.ReadAsStringAsync(token);
            throw new AuthenticationFailedException(string.IsNullOrWhiteSpace(error) ? "Invalid email or password." : error);
        }

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync(token);
            throw new InvalidOperationException($"HTTP {(int)response.StatusCode}: {error}");
        }

        return await response.Content.ReadFromJsonAsync<T>(JsonDefaults.Options, token);
    }

    private async Task<bool> RefreshToken(CancellationToken token)
    {
        if (string.IsNullOrWhiteSpace(config.RefreshToken))
        {
            return false;
        }

        using var request = new HttpRequestMessage(HttpMethod.Post, "api/auth/refresh/")
        {
            Content = JsonBody(new { refreshToken = config.RefreshToken }),
        };
        request.Headers.UserAgent.ParseAdd("CafeMitra-PrintPilot/1.0");

        HttpResponseMessage response;
        try
        {
            response = await http.SendAsync(request, token);
        }
        catch
        {
            return false;
        }

        if (!response.IsSuccessStatusCode)
        {
            return false;
        }

        var refresh = await response.Content.ReadFromJsonAsync<AuthResponse>(JsonDefaults.Options, token);
        if (refresh is null || string.IsNullOrWhiteSpace(refresh.Token))
        {
            return false;
        }

        config.AccessToken = refresh.Token;
        config.RefreshToken = string.IsNullOrWhiteSpace(refresh.RefreshToken) ? config.RefreshToken : refresh.RefreshToken;
        config.OwnerName = refresh.User?.FullName ?? config.OwnerName;
        config.OwnerEmail = refresh.User?.Email ?? config.OwnerEmail;
        AgentConfig.Save(configPath, config);
        return true;
    }

    private void AddAuth(HttpRequestMessage request)
    {
        request.Headers.UserAgent.ParseAdd("CafeMitra-PrintPilot/1.0");
        if (!string.IsNullOrWhiteSpace(config.AccessToken))
        {
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", config.AccessToken);
        }
    }

    private static StringContent JsonBody(object body)
    {
        var json = System.Text.Json.JsonSerializer.Serialize(body, JsonDefaults.Options);
        return new StringContent(json, Encoding.UTF8, "application/json");
    }
}
