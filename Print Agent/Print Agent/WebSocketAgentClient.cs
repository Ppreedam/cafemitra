using System.Net.WebSockets;

namespace Print_Agent;

/// Signal-only WebSocket connection to the server's "new job available"
/// push (see cafemitra_server/api/consumers.py). No job data ever travels
/// over this socket - any message received just means "go poll now", so
/// this class stays dumb on purpose: the existing GET /api/agent/jobs/
/// flow (invoked via `onJobAvailable`) remains the single source of truth
/// for job data. `onConnectionChanged` lets Form1 stop the poll timer
/// entirely while the socket is up (pushes make polling redundant load on
/// the server) and resume it at the configured interval the instant the
/// socket drops, so a WS outage never leaves jobs undiscovered.
internal sealed class WebSocketAgentClient(
    Func<AgentConfig> getConfig,
    Func<Task> onJobAvailable,
    Action<string> log,
    Action<bool> onConnectionChanged
) : IDisposable
{
    // Same ladder as Form1's AutoLoginLoop, for consistency.
    private static readonly int[] BackoffSeconds = [3, 5, 10, 20, 30, 60];

    // Flatter, distinct retry for handshake-time rejection (bad/expired
    // token) - not worth hammering every 3s if the real problem is a stale
    // token, but also not worth a full minute since a fresh login/refresh
    // might land any moment.
    private const int AuthRejectionRetrySeconds = 30;

    private CancellationTokenSource? _stop;
    private Task? _runTask;

    public void Start()
    {
        if (_runTask is { IsCompleted: false })
        {
            return; // already running - idempotent, safe to call from multiple login paths
        }

        _stop = new CancellationTokenSource();
        _runTask = Task.Run(() => RunLoopAsync(_stop.Token));
    }

    public void Stop()
    {
        _stop?.Cancel();
        _stop?.Dispose();
        _stop = null;
    }

    public void Dispose() => Stop();

    private async Task RunLoopAsync(CancellationToken token)
    {
        var attempt = 0;
        string? lastAttemptedToken = null;

        while (!token.IsCancellationRequested)
        {
            attempt++;
            var config = getConfig();

            if (string.IsNullOrWhiteSpace(config.AccessToken))
            {
                // Not logged in (shouldn't normally happen - Start() is only
                // called after a successful login - but config could go
                // stale mid-loop, e.g. a race with logout). Back off gently
                // and re-check rather than hot-looping.
                try { await Task.Delay(TimeSpan.FromSeconds(5), token); }
                catch (OperationCanceledException) { return; }
                continue;
            }

            try
            {
                using var socket = new ClientWebSocket();
                socket.Options.SetRequestHeader("Authorization", $"Bearer {config.AccessToken}");
                lastAttemptedToken = config.AccessToken;

                var uri = BuildWebSocketUri(config.ApiBaseUrl);
                await socket.ConnectAsync(uri, token);
                log("WebSocket connected - listening for job pushes.");
                attempt = 0; // reset the ladder after a successful connect
                SafeNotifyConnectionChanged(true);

                try
                {
                    await ReceiveLoopAsync(socket, token); // returns on close/error
                }
                finally
                {
                    // Always on the way out of the receive loop, whether it
                    // returned cleanly (server sent Close) or the socket was
                    // torn down abruptly (server killed, network drop) and
                    // ReceiveLoopAsync threw instead - either way, polling
                    // must resume the instant we're no longer listening on
                    // this socket, not just on a clean close.
                    SafeNotifyConnectionChanged(false);
                }
                log("WebSocket disconnected - will reconnect.");
            }
            catch (OperationCanceledException)
            {
                return; // Stop() was called
            }
            catch (WebSocketException ex)
            {
                // Handshake failed before 101 Switching Protocols - the only
                // expected cause from this backend is the consumer rejecting
                // a missing/invalid/expired token (close code 4401). Genuine
                // network failures can also surface as WebSocketException in
                // .NET, so this is a heuristic, not a certainty - treating it
                // as "assume auth" just means one reconnect attempt waits a
                // bit longer than a pure network blip would, which is an
                // acceptable trade-off.
                log($"WebSocket handshake failed (auth?): {ex.Message}");

                var current = getConfig().AccessToken;
                if (!string.IsNullOrEmpty(current) && current != lastAttemptedToken)
                {
                    // Token changed since this failed attempt (a fresh
                    // login/refresh just landed) - retry immediately instead
                    // of waiting out the auth-rejection delay.
                    continue;
                }

                try { await Task.Delay(TimeSpan.FromSeconds(AuthRejectionRetrySeconds), token); }
                catch (OperationCanceledException) { return; }
                continue;
            }
            catch (Exception ex)
            {
                log($"WebSocket error: {ex.Message}");
            }

            if (token.IsCancellationRequested)
            {
                return;
            }

            var delay = BackoffSeconds[Math.Min(attempt - 1, BackoffSeconds.Length - 1)];
            try { await Task.Delay(TimeSpan.FromSeconds(delay), token); }
            catch (OperationCanceledException) { return; }
        }
    }

    // A misbehaving UI-side handler (e.g. Invoke thrown against a form
    // that's mid-teardown) must never escape into the reconnect loop above -
    // that would skip the loop's own backoff/retry logic entirely and could
    // leave polling stuck off if it happened to throw right after the
    // connected(true) call.
    private void SafeNotifyConnectionChanged(bool connected)
    {
        try { onConnectionChanged(connected); }
        catch (Exception ex) { log($"onConnectionChanged handler failed: {ex.Message}"); }
    }

    private async Task ReceiveLoopAsync(ClientWebSocket socket, CancellationToken token)
    {
        var buffer = new byte[512];
        while (socket.State == WebSocketState.Open && !token.IsCancellationRequested)
        {
            var result = await socket.ReceiveAsync(buffer, token);
            if (result.MessageType == WebSocketMessageType.Close)
            {
                break;
            }

            // Any message at all = "check now". No payload parsing needed -
            // the server only ever sends {"type":"job_available"} today,
            // but we deliberately don't even look at it, so a future server
            // change to the payload shape can't silently break this client.
            _ = onJobAvailable();
        }
    }

    private static Uri BuildWebSocketUri(string apiBaseUrl)
    {
        var http = new Uri(apiBaseUrl.TrimEnd('/') + "/");
        var scheme = http.Scheme == "https" ? "wss" : "ws";
        var builder = new UriBuilder(http) { Scheme = scheme, Path = "/ws/agent/jobs/" };
        return builder.Uri;
    }
}
