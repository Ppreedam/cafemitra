using System.Diagnostics;
using System.Drawing;
using System.Drawing.Printing;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Net.Sockets;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Windows.Forms;
using Microsoft.Win32;

namespace PrintPilotAgent.CSharp;

internal static class Program
{
    [STAThread]
    private static void Main()
    {
        try
        {
            ApplicationConfiguration.Initialize();
            Application.SetUnhandledExceptionMode(UnhandledExceptionMode.CatchException);
            Application.ThreadException += (_, error) => WriteStartupError(error.Exception);
            AppDomain.CurrentDomain.UnhandledException += (_, error) => WriteStartupError(error.ExceptionObject as Exception);
            Application.Run(new AgentForm());
        }
        catch (Exception error)
        {
            WriteStartupError(error);
            MessageBox.Show(error.Message, "PrintPilot startup failed", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }

    private static void WriteStartupError(Exception? error)
    {
        try
        {
            var dir = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                "CafeMitra",
                "PrintPilotAgentCSharp"
            );
            Directory.CreateDirectory(dir);
            File.AppendAllText(
                Path.Combine(dir, "startup-error.log"),
                $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] {error}\n\n"
            );
        }
        catch
        {
            // Last-resort startup logging must not throw.
        }
    }
}

internal sealed class AgentForm : Form
{
    private readonly AgentConfig _config;
    private readonly string _configPath;
    private readonly TextBox _email = new();
    private readonly TextBox _password = new();
    private readonly Label _account = new();
    private readonly ComboBox _printers = new();
    private readonly Button _login = new();
    private readonly Button _refreshPrinters = new();
    private readonly Button _savePrinter = new();
    private readonly Button _startStop = new();
    private readonly TextBox _log = new();
    private readonly Label _status = new();
    private readonly LocalStatusServer _statusServer;
    private CancellationTokenSource? _workerStop;
    private bool _didAutoStart;

    public AgentForm()
    {
        _configPath = AgentPaths.ConfigPath;
        Directory.CreateDirectory(AgentPaths.ConfigDir);
        Directory.CreateDirectory(AgentPaths.JobsDir);
        Directory.CreateDirectory(AgentPaths.PrintedOutputDir);
        _config = AgentConfig.Load(_configPath);
        AgentConfig.Save(_configPath, _config);
        _statusServer = new LocalStatusServer(GetStatusSnapshot, SavePrinterFromLocalApi, RunTestPrintFromLocalApi, RunPosterPrintFromLocalApi, Log);

        Text = "CafeMitra PrintPilot Agent";
        Width = 760;
        Height = 620;
        MinimumSize = new Size(700, 560);
        StartPosition = FormStartPosition.CenterScreen;
        Font = new Font("Segoe UI", 10);

        BuildUi();
        LoadConfigIntoUi();
        RefreshPrinterList();
        _statusServer.Start();
        EnsureWindowsStartup();
    }

    protected override void OnFormClosing(FormClosingEventArgs e)
    {
        _workerStop?.Cancel();
        _statusServer.Dispose();
        base.OnFormClosing(e);
    }

    protected override void OnShown(EventArgs e)
    {
        base.OnShown(e);
        if (_didAutoStart) return;
        _didAutoStart = true;
        StartWorkerIfReady();
    }

    private void BuildUi()
    {
        var root = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            Padding = new Padding(18),
            ColumnCount = 1,
            RowCount = 6,
        };
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.Percent, 100));
        Controls.Add(root);

        var title = new Label
        {
            Text = "CafeMitra PrintPilot Agent",
            AutoSize = true,
            Font = new Font("Segoe UI", 18, FontStyle.Bold),
            ForeColor = Color.FromArgb(4, 21, 73),
        };
        root.Controls.Add(title);

        _status.Text = "Status: Stopped";
        _status.AutoSize = true;
        _status.Padding = new Padding(0, 4, 0, 10);
        root.Controls.Add(_status);

        var loginBox = Box("Login");
        loginBox.ColumnCount = 3;
        loginBox.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 48));
        loginBox.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 52));
        loginBox.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
        root.Controls.Add(loginBox);

        _email.PlaceholderText = "Owner email";
        _email.Dock = DockStyle.Fill;
        loginBox.Controls.Add(Field("Email", _email), 0, 0);

        _password.PlaceholderText = "Password";
        _password.UseSystemPasswordChar = true;
        _password.Dock = DockStyle.Fill;
        loginBox.Controls.Add(Field("Password", _password), 1, 0);

        _login.Text = "Login";
        _login.AutoSize = true;
        _login.Height = 38;
        _login.Click += async (_, _) => await LoginAsync();
        loginBox.Controls.Add(_login, 2, 0);

        _account.AutoSize = true;
        _account.ForeColor = Color.FromArgb(82, 96, 130);
        loginBox.Controls.Add(_account, 0, 1);
        loginBox.SetColumnSpan(_account, 3);

        var printerBox = Box("Printer");
        printerBox.ColumnCount = 4;
        printerBox.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
        printerBox.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
        printerBox.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
        printerBox.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
        root.Controls.Add(printerBox);

        _printers.DropDownStyle = ComboBoxStyle.DropDownList;
        _printers.Dock = DockStyle.Fill;
        printerBox.Controls.Add(Field("Selected Printer", _printers), 0, 0);

        _refreshPrinters.Text = "Scan Printers";
        _refreshPrinters.AutoSize = true;
        _refreshPrinters.Height = 38;
        _refreshPrinters.Click += (_, _) => RefreshPrinterList();
        printerBox.Controls.Add(_refreshPrinters, 1, 0);

        _savePrinter.Text = "Save Printer";
        _savePrinter.AutoSize = true;
        _savePrinter.Height = 38;
        _savePrinter.Click += (_, _) => SavePrinter();
        printerBox.Controls.Add(_savePrinter, 2, 0);

        _startStop.Text = "Start Agent";
        _startStop.AutoSize = true;
        _startStop.Height = 38;
        _startStop.Click += (_, _) => ToggleWorker();
        printerBox.Controls.Add(_startStop, 3, 0);

        var hint = new Label
        {
            Text = "Agent queued orders fetch karega, file download karega, selected printer par PDF print karega, phir status update karega.",
            AutoSize = true,
            ForeColor = Color.FromArgb(82, 96, 130),
            Padding = new Padding(0, 8, 0, 8),
        };
        root.Controls.Add(hint);

        root.Controls.Add(new Label
        {
            Text = "Agent Logs",
            AutoSize = true,
            Font = new Font("Segoe UI", 12, FontStyle.Bold),
            ForeColor = Color.FromArgb(4, 21, 73),
            Padding = new Padding(0, 6, 0, 4),
        });

        _log.Multiline = true;
        _log.ReadOnly = true;
        _log.ScrollBars = ScrollBars.Vertical;
        _log.Dock = DockStyle.Fill;
        _log.MinimumSize = new Size(0, 180);
        _log.BackColor = Color.White;
        _log.BorderStyle = BorderStyle.FixedSingle;
        root.Controls.Add(_log);
        Log("UI ready. Login and select printer once. Agent auto-starts after that.");
    }

    private static TableLayoutPanel Box(string title)
    {
        var panel = new TableLayoutPanel
        {
            Dock = DockStyle.Top,
            AutoSize = true,
            Padding = new Padding(0, 8, 0, 12),
        };
        panel.Controls.Add(new Label
        {
            Text = title,
            AutoSize = true,
            Font = new Font("Segoe UI", 12, FontStyle.Bold),
            ForeColor = Color.FromArgb(4, 21, 73),
            Padding = new Padding(0, 0, 0, 6),
        });
        panel.SetColumnSpan(panel.Controls[0], 4);
        return panel;
    }

    private static Control Field(string label, Control input)
    {
        var panel = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            AutoSize = true,
            RowCount = 2,
            Padding = new Padding(0, 0, 10, 0),
        };
        panel.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        panel.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        panel.Controls.Add(new Label
        {
            Text = label,
            AutoSize = true,
            ForeColor = Color.FromArgb(82, 96, 130),
            Font = new Font("Segoe UI", 9, FontStyle.Bold),
        }, 0, 0);
        input.Height = 34;
        panel.Controls.Add(input, 0, 1);
        return panel;
    }

    private void LoadConfigIntoUi()
    {
        _email.Text = _config.OwnerEmail;
        _account.Text = string.IsNullOrWhiteSpace(_config.AccessToken)
            ? "Not logged in"
            : $"Logged in: {_config.OwnerName} {_config.OwnerEmail}".Trim();
    }

    private async Task LoginAsync()
    {
        _login.Enabled = false;
        try
        {
            var api = NewApi();
            Log($"Login request sending for {_email.Text.Trim()}");
            var response = await api.Login(_email.Text.Trim(), _password.Text);
            _config.OwnerName = response.User?.FullName ?? "";
            _config.OwnerEmail = response.User?.Email ?? _email.Text.Trim();
            AgentConfig.Save(_configPath, _config);
            _account.Text = $"Logged in: {_config.OwnerName} {_config.OwnerEmail}".Trim();
            _password.Clear();
            Log("Login successful. Token saved automatically.");
            StartWorkerIfReady();
        }
        catch (Exception error)
        {
            Log($"Login failed: {error.Message}");
            MessageBox.Show(error.Message, "Login failed", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
        finally
        {
            _login.Enabled = true;
        }
    }

    private void RefreshPrinterList()
    {
        var printers = PrinterService.ListPrinters();
        _printers.Items.Clear();
        foreach (var printer in printers)
        {
            _printers.Items.Add(printer);
        }

        if (!string.IsNullOrWhiteSpace(_config.PrinterName) && !_printers.Items.Contains(_config.PrinterName))
        {
            _printers.Items.Insert(0, _config.PrinterName);
        }

        if (!string.IsNullOrWhiteSpace(_config.PrinterName))
        {
            _printers.SelectedItem = _config.PrinterName;
        }
        else if (_printers.Items.Count > 0)
        {
            _printers.SelectedIndex = 0;
        }

        Log($"Loaded {_printers.Items.Count} printer(s).");
    }

    private void SavePrinter()
    {
        _config.PrinterName = Convert.ToString(_printers.SelectedItem) ?? "";
        AgentConfig.Save(_configPath, _config);
        Log($"Printer saved: {_config.PrinterName}");
        StartWorkerIfReady();
    }

    private AgentStatusSnapshot GetStatusSnapshot()
    {
        if (InvokeRequired)
        {
            return (AgentStatusSnapshot)Invoke(GetStatusSnapshot);
        }

        var printers = _printers.Items.Cast<object>().Select(Convert.ToString).Where(name => !string.IsNullOrWhiteSpace(name)).Cast<string>().ToArray();
        return new AgentStatusSnapshot
        {
            App = "PrintPilotAgent.CSharp",
            Status = _workerStop is null ? "stopped" : "running",
            Account = string.IsNullOrWhiteSpace(_config.OwnerEmail) ? "" : $"{_config.OwnerName} {_config.OwnerEmail}".Trim(),
            Printer = _config.PrinterName,
            Printers = printers,
            ApiBaseUrl = _config.ApiBaseUrl,
            LastCheckAt = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
            CsharpAgent = true,
        };
    }

    private AgentStatusSnapshot SavePrinterFromLocalApi(string printerName)
    {
        if (InvokeRequired)
        {
            return (AgentStatusSnapshot)Invoke(() => SavePrinterFromLocalApi(printerName));
        }

        if (!string.IsNullOrWhiteSpace(printerName))
        {
            if (!_printers.Items.Contains(printerName))
            {
                _printers.Items.Insert(0, printerName);
            }

            _printers.SelectedItem = printerName;
            _config.PrinterName = printerName;
            AgentConfig.Save(_configPath, _config);
            Log($"Printer saved from local web UI: {_config.PrinterName}");
            StartWorkerIfReady();
        }

        return GetStatusSnapshot();
    }

    private LocalTestPrintResult RunTestPrintFromLocalApi(LocalTestPrintRequest request)
    {
        return RunQrPrintFromLocalApi(request, isPoster: false);
    }

    private LocalTestPrintResult RunPosterPrintFromLocalApi(LocalTestPrintRequest request)
    {
        return RunQrPrintFromLocalApi(request, isPoster: true);
    }

    private LocalTestPrintResult RunQrPrintFromLocalApi(LocalTestPrintRequest request, bool isPoster)
    {
        if (InvokeRequired)
        {
            return (LocalTestPrintResult)Invoke(() => RunQrPrintFromLocalApi(request, isPoster));
        }

        var printerName = string.IsNullOrWhiteSpace(request.Printer) ? _config.PrinterName : request.Printer;
        if (string.IsNullOrWhiteSpace(printerName))
        {
            throw new InvalidOperationException("Select printer first.");
        }

        if (!string.IsNullOrWhiteSpace(request.Printer) && !_printers.Items.Contains(request.Printer))
        {
            _printers.Items.Insert(0, request.Printer);
        }
        if (!string.IsNullOrWhiteSpace(request.Printer))
        {
            _printers.SelectedItem = request.Printer;
            _config.PrinterName = request.Printer;
            AgentConfig.Save(_configPath, _config);
            StartWorkerIfReady();
        }

        var result = isPoster
            ? PrinterService.PrintQrPoster(
                printerName,
                request.ShopName ?? "CafeMitra Shop",
                request.ShopCode ?? "",
                request.QrUrl ?? "",
                request.QrImage ?? ""
            )
            : PrinterService.PrintQrTestPage(
            printerName,
            request.ShopName ?? "CafeMitra Shop",
            request.ShopCode ?? "",
            request.QrUrl ?? "",
            request.QrImage ?? ""
        );
        Log($"{(isPoster ? "Poster print" : "Test print")}: {result}");
        return new LocalTestPrintResult
        {
            Message = result,
            Printer = printerName,
            PrintedAt = DateTimeOffset.Now.ToString("O"),
            Printers = PrinterService.ListPrinters(),
        };
    }

    private void ToggleWorker()
    {
        if (_workerStop is not null)
        {
            StopWorker();
            return;
        }

        StartWorkerIfReady(showWarnings: true);
    }

    private void StopWorker()
    {
        _workerStop?.Cancel();
        _workerStop = null;
        _startStop.Text = "Start Agent";
        _status.Text = "Status: Stopped";
        Log("Agent stopped.");
    }

    private bool StartWorkerIfReady(bool showWarnings = false)
    {
        if (_workerStop is not null)
        {
            return true;
        }

        if (string.IsNullOrWhiteSpace(_config.AccessToken))
        {
            if (showWarnings) MessageBox.Show("Login first.", "PrintPilot", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            else Log("Agent waiting: login first.");
            return false;
        }

        if (string.IsNullOrWhiteSpace(_config.PrinterName))
        {
            _config.PrinterName = Convert.ToString(_printers.SelectedItem) ?? "";
            if (!string.IsNullOrWhiteSpace(_config.PrinterName))
            {
                AgentConfig.Save(_configPath, _config);
                Log($"Printer auto-selected: {_config.PrinterName}");
            }
        }

        if (string.IsNullOrWhiteSpace(_config.PrinterName))
        {
            if (showWarnings) MessageBox.Show("Select printer first.", "PrintPilot", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            else Log("Agent waiting: select printer first.");
            return false;
        }

        _workerStop = new CancellationTokenSource();
        _startStop.Text = "Stop Agent";
        _status.Text = "Status: Running";
        Log("Agent started.");

        var api = NewApi();
        var worker = new PrintWorker(api, _config, Log, ChoosePdfOutputPath, ConfirmCashPrint);
        _ = Task.Run(async () => await WorkerLoop(worker, _workerStop.Token));
        return true;
    }

    private void EnsureWindowsStartup()
    {
        if (!OperatingSystem.IsWindows())
        {
            return;
        }

        try
        {
            using var key = Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Run", writable: true);
            key?.SetValue("CafeMitra PrintPilot Agent", $"\"{Application.ExecutablePath}\"");
            Log("Windows startup enabled for this user.");
        }
        catch (Exception error)
        {
            Log($"Could not enable Windows startup: {error.Message}");
        }
    }

    private async Task WorkerLoop(PrintWorker worker, CancellationToken token)
    {
        while (!token.IsCancellationRequested)
        {
            try
            {
                await worker.ProcessOnce(token);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception error)
            {
                Log($"Agent error: {error.Message}");
            }

            try
            {
                await Task.Delay(TimeSpan.FromSeconds(Math.Max(_config.PollIntervalSeconds, 2)), token);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }
    }

    private CafeMitraApi NewApi()
    {
        var http = new HttpClient { BaseAddress = new Uri(_config.ApiBaseUrl.TrimEnd('/') + "/") };
        return new CafeMitraApi(http, _config, _configPath);
    }

    private void Log(string message)
    {
        if (InvokeRequired)
        {
            BeginInvoke(() => Log(message));
            return;
        }

        _log.AppendText($"[{DateTime.Now:HH:mm:ss}] {message}{Environment.NewLine}");
    }

    private string ChoosePdfOutputPath(PrintJob job, string sourceFile)
    {
        if (InvokeRequired)
        {
            return (string)Invoke(() => ChoosePdfOutputPath(job, sourceFile));
        }

        var tokenId = string.IsNullOrWhiteSpace(job.TokenId) ? $"order-{job.Id}" : job.TokenId;
        using var dialog = new SaveFileDialog
        {
            Title = $"Save test print - {tokenId}",
            Filter = "PDF file (*.pdf)|*.pdf|All files (*.*)|*.*",
            FileName = $"{tokenId}-{Path.GetFileNameWithoutExtension(sourceFile)}.pdf",
            InitialDirectory = Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments),
            OverwritePrompt = true,
            AddExtension = true,
            DefaultExt = "pdf",
        };

        return dialog.ShowDialog(this) == DialogResult.OK ? dialog.FileName : "";
    }

    private bool ConfirmCashPrint(PrintJob job)
    {
        if (InvokeRequired)
        {
            return (bool)Invoke(() => ConfirmCashPrint(job));
        }

        using var dialog = new CashApprovalDialog(job);
        return dialog.ShowDialog() == DialogResult.OK;
    }
}

internal static class AgentPaths
{
    public static readonly string ConfigDir = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
        "CafeMitra",
        "PrintPilotAgentCSharp"
    );

    public static readonly string JobsDir = Path.Combine(ConfigDir, "jobs");
    public static readonly string PrintedOutputDir = Path.Combine(ConfigDir, "printed-output");
    public static readonly string ConfigPath = Path.Combine(ConfigDir, "config.json");
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

internal static class JsonDefaults
{
    public static readonly JsonSerializerOptions Options = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };
}

internal sealed class AgentStatusSnapshot
{
    public string App { get; set; } = "";
    public string Status { get; set; } = "stopped";
    public string Account { get; set; } = "";
    public string Printer { get; set; } = "";
    public IReadOnlyList<string> Printers { get; set; } = [];
    public string ApiBaseUrl { get; set; } = "";
    public string LastCheckAt { get; set; } = "";
    public bool CsharpAgent { get; set; }
}

internal sealed class LocalStatusServer(Func<AgentStatusSnapshot> statusProvider, Func<string, AgentStatusSnapshot> savePrinter, Func<LocalTestPrintRequest, LocalTestPrintResult> testPrint, Func<LocalTestPrintRequest, LocalTestPrintResult> posterPrint, Action<string> log) : IDisposable
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
            log("Local status API listening on http://127.0.0.1:8765/status");
        }
        catch (Exception error)
        {
            log($"Local status API could not start: {error.Message}");
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
                log($"Local status API error: {error.Message}");
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
                var buffer = new char[contentLength];
                if (contentLength > 0)
                {
                    await reader.ReadBlockAsync(buffer, token);
                }

                var payload = JsonSerializer.Deserialize<LocalSettingsRequest>(new string(buffer), JsonDefaults.Options) ?? new LocalSettingsRequest();
                await WriteJson(stream, savePrinter(payload.Printer ?? ""), token);
                return;
            }

            if (method == "POST" && path.StartsWith("/test-print", StringComparison.OrdinalIgnoreCase))
            {
                var buffer = new char[contentLength];
                if (contentLength > 0)
                {
                    await reader.ReadBlockAsync(buffer, token);
                }

                var payload = JsonSerializer.Deserialize<LocalTestPrintRequest>(new string(buffer), JsonDefaults.Options) ?? new LocalTestPrintRequest();
                await WriteJson(stream, testPrint(payload), token);
                return;
            }

            if (method == "POST" && path.StartsWith("/poster-print", StringComparison.OrdinalIgnoreCase))
            {
                var buffer = new char[contentLength];
                if (contentLength > 0)
                {
                    await reader.ReadBlockAsync(buffer, token);
                }

                var payload = JsonSerializer.Deserialize<LocalTestPrintRequest>(new string(buffer), JsonDefaults.Options) ?? new LocalTestPrintRequest();
                await WriteJson(stream, posterPrint(payload), token);
                return;
            }

            await WriteResponse(stream, 404, "{\"message\":\"Not found\"}", token);
        }
        catch (Exception error)
        {
            await WriteResponse(stream, 500, JsonSerializer.Serialize(new { message = error.Message }, JsonDefaults.Options), token);
        }
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

internal sealed class LocalSettingsRequest
{
    public string? Printer { get; set; }
}

internal sealed class LocalTestPrintRequest
{
    public string? Printer { get; set; }
    public string? ShopName { get; set; }
    public string? ShopCode { get; set; }
    public string? QrUrl { get; set; }
    public string? QrImage { get; set; }
}

internal sealed class LocalTestPrintResult
{
    public string Message { get; set; } = "";
    public string Printer { get; set; } = "";
    public string PrintedAt { get; set; } = "";
    public IReadOnlyList<string> Printers { get; set; } = [];
}

internal sealed class CafeMitraApi(HttpClient http, AgentConfig config, string configPath)
{
    public async Task<AuthResponse> Login(string email, string password)
    {
        var response = await SendJson<AuthResponse>(
            HttpMethod.Post,
            "api/auth/login/",
            new { email, password },
            CancellationToken.None,
            auth: false
        );

        if (response is null || string.IsNullOrWhiteSpace(response.Token))
        {
            throw new InvalidOperationException("Login response token missing.");
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
        await SendJson<JsonElement>(
            HttpMethod.Post,
            $"api/agent/jobs/{orderId}/status/",
            new { status, message },
            token
        );
    }

    public async Task ApproveCashOrder(int orderId, CancellationToken token)
    {
        await SendJson<JsonElement>(HttpMethod.Post, $"api/orders/{orderId}/approve-cash/", null, token);
    }

    public async Task RejectCashOrder(int orderId, CancellationToken token)
    {
        await SendJson<JsonElement>(HttpMethod.Post, $"api/orders/{orderId}/reject-cash/", null, token);
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
            request.Headers.UserAgent.ParseAdd("CafeMitra-PrintPilot-CSharp/0.2");
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
        request.Headers.UserAgent.ParseAdd("CafeMitra-PrintPilot-CSharp/0.2");

        using var response = await http.SendAsync(request, token);
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
        request.Headers.UserAgent.ParseAdd("CafeMitra-PrintPilot-CSharp/0.2");
        if (!string.IsNullOrWhiteSpace(config.AccessToken))
        {
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", config.AccessToken);
        }
    }

    private static StringContent JsonBody(object body)
    {
        var json = JsonSerializer.Serialize(body, JsonDefaults.Options);
        return new StringContent(json, Encoding.UTF8, "application/json");
    }
}

internal sealed class CashApprovalDialog : Form
{
    public CashApprovalDialog(PrintJob job)
    {
        Text = "Reptigo PrintPilot";
        ClientSize = new Size(540, 420);
        MinimumSize = new Size(520, 430);
        StartPosition = FormStartPosition.Manual;
        FormBorderStyle = FormBorderStyle.FixedDialog;
        MaximizeBox = false;
        MinimizeBox = false;
        ShowInTaskbar = true;
        TopMost = true;
        Font = new Font("Segoe UI", 10);
        BackColor = Color.White;
        AcceptButton = null;
        CancelButton = null;

        var brand = Color.FromArgb(4, 21, 73);
        var accent = Color.FromArgb(87, 64, 237);
        var soft = Color.FromArgb(246, 248, 252);
        var muted = Color.FromArgb(82, 96, 130);

        var root = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            Padding = new Padding(24),
            ColumnCount = 1,
            RowCount = 6,
        };
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.Absolute, 108));
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.Absolute, 52));
        Controls.Add(root);

        var title = new Label
        {
            Text = "Reptigo",
            AutoSize = true,
            Font = new Font("Segoe UI", 20, FontStyle.Bold),
            ForeColor = brand,
        };
        root.Controls.Add(title);

        root.Controls.Add(new Label
        {
            Text = "Cash counter print request",
            AutoSize = true,
            Font = new Font("Segoe UI", 11, FontStyle.Bold),
            ForeColor = accent,
            Padding = new Padding(0, 0, 0, 4),
        });

        root.Controls.Add(new Label
        {
            Text = $"Customer se Rs. {job.TotalAmount:0.##} cash payment collect karke hi print confirm karein.",
            AutoSize = true,
            MaximumSize = new Size(460, 0),
            ForeColor = muted,
            Padding = new Padding(0, 0, 0, 10),
        });

        var details = new Panel
        {
            Dock = DockStyle.Fill,
            BackColor = soft,
            Padding = new Padding(16),
            Margin = new Padding(0, 0, 0, 0),
        };
        root.Controls.Add(details);

        var detailText = new Label
        {
            Dock = DockStyle.Fill,
            ForeColor = brand,
            Font = new Font("Segoe UI", 10, FontStyle.Bold),
            Text =
                $"{DisplayToken(job)}\n" +
                $"{DisplayFile(job)}\n" +
                $"{job.Pages} x {job.Copies} page(s) | Rs. {job.TotalAmount:0.##}",
        };
        details.Controls.Add(detailText);

        root.Controls.Add(new Label
        {
            Text = "Payment received? Ready to print this page now?",
            AutoSize = true,
            MaximumSize = new Size(460, 0),
            ForeColor = muted,
            Padding = new Padding(0, 14, 0, 8),
        });

        var actions = new FlowLayoutPanel
        {
            Dock = DockStyle.Fill,
            FlowDirection = FlowDirection.RightToLeft,
            WrapContents = false,
            Padding = new Padding(0, 4, 0, 0),
        };
        root.Controls.Add(actions);

        var yes = new Button
        {
            Text = "Yes, print",
            DialogResult = DialogResult.OK,
            BackColor = accent,
            ForeColor = Color.White,
            FlatStyle = FlatStyle.Flat,
            Width = 118,
            Height = 38,
        };
        yes.FlatAppearance.BorderSize = 0;

        var no = new Button
        {
            Text = "Not now",
            DialogResult = DialogResult.No,
            BackColor = Color.FromArgb(252, 233, 237),
            ForeColor = Color.FromArgb(199, 48, 75),
            FlatStyle = FlatStyle.Flat,
            Width = 102,
            Height = 38,
        };
        no.FlatAppearance.BorderSize = 0;

        actions.Controls.Add(yes);
        actions.Controls.Add(no);
    }

    protected override void OnLoad(EventArgs e)
    {
        base.OnLoad(e);
        var screen = Screen.FromPoint(Cursor.Position).WorkingArea;
        Location = new Point(
            screen.Left + (screen.Width - Width) / 2,
            screen.Top + (screen.Height - Height) / 2
        );
    }

    protected override void OnShown(EventArgs e)
    {
        base.OnShown(e);
        WindowState = FormWindowState.Normal;
        BringToFront();
        Activate();
    }

    private static string DisplayToken(PrintJob job)
    {
        return string.IsNullOrWhiteSpace(job.TokenId) ? $"Order {job.Id}" : job.TokenId;
    }

    private static string DisplayFile(PrintJob job)
    {
        return string.IsNullOrWhiteSpace(job.FileName) ? job.OrderNumber : job.FileName;
    }
}

internal sealed class PrintWorker(CafeMitraApi api, AgentConfig config, Action<string> log, Func<PrintJob, string, string> choosePdfOutputPath, Func<PrintJob, bool> confirmCashPrint)
{
    public async Task ProcessOnce(CancellationToken token)
    {
        var jobs = await api.FetchJobs(token);
        if (jobs.Count == 0)
        {
            log("No queued jobs.");
            return;
        }

        log($"Found {jobs.Count} job(s).");
        foreach (var job in jobs)
        {
            log(
                $"Fetched job: token={job.TokenId}, order={job.OrderNumber}, service={job.ServiceName}, rate={job.PriceLabel}, mode={job.PrintColorModeLabel}, file={job.FileName}, pages={job.Pages}, copies={job.Copies}, amount=Rs. {job.TotalAmount}, payment={job.PaymentStatus}, url={job.DownloadUrl}"
            );
            await ProcessJob(job, token);
        }
    }

    private async Task ProcessJob(PrintJob job, CancellationToken token)
    {
        if (job.Id <= 0 || string.IsNullOrWhiteSpace(job.DownloadUrl))
        {
            log("Skipped malformed job.");
            return;
        }

        var tokenId = string.IsNullOrWhiteSpace(job.TokenId) ? $"Order {job.Id}" : job.TokenId;
        var fileName = SafeFileName(string.IsNullOrWhiteSpace(job.FileName) ? $"order-{job.Id}.pdf" : job.FileName);
        var destination = Path.Combine(AgentPaths.JobsDir, $"{job.Id}-{fileName}");

        try
        {
            if (job.IsCashApprovalPending)
            {
                log($"{tokenId}: waiting for cash confirmation.");
                var approved = confirmCashPrint(job);
                if (!approved)
                {
                    await api.RejectCashOrder(job.Id, token);
                    log($"{tokenId}: cash print rejected from Reptigo popup.");
                    return;
                }

                await api.ApproveCashOrder(job.Id, token);
                log($"{tokenId}: cash collected confirmation accepted.");
            }

            log($"{tokenId}: downloading {fileName}");
            await api.DownloadFile(job.DownloadUrl, destination, token);
            var downloaded = new FileInfo(destination);
            log($"{tokenId}: downloaded to {destination} ({downloaded.Length} bytes)");
            log($"{tokenId}: requested print mode {job.PrintColorModeLabel}");

            log($"{tokenId}: sending to {config.PrinterName}");
            await api.UpdateStatus(job.Id, "printing", $"Sent to {config.PrinterName}", token);

            var printResult = PrinterService.PrintFile(destination, config.PrinterName, job, choosePdfOutputPath);
            log($"{tokenId}: {printResult}");
            await Task.Delay(TimeSpan.FromSeconds(Math.Max(config.PrintSettleSeconds, 0)), token);

            await api.UpdateStatus(job.Id, "printed", printResult, token);
            log($"{tokenId}: printed");
        }
        catch (Exception error)
        {
            log($"{tokenId}: failed - {error.Message}");
            await api.UpdateStatus(job.Id, "failed", error.Message, token);
        }
    }

    private static string SafeFileName(string value)
    {
        var invalid = Path.GetInvalidFileNameChars();
        var cleaned = new string(value.Select(ch => invalid.Contains(ch) ? '_' : ch).ToArray()).Trim();
        return string.IsNullOrWhiteSpace(cleaned) ? "print-job.pdf" : cleaned;
    }
}

internal static class PrinterService
{
    [DllImport("shell32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern nint ShellExecuteW(
        nint hwnd,
        string lpOperation,
        string lpFile,
        string lpParameters,
        string lpDirectory,
        int nShowCmd
    );

    public static IReadOnlyList<string> ListPrinters()
    {
        if (!OperatingSystem.IsWindows())
        {
            return [];
        }

        var startInfo = new ProcessStartInfo
        {
            FileName = "powershell.exe",
            Arguments = "-NoProfile -Command \"Get-Printer | Select-Object -ExpandProperty Name\"",
            UseShellExecute = false,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            CreateNoWindow = true,
        };

        using var process = Process.Start(startInfo);
        if (process is null)
        {
            return [];
        }

        var output = process.StandardOutput.ReadToEnd();
        process.WaitForExit(10000);
        return output
            .Split(Environment.NewLine, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(name => !string.IsNullOrWhiteSpace(name))
            .ToArray();
    }

    public static string PrintFile(string filePath, string printerName, PrintJob job, Func<PrintJob, string, string> choosePdfOutputPath)
    {
        if (!OperatingSystem.IsWindows())
        {
            throw new PlatformNotSupportedException("Printing is supported only on Windows.");
        }

        if (!File.Exists(filePath))
        {
            throw new FileNotFoundException("Print file not found.", filePath);
        }

        if (string.IsNullOrWhiteSpace(printerName))
        {
            throw new InvalidOperationException("Printer name is required.");
        }

        if (printerName.Equals("Microsoft Print to PDF", StringComparison.OrdinalIgnoreCase))
        {
            var output = choosePdfOutputPath(job, filePath);
            if (string.IsNullOrWhiteSpace(output))
            {
                throw new InvalidOperationException("Microsoft Print to PDF save cancelled.");
            }
            File.Copy(filePath, output, overwrite: true);
            return $"Test print saved for Microsoft Print to PDF ({job.PrintColorModeLabel}): {output}";
        }

        var colorResult = ApplyColorMode(printerName, job.PrintColorMode);
        var copies = Math.Max(job.Copies, 1);
        for (var copy = 1; copy <= copies; copy++)
        {
            var result = ShellExecuteW(
                nint.Zero,
                "printto",
                filePath,
                $"\"{printerName}\"",
                Path.GetDirectoryName(filePath) ?? "",
                0
            );

            if (result <= 32)
            {
                throw new InvalidOperationException($"Windows print command failed for copy {copy} of {copies}. ShellExecute code: {result}.");
            }
        }

        return $"Windows print command accepted for {printerName} ({copies} cop{(copies == 1 ? "y" : "ies")}). {colorResult}";
    }

    public static string PrintQrTestPage(string printerName, string shopName, string shopCode, string qrUrl, string qrImage)
    {
        return PrintQrPage(
            printerName,
            shopName,
            shopCode,
            qrUrl,
            qrImage,
            $"CafeMitra PrintPilot Test - {shopCode}",
            "CafeMitra PrintPilot Test Page",
            includePrinterLine: true,
            successMessage: $"QR test page sent to {printerName}."
        );
    }

    public static string PrintQrPoster(string printerName, string shopName, string shopCode, string qrUrl, string qrImage)
    {
        return PrintQrPage(
            printerName,
            shopName,
            shopCode,
            qrUrl,
            qrImage,
            $"CafeMitra QR Poster - {shopCode}",
            "Scan to upload print documents",
            includePrinterLine: false,
            successMessage: $"QR poster sent to {printerName}."
        );
    }

    private static string PrintQrPage(string printerName, string shopName, string shopCode, string qrUrl, string qrImage, string documentName, string subtitle, bool includePrinterLine, string successMessage)
    {
        if (!OperatingSystem.IsWindows())
        {
            throw new PlatformNotSupportedException("Printing is supported only on Windows.");
        }

        if (string.IsNullOrWhiteSpace(printerName))
        {
            throw new InvalidOperationException("Printer name is required.");
        }

        using var document = new PrintDocument();
        document.PrinterSettings.PrinterName = printerName;
        document.DocumentName = documentName;
        document.PrintPage += (_, eventArgs) =>
        {
            if (eventArgs.Graphics is null) return;

            var bounds = eventArgs.MarginBounds;
            eventArgs.Graphics.FillRectangle(Brushes.White, eventArgs.PageBounds);
            using var titleFont = new Font("Arial", 24, FontStyle.Bold);
            using var subtitleFont = new Font("Arial", 12, FontStyle.Bold);
            using var bodyFont = new Font("Arial", 10, FontStyle.Regular);
            using var smallFont = new Font("Arial", 8, FontStyle.Regular);
            using var posterTitleFont = new Font("Arial", 28, FontStyle.Bold);
            using var posterSubtitleFont = new Font("Arial", 15, FontStyle.Bold);
            using var posterCodeFont = new Font("Arial", 18, FontStyle.Bold);
            using var brandBrush = new SolidBrush(Color.FromArgb(13, 23, 72));
            using var accentBrush = new SolidBrush(Color.FromArgb(87, 64, 237));
            using var orangeBrush = new SolidBrush(Color.FromArgb(255, 123, 26));
            using var mutedBrush = new SolidBrush(Color.FromArgb(89, 101, 140));
            using var softBrush = new SolidBrush(Color.FromArgb(245, 247, 252));
            using var whiteBrush = new SolidBrush(Color.White);
            using var borderPen = new Pen(Color.FromArgb(214, 221, 236), 2);

            if (!includePrinterLine)
            {
                var content = new Rectangle(bounds.Left, bounds.Top, bounds.Width, bounds.Height);
                eventArgs.Graphics.FillRectangle(softBrush, content);

                var poster = new Rectangle(content.Left + 18, content.Top + 18, content.Width - 36, content.Height - 36);
                eventArgs.Graphics.FillRectangle(whiteBrush, poster);
                eventArgs.Graphics.DrawRectangle(borderPen, poster);

                var header = new Rectangle(poster.Left, poster.Top, poster.Width, 150);
                eventArgs.Graphics.FillRectangle(accentBrush, header);
                DrawCentered(eventArgs.Graphics, shopName, posterTitleFont, whiteBrush, header.Left + 24, header.Width - 48, header.Top + 32);
                DrawCentered(eventArgs.Graphics, "Scan. Upload. Pay. Print.", posterSubtitleFont, orangeBrush, header.Left + 24, header.Width - 48, header.Top + 88);

                var posterQrSize = Math.Min(330, Math.Min(poster.Width - 110, poster.Height - 330));
                var posterQrX = poster.Left + (poster.Width - posterQrSize) / 2;
                var posterQrY = header.Bottom + 54;
                var qrCard = new Rectangle(posterQrX - 24, posterQrY - 24, posterQrSize + 48, posterQrSize + 48);
                eventArgs.Graphics.FillRectangle(whiteBrush, qrCard);
                eventArgs.Graphics.DrawRectangle(borderPen, qrCard);

                using var posterQrBitmap = DecodeDataUrlImage(qrImage);
                if (posterQrBitmap is not null)
                {
                    eventArgs.Graphics.DrawImage(posterQrBitmap, posterQrX, posterQrY, posterQrSize, posterQrSize);
                    var badge = new Rectangle(posterQrX + (posterQrSize - 150) / 2, posterQrY + (posterQrSize - 38) / 2, 150, 38);
                    eventArgs.Graphics.FillRectangle(whiteBrush, badge);
                    eventArgs.Graphics.DrawRectangle(borderPen, badge);
                    DrawCentered(eventArgs.Graphics, "CafeMitra", subtitleFont, brandBrush, badge.Left, badge.Width, badge.Top + 5);
                }
                else
                {
                    DrawCentered(eventArgs.Graphics, "QR not available", subtitleFont, accentBrush, posterQrX, posterQrSize, posterQrY + (posterQrSize / 2) - 10);
                }

                var footerY = qrCard.Bottom + 34;
                DrawCentered(eventArgs.Graphics, string.IsNullOrWhiteSpace(shopCode) ? "CafeMitra" : shopCode, posterCodeFont, brandBrush, poster.Left, poster.Width, footerY);
                DrawCentered(eventArgs.Graphics, "Upload documents from your phone", subtitleFont, mutedBrush, poster.Left, poster.Width, footerY + 38);
                eventArgs.Graphics.FillRectangle(brandBrush, poster.Left + 54, poster.Bottom - 88, poster.Width - 108, 48);
                DrawCentered(eventArgs.Graphics, "CafeMitra PrintPilot", subtitleFont, whiteBrush, poster.Left + 54, poster.Width - 108, poster.Bottom - 78);
                eventArgs.HasMorePages = false;
                return;
            }

            var y = bounds.Top;
            DrawCentered(eventArgs.Graphics, shopName, titleFont, brandBrush, bounds.Left, bounds.Width, y);
            y += 42;
            DrawCentered(eventArgs.Graphics, subtitle, subtitleFont, mutedBrush, bounds.Left, bounds.Width, y);
            y += 36;

            var qrSize = Math.Min(320, Math.Min(bounds.Width - 80, bounds.Height - 250));
            var qrX = bounds.Left + (bounds.Width - qrSize) / 2;
            using var qrBitmap = DecodeDataUrlImage(qrImage);
            eventArgs.Graphics.DrawRectangle(borderPen, qrX - 12, y - 12, qrSize + 24, qrSize + 24);
            if (qrBitmap is not null)
            {
                eventArgs.Graphics.DrawImage(qrBitmap, qrX, y, qrSize, qrSize);
            }
            else
            {
                DrawCentered(eventArgs.Graphics, "QR not available", subtitleFont, accentBrush, qrX, qrSize, y + (qrSize / 2) - 10);
            }

            y += qrSize + 38;
            DrawCentered(eventArgs.Graphics, string.IsNullOrWhiteSpace(shopCode) ? "CafeMitra" : shopCode, subtitleFont, accentBrush, bounds.Left, bounds.Width, y);
            y += 28;
            DrawCentered(eventArgs.Graphics, qrUrl, bodyFont, brandBrush, bounds.Left, bounds.Width, y);
            y += 32;
            if (includePrinterLine)
            {
                DrawCentered(eventArgs.Graphics, $"Printer: {printerName}", smallFont, mutedBrush, bounds.Left, bounds.Width, y);
                y += 18;
            }
            DrawCentered(eventArgs.Graphics, $"Printed: {DateTime.Now:dd MMM yyyy hh:mm tt}", smallFont, mutedBrush, bounds.Left, bounds.Width, y);
            eventArgs.HasMorePages = false;
        };

        document.Print();
        return successMessage;
    }

    private static Image? DecodeDataUrlImage(string dataUrl)
    {
        if (string.IsNullOrWhiteSpace(dataUrl))
        {
            return null;
        }

        var commaIndex = dataUrl.IndexOf(',');
        var base64 = commaIndex >= 0 ? dataUrl[(commaIndex + 1)..] : dataUrl;
        var bytes = Convert.FromBase64String(base64);
        return Image.FromStream(new MemoryStream(bytes));
    }

    private static void DrawCentered(Graphics graphics, string text, Font font, Brush brush, int x, int width, int y)
    {
        var rect = new RectangleF(x, y, width, font.GetHeight(graphics) + 8);
        using var format = new StringFormat { Alignment = StringAlignment.Center, LineAlignment = StringAlignment.Center };
        graphics.DrawString(text, font, brush, rect, format);
    }

    private static string ApplyColorMode(string printerName, PrintColorMode mode)
    {
        var colorArg = mode == PrintColorMode.Color ? "$true" : "$false";
        var escapedPrinter = printerName.Replace("'", "''");
        var command = $"Set-PrintConfiguration -PrinterName '{escapedPrinter}' -Color {colorArg}";
        var startInfo = new ProcessStartInfo
        {
            FileName = "powershell.exe",
            Arguments = $"-NoProfile -ExecutionPolicy Bypass -Command \"{command}\"",
            UseShellExecute = false,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            CreateNoWindow = true,
        };

        using var process = Process.Start(startInfo);
        if (process is null)
        {
            throw new InvalidOperationException("Could not start Windows printer color configuration command.");
        }

        var error = process.StandardError.ReadToEnd();
        process.WaitForExit(10000);
        if (process.ExitCode != 0)
        {
            throw new InvalidOperationException($"Could not set printer {mode.ToLabel()} mode. {error.Trim()}");
        }

        return $"Printer mode set to {mode.ToLabel()}.";
    }
}

internal enum PrintColorMode
{
    BlackWhite,
    Color,
}

internal static class PrintColorModeExtensions
{
    public static string ToLabel(this PrintColorMode mode)
    {
        return mode == PrintColorMode.Color ? "Color" : "Black & White";
    }
}

internal sealed class JobListResponse
{
    public List<PrintJob> Jobs { get; set; } = [];
}

internal sealed class PrintJob
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = "";
    public string TokenId { get; set; } = "";
    public int TokenNumber { get; set; }
    public string ShopCode { get; set; } = "";
    public string ServiceKey { get; set; } = "";
    public string ServiceName { get; set; } = "";
    public string PriceItemId { get; set; } = "";
    public string PriceLabel { get; set; } = "";
    public decimal Rate { get; set; }
    public int Pages { get; set; }
    public int Copies { get; set; }
    public decimal TotalAmount { get; set; }
    public string PaymentMode { get; set; } = "";
    public string PaymentStatus { get; set; } = "";
    public string Status { get; set; } = "";
    public string FileName { get; set; } = "";
    public string DownloadUrl { get; set; } = "";

    public bool IsCashApprovalPending =>
        PaymentStatus.Equals("cash_counter", StringComparison.OrdinalIgnoreCase)
        && Status.Equals("awaiting_approval", StringComparison.OrdinalIgnoreCase);

    public PrintColorMode PrintColorMode
    {
        get
        {
            var value = $"{PriceItemId} {PriceLabel}".ToLowerInvariant();
            if (value.Contains("color") && !value.Contains("black") && !value.Contains("white"))
            {
                return PrintColorMode.Color;
            }

            return PrintColorMode.BlackWhite;
        }
    }

    public string PrintColorModeLabel => PrintColorMode.ToLabel();
}

internal sealed class AuthResponse
{
    public string Token { get; set; } = "";
    public string RefreshToken { get; set; } = "";
    public AuthUser? User { get; set; }
}

internal sealed class AuthUser
{
    public string Id { get; set; } = "";
    public string Email { get; set; } = "";
    public string FullName { get; set; } = "";
    public string Phone { get; set; } = "";
}
