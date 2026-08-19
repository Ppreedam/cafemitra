using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Text.Json;

namespace Print_Agent;

/// Same local HTTP bridge protocol as PrintPilotSolution's agent, so the
/// website's PrintPilot Setup wizard (which already targets 127.0.0.1:8765)
/// works unchanged against this agent too.
internal sealed class LocalStatusServer(
    Func<AgentStatusSnapshot> statusProvider,
    Func<string, AgentStatusSnapshot> savePrinter,
    Func<PrinterPresetsResponse> listPresets,
    Func<SavePrinterPresetRequest, PrinterPresetsResponse> savePreset,
    Func<PrinterPresetDto, PrinterPresetsResponse> deletePreset,
    Func<LocalTestPrintRequest, LocalTestPrintResult> testPrint,
    Func<LocalTestPrintRequest, LocalTestPrintResult> posterPrint,
    Action<string> log
) : IDisposable
{
    private readonly CancellationTokenSource _stop = new();
    private TcpListener? _listener;

    public void Start()
    {
        try
        {
            _listener = new TcpListener(IPAddress.Loopback, 8765);
            _listener.Start();
            _ = Task.Run(() => RunAsync(_stop.Token));
            log("Local bridge listening on http://127.0.0.1:8765 (for the browser-based dashboard).");
        }
        catch (Exception error)
        {
            log($"Local bridge could not start: {error.Message}");
        }
    }

    private async Task RunAsync(CancellationToken token)
    {
        if (_listener is null) return;

        while (!token.IsCancellationRequested)
        {
            try
            {
                var client = await _listener.AcceptTcpClientAsync(token);
                _ = Task.Run(() => HandleClientAsync(client, token), token);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception error)
            {
                log($"Local bridge error: {error.Message}");
            }
        }
    }

    private async Task HandleClientAsync(TcpClient client, CancellationToken token)
    {
        using var clientRef = client;
        using var stream = client.GetStream();
        using var reader = new StreamReader(stream, Encoding.UTF8, leaveOpen: true);

        var requestLine = await reader.ReadLineAsync(token) ?? "";
        var parts = requestLine.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        var method = parts.Length > 0 ? parts[0].ToUpperInvariant() : "";
        var path = parts.Length > 1 ? parts[1] : "/";
        var contentLength = 0;

        string? line;
        while (!string.IsNullOrEmpty(line = await reader.ReadLineAsync(token)))
        {
            if (line.StartsWith("Content-Length:", StringComparison.OrdinalIgnoreCase))
            {
                int.TryParse(line["Content-Length:".Length..].Trim(), out contentLength);
            }
        }

        if (method == "OPTIONS")
        {
            await WriteResponse(stream, 204, "", token);
            return;
        }

        try
        {
            if (method == "GET" && path.StartsWith("/status", StringComparison.OrdinalIgnoreCase))
            {
                await WriteJson(stream, statusProvider(), token);
                return;
            }

            if (method == "POST" && path.StartsWith("/settings", StringComparison.OrdinalIgnoreCase))
            {
                var payload = await ReadBody<LocalSettingsRequest>(reader, contentLength, token) ?? new LocalSettingsRequest();
                await WriteJson(stream, savePrinter(payload.Printer ?? ""), token);
                return;
            }

            if (method == "POST" && path.StartsWith("/test-print", StringComparison.OrdinalIgnoreCase))
            {
                var payload = await ReadBody<LocalTestPrintRequest>(reader, contentLength, token) ?? new LocalTestPrintRequest();
                await WriteJson(stream, testPrint(payload), token);
                return;
            }

            if (method == "POST" && path.StartsWith("/poster-print", StringComparison.OrdinalIgnoreCase))
            {
                var payload = await ReadBody<LocalTestPrintRequest>(reader, contentLength, token) ?? new LocalTestPrintRequest();
                await WriteJson(stream, posterPrint(payload), token);
                return;
            }

            if (method == "GET" && path.StartsWith("/printer-presets", StringComparison.OrdinalIgnoreCase))
            {
                await WriteJson(stream, listPresets(), token);
                return;
            }

            if (method == "POST" && path.StartsWith("/printer-presets/delete", StringComparison.OrdinalIgnoreCase))
            {
                var payload = await ReadBody<PrinterPresetDto>(reader, contentLength, token) ?? new PrinterPresetDto();
                await WriteJson(stream, deletePreset(payload), token);
                return;
            }

            if (method == "POST" && path.StartsWith("/printer-presets", StringComparison.OrdinalIgnoreCase))
            {
                var payload = await ReadBody<SavePrinterPresetRequest>(reader, contentLength, token) ?? new SavePrinterPresetRequest();
                await WriteJson(stream, savePreset(payload), token);
                return;
            }

            await WriteResponse(stream, 404, "{\"message\":\"Not found\"}", token);
        }
        catch (Exception error)
        {
            await WriteResponse(stream, 500, JsonSerializer.Serialize(new { message = error.Message }, JsonDefaults.Options), token);
        }
    }

    private static async Task<T?> ReadBody<T>(StreamReader reader, int contentLength, CancellationToken token)
    {
        if (contentLength <= 0)
        {
            return default;
        }

        var buffer = new char[contentLength];
        await reader.ReadBlockAsync(buffer, token);
        return JsonSerializer.Deserialize<T>(new string(buffer), JsonDefaults.Options);
    }

    private static Task WriteJson(NetworkStream stream, object payload, CancellationToken token)
    {
        return WriteResponse(stream, 200, JsonSerializer.Serialize(payload, JsonDefaults.Options), token);
    }

    private static async Task WriteResponse(NetworkStream stream, int statusCode, string body, CancellationToken token)
    {
        var statusText = statusCode switch
        {
            200 => "OK",
            204 => "No Content",
            404 => "Not Found",
            _ => "Error",
        };
        var bytes = Encoding.UTF8.GetBytes(body);
        var headers =
            $"HTTP/1.1 {statusCode} {statusText}\r\n" +
            "Content-Type: application/json; charset=utf-8\r\n" +
            "Access-Control-Allow-Origin: *\r\n" +
            "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n" +
            "Access-Control-Allow-Headers: Content-Type\r\n" +
            $"Content-Length: {bytes.Length}\r\n" +
            "Connection: close\r\n\r\n";
        await stream.WriteAsync(Encoding.UTF8.GetBytes(headers), token);
        if (bytes.Length > 0)
        {
            await stream.WriteAsync(bytes, token);
        }
    }

    public void Dispose()
    {
        _stop.Cancel();
        _listener?.Stop();
        _stop.Dispose();
    }
}
