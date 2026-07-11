using System.Drawing;
using System.Drawing.Drawing2D;
using System.Windows.Forms;
using Microsoft.Win32;

namespace PrintPilotAgent;

internal sealed class AgentForm : Form
{
    private readonly AgentConfig _config;
    private readonly string _configPath;
    private readonly string _version;

    private readonly RoundedTextField _email = new();
    private readonly RoundedTextField _password = new(isPassword: true);
    private readonly Label _account = new();
    private readonly ComboBox _printers = new();
    private readonly FlatButton _login;
    private readonly FlatButton _refreshPrinters;
    private readonly FlatButton _printerSettings;
    private readonly FlatButton _savePrinter;
    private readonly FlatButton _startStop;
    private readonly FlatButton _logout;
    private readonly TextBox _log = new();
    private readonly StatusDot _statusDot = new();
    private readonly Label _statusLabel = new();
    private readonly LocalStatusServer _statusServer;

    private CancellationTokenSource? _workerStop;
    private CancellationTokenSource? _autoLoginStop;
    private bool _didAutoStart;
    private bool _isOnline;

    public AgentForm(AgentConfig config)
    {
        _config = config;
        _configPath = AgentPaths.ConfigPath;
        Directory.CreateDirectory(AgentPaths.ConfigDir);
        Directory.CreateDirectory(AgentPaths.JobsDir);
        _version = ReadLocalVersion();

        _statusServer = new LocalStatusServer(GetStatusSnapshot, SavePrinterFromLocalApi, RunTestPrintFromLocalApi, RunPosterPrintFromLocalApi, Log);

        _login = (FlatButton?)Theme.PillButton("Login", Theme.Accent, Color.White);
        _refreshPrinters = (FlatButton?)Theme.PillButton("Scan Printers", Color.White, Theme.Brand);
        _printerSettings = (FlatButton?)Theme.PillButton("Printer Settings", Color.White, Theme.Brand);
        _savePrinter = (FlatButton?)Theme.PillButton("Save Printer", Theme.Brand, Color.White);
        _startStop = (FlatButton?)Theme.PillButton("Start Agent", Theme.Success, Color.White);
        _logout = (FlatButton?)Theme.PillButton("Log out", Color.FromArgb(252, 233, 237), Theme.Danger);

        Text = "PrintPilot Agent";
        Width = 820;
        Height = 800;
        MinimumSize = new Size(760, 700);
        StartPosition = FormStartPosition.CenterScreen;
        Font = new Font("Segoe UI", 10);
        BackColor = Theme.Background;

        BuildUi();
        LoadConfigIntoUi();
        RefreshPrinterList();
        _statusServer.Start();
        EnsureWindowsStartup();
    }

    protected override void OnFormClosing(FormClosingEventArgs e)
    {
        _autoLoginStop?.Cancel();
        _workerStop?.Cancel();
        _statusServer.Dispose();
        base.OnFormClosing(e);
    }

    protected override void OnShown(EventArgs e)
    {
        base.OnShown(e);
        if (_didAutoStart) return;
        _didAutoStart = true;
        _ = BootstrapLoginAsync();
    }

    // ---------------------------------------------------------------- UI ---

    private void BuildUi()
    {
        var root = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            Padding = new Padding(24),
            ColumnCount = 1,
            RowCount = 6,
            BackColor = Theme.Background,
        };
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.Percent, 100));
        Controls.Add(root);

        // Header -------------------------------------------------------
        var header = new TableLayoutPanel { Dock = DockStyle.Top, AutoSize = true, ColumnCount = 2 };
        header.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
        header.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));

        var titleBlock = new FlowLayoutPanel { AutoSize = true, FlowDirection = FlowDirection.TopDown, WrapContents = false };
        titleBlock.Controls.Add(new Label
        {
            Text = "PrintPilot Agent",
            AutoSize = true,
            Font = new Font("Segoe UI", 20, FontStyle.Bold),
            ForeColor = Theme.Brand,
        });
        var statusRow = new FlowLayoutPanel { AutoSize = true, FlowDirection = FlowDirection.LeftToRight, WrapContents = false, Margin = new Padding(0, 4, 0, 0) };
        _statusDot.Margin = new Padding(2, 6, 6, 0);
        _statusLabel.AutoSize = true;
        _statusLabel.ForeColor = Theme.Muted;
        _statusLabel.Text = "Starting…";
        statusRow.Controls.Add(_statusDot);
        statusRow.Controls.Add(_statusLabel);
        titleBlock.Controls.Add(statusRow);
        header.Controls.Add(titleBlock, 0, 0);

        var versionLabel = new Label
        {
            Text = $"v{_version}",
            AutoSize = true,
            ForeColor = Theme.Muted,
            Font = new Font("Segoe UI", 9),
            Anchor = AnchorStyles.Top | AnchorStyles.Right,
        };
        header.Controls.Add(versionLabel, 1, 0);
        root.Controls.Add(header);

        root.Controls.Add(new Panel { Height = 12 });

        // Login card -----------------------------------------------------
        var loginCard = Theme.Card();
        loginCard.Dock = DockStyle.Top;
        loginCard.AutoSize = true;
        var loginLayout = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 3, AutoSize = true };
        loginLayout.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 42));
        loginLayout.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 42));
        loginLayout.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
        loginLayout.Controls.Add(SectionTitle("Login"), 0, 0);
        loginLayout.SetColumnSpan(loginLayout.Controls[0], 3);

        _email.Input.PlaceholderText = "owner@example.com";
        _email.Dock = DockStyle.Fill;
        loginLayout.Controls.Add(Field("Email", _email), 0, 1);

        _password.Input.PlaceholderText = "Password";
        _password.Dock = DockStyle.Fill;
        loginLayout.Controls.Add(Field("Password", _password), 1, 1);

        _login.Width = 110;
        _login.Margin = new Padding(10, 26, 0, 0);
        _login.Click += async (_, _) => await LoginAsync();
        loginLayout.Controls.Add(_login, 2, 1);

        _account.AutoSize = true;
        _account.ForeColor = Theme.Muted;
        _account.Padding = new Padding(0, 10, 0, 0);
        loginLayout.Controls.Add(_account, 0, 2);
        loginLayout.SetColumnSpan(_account, 2);

        _logout.Width = 100;
        _logout.Margin = new Padding(10, 6, 0, 0);
        _logout.Click += (_, _) => Logout();
        loginLayout.Controls.Add(_logout, 2, 2);

        loginCard.Controls.Add(loginLayout);
        root.Controls.Add(loginCard);
        root.Controls.Add(new Panel { Height = 14 });

        // Printer card -----------------------------------------------------
        var printerCard = Theme.Card();
        printerCard.Dock = DockStyle.Top;
        printerCard.AutoSize = true;
        var printerLayout = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 5, AutoSize = true };
        printerLayout.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
        printerLayout.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
        printerLayout.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
        printerLayout.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
        printerLayout.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
        printerLayout.Controls.Add(SectionTitle("Printer"), 0, 0);
        printerLayout.SetColumnSpan(printerLayout.Controls[0], 5);

        _printers.DropDownStyle = ComboBoxStyle.DropDownList;
        _printers.Dock = DockStyle.Fill;
        _printers.Height = 34;
        printerLayout.Controls.Add(Field("Selected printer", _printers), 0, 1);

        _refreshPrinters.Width = 130;
        _refreshPrinters.Margin = new Padding(10, 26, 0, 0);
        _refreshPrinters.Click += (_, _) => RefreshPrinterList();
        printerLayout.Controls.Add(_refreshPrinters, 1, 1);

        _printerSettings.Width = 140;
        _printerSettings.Margin = new Padding(10, 26, 0, 0);
        _printerSettings.Click += (_, _) => OpenPrinterSettings();
        printerLayout.Controls.Add(_printerSettings, 2, 1);

        _savePrinter.Width = 118;
        _savePrinter.Margin = new Padding(10, 26, 0, 0);
        _savePrinter.Click += (_, _) => SavePrinter();
        printerLayout.Controls.Add(_savePrinter, 3, 1);

        _startStop.Width = 118;
        _startStop.Margin = new Padding(10, 26, 0, 0);
        _startStop.Click += (_, _) => ToggleWorker();
        printerLayout.Controls.Add(_startStop, 4, 1);

        printerCard.Controls.Add(printerLayout);
        root.Controls.Add(printerCard);
        root.Controls.Add(new Panel { Height = 14 });

        // Log card -----------------------------------------------------
        var logCard = Theme.Card();
        logCard.Dock = DockStyle.Fill;
        var logLayout = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 1, RowCount = 2 };
        logLayout.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        logLayout.RowStyles.Add(new RowStyle(SizeType.Percent, 100));
        logLayout.Controls.Add(SectionTitle("Agent Logs"), 0, 0);

        _log.Multiline = true;
        _log.ReadOnly = true;
        _log.ScrollBars = ScrollBars.Vertical;
        _log.Dock = DockStyle.Fill;
        _log.BorderStyle = BorderStyle.None;
        _log.BackColor = Theme.Soft;
        _log.Font = new Font("Consolas", 9);
        logLayout.Controls.Add(_log, 0, 1);
        logCard.Controls.Add(logLayout);
        root.Controls.Add(logCard);

        Log("UI ready. Local bridge and agent will start automatically once logged in.");
    }

    private static Label SectionTitle(string text) => new()
    {
        Text = text,
        AutoSize = true,
        Font = new Font("Segoe UI", 12, FontStyle.Bold),
        ForeColor = Theme.Brand,
        Padding = new Padding(0, 0, 0, 10),
    };

    private static Control Field(string label, Control input)
    {
        var panel = new TableLayoutPanel { Dock = DockStyle.Fill, AutoSize = true, RowCount = 2, Margin = new Padding(0, 0, 10, 0) };
        panel.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        panel.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        panel.Controls.Add(new Label
        {
            Text = label,
            AutoSize = true,
            ForeColor = Theme.Muted,
            Font = new Font("Segoe UI", 9, FontStyle.Bold),
            Margin = new Padding(0, 0, 0, 4),
        }, 0, 0);
        input.Margin = new Padding(0);
        panel.Controls.Add(input, 0, 1);
        return panel;
    }

    private void LoadConfigIntoUi()
    {
        _email.Input.Text = _config.OwnerEmail;
        UpdateAccountLabel();
    }

    private void UpdateAccountLabel()
    {
        _account.Text = string.IsNullOrWhiteSpace(_config.AccessToken)
            ? "Not logged in"
            : $"Logged in as {_config.OwnerName} ({_config.OwnerEmail})".Trim();
    }

    private void SetStatus(string text, StatusKind kind)
    {
        if (InvokeRequired)
        {
            BeginInvoke(() => SetStatus(text, kind));
            return;
        }

        _isOnline = kind == StatusKind.Online;
        _statusLabel.Text = text;
        _statusDot.Kind = kind;
        _statusDot.Invalidate();
    }

    // ------------------------------------------------------------ Login ---

    private async Task BootstrapLoginAsync()
    {
        if (!string.IsNullOrWhiteSpace(_config.AccessToken))
        {
            Log("Saved session found, skipping login.");
            SetStatus("Signed in", StatusKind.Online);
            StartWorkerIfReady();
            return;
        }

        var saved = CredentialStore.Load();
        if (saved is null || string.IsNullOrWhiteSpace(saved.Email))
        {
            SetStatus("Waiting for login", StatusKind.Offline);
            Log("No saved login on this computer. Please log in once.");
            return;
        }

        _email.Input.Text = saved.Email;
        await AutoLoginLoop(saved.Email, saved.Password);
    }

    /// Retries login silently in the background when the shop's internet is
    /// down at startup. Never uses MessageBox here - only the Agent Logs
    /// panel is updated, so an unattended kiosk PC doesn't get stuck behind
    /// a popup nobody is there to dismiss.
    private async Task AutoLoginLoop(string email, string password)
    {
        _autoLoginStop = new CancellationTokenSource();
        var token = _autoLoginStop.Token;
        var backoffSeconds = new[] { 3, 5, 10, 20, 30, 60 };
        var attempt = 0;

        while (!token.IsCancellationRequested)
        {
            attempt++;
            SetStatus(attempt == 1 ? "Signing in…" : $"Offline - retry {attempt}", attempt == 1 ? StatusKind.Connecting : StatusKind.Offline);
            try
            {
                var api = NewApi();
                Log(attempt == 1 ? $"Auto-login for {email}…" : $"Auto-login retry #{attempt} for {email}…");
                var response = await api.Login(email, password);
                _config.OwnerName = response.User?.FullName ?? "";
                _config.OwnerEmail = response.User?.Email ?? email;
                AgentConfig.Save(_configPath, _config);
                UpdateAccountLabel();
                Log("Auto-login successful.");
                SetStatus("Signed in", StatusKind.Online);
                StartWorkerIfReady();
                return;
            }
            catch (AuthenticationFailedException error)
            {
                // Saved password is wrong / account changed - retrying won't
                // help, so stop and let the person type it in manually.
                Log($"Saved login rejected by server: {error.Message}. Please log in manually.");
                SetStatus("Login required", StatusKind.Offline);
                return;
            }
            catch (Exception error)
            {
                Log($"Still offline ({error.Message}). Will retry automatically.");
            }

            var delay = backoffSeconds[Math.Min(attempt - 1, backoffSeconds.Length - 1)];
            try
            {
                await Task.Delay(TimeSpan.FromSeconds(delay), token);
            }
            catch (OperationCanceledException)
            {
                return;
            }
        }
    }

    private async Task LoginAsync()
    {
        _autoLoginStop?.Cancel();
        _login.Enabled = false;
        try
        {
            var email = _email.Input.Text.Trim();
            var password = _password.Input.Text;
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
            {
                MessageBox.Show("Enter email and password.", "PrintPilot", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            var api = NewApi();
            Log($"Login request sending for {email}");
            var response = await api.Login(email, password);
            _config.OwnerName = response.User?.FullName ?? "";
            _config.OwnerEmail = response.User?.Email ?? email;
            AgentConfig.Save(_configPath, _config);

            // Remember this login (DPAPI-encrypted) so next launch is automatic.
            CredentialStore.Save(email, password);

            UpdateAccountLabel();
            _password.Input.Clear();
            Log("Login successful. This device will sign in automatically next time.");
            SetStatus("Signed in", StatusKind.Online);
            StartWorkerIfReady();
        }
        catch (AuthenticationFailedException error)
        {
            Log($"Login failed: {error.Message}");
            MessageBox.Show(error.Message, "Login failed", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
        catch (Exception error)
        {
            Log($"Login failed: {error.Message}");
            MessageBox.Show(
                "Could not reach the server. Check the internet connection and try again.",
                "Login failed",
                MessageBoxButtons.OK,
                MessageBoxIcon.Warning
            );
        }
        finally
        {
            _login.Enabled = true;
        }
    }

    private void Logout()
    {
        _autoLoginStop?.Cancel();
        StopWorker();
        _config.AccessToken = "";
        _config.RefreshToken = "";
        AgentConfig.Save(_configPath, _config);
        CredentialStore.Clear();
        _password.Input.Clear();
        UpdateAccountLabel();
        SetStatus("Waiting for login", StatusKind.Offline);
        Log("Logged out and removed the saved login from this computer.");
    }

    // ---------------------------------------------------------- Printer ---

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

    private void OpenPrinterSettings()
    {
        var selectedPrinter = Convert.ToString(_printers.SelectedItem) ?? _config.PrinterName;
        using var dialog = new PrinterSettingForm(selectedPrinter);
        dialog.ShowDialog(this);
    }

    // -------------------------------------------------------- Local API ---

    private AgentStatusSnapshot GetStatusSnapshot()
    {
        if (InvokeRequired)
        {
            return (AgentStatusSnapshot)Invoke(GetStatusSnapshot);
        }

        var printers = _printers.Items.Cast<object>().Select(Convert.ToString).Where(name => !string.IsNullOrWhiteSpace(name)).Cast<string>().ToArray();
        return new AgentStatusSnapshot
        {
            App = "PrintPilotAgent",
            Status = _workerStop is null ? "stopped" : "running",
            Account = string.IsNullOrWhiteSpace(_config.OwnerEmail) ? "" : $"{_config.OwnerName} {_config.OwnerEmail}".Trim(),
            Printer = _config.PrinterName,
            Printers = printers,
            ApiBaseUrl = _config.ApiBaseUrl,
            LastCheckAt = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
            Version = _version,
            Online = _isOnline,
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
            Log($"Printer saved from local dashboard: {_config.PrinterName}");
            StartWorkerIfReady();
        }

        return GetStatusSnapshot();
    }

    private LocalTestPrintResult RunTestPrintFromLocalApi(LocalTestPrintRequest request) => RunQrPrintFromLocalApi(request, isPoster: false);

    private LocalTestPrintResult RunPosterPrintFromLocalApi(LocalTestPrintRequest request) => RunQrPrintFromLocalApi(request, isPoster: true);

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

        var colorMode = ParseColorMode(request.ColorMode);
        var result = isPoster
            ? PrinterService.PrintQrPoster(printerName, request.ShopName ?? "CafeMitra Shop", request.ShopCode ?? "", request.QrUrl ?? "", request.QrImage ?? "", colorMode)
            : PrinterService.PrintQrTestPage(printerName, request.ShopName ?? "CafeMitra Shop", request.ShopCode ?? "", request.QrUrl ?? "", request.QrImage ?? "", colorMode);

        Log($"{(isPoster ? "Poster print" : "Test print")}: {result}");
        return new LocalTestPrintResult
        {
            Message = result,
            Printer = printerName,
            PrintedAt = DateTimeOffset.Now.ToString("O"),
            Printers = PrinterService.ListPrinters(),
        };
    }

    private static PrintColorMode ParseColorMode(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return PrintColorMode.BlackWhite;
        }

        return value.Trim().ToLowerInvariant() switch
        {
            "color" or "colour" or "c" => PrintColorMode.Color,
            _ => PrintColorMode.BlackWhite,
        };
    }

    // --------------------------------------------------------- Worker ---

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
        _startStop.BackColor = Theme.Success;
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
        _startStop.BackColor = Theme.Danger;
        Log("Agent started.");

        var api = NewApi();
        var worker = new PrintWorker(api, _config, Log, ChoosePdfOutputPath, ConfirmCashPrint);
        _ = Task.Run(async () => await WorkerLoop(worker, _workerStop.Token));
        return true;
    }

    private async Task WorkerLoop(PrintWorker worker, CancellationToken token)
    {
        while (!token.IsCancellationRequested)
        {
            try
            {
                await worker.ProcessOnce(token);
                SetStatus("Signed in", StatusKind.Online);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception error)
            {
                // Polling failure most commonly means the shop's internet
                // dropped mid-session - reflect it in the status dot but
                // never interrupt with a MessageBox.
                Log($"Agent error: {error.Message}");
                SetStatus("Offline - retrying", StatusKind.Offline);
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

    // ----------------------------------------------------------- Misc ---

    private void EnsureWindowsStartup()
    {
        if (!OperatingSystem.IsWindows())
        {
            return;
        }

        try
        {
            using var key = Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Run", writable: true);
            key?.SetValue("PrintPilot Agent", $"\"{Application.ExecutablePath}\"");
        }
        catch (Exception error)
        {
            Log($"Could not enable Windows startup: {error.Message}");
        }
    }

    private CafeMitraApi NewApi()
    {
        var http = new HttpClient { BaseAddress = new Uri(_config.ApiBaseUrl.TrimEnd('/') + "/"), Timeout = TimeSpan.FromSeconds(20) };
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

    private static string ReadLocalVersion()
    {
        try
        {
            var path = Path.Combine(AppContext.BaseDirectory, "version.txt");
            return File.Exists(path) ? File.ReadAllText(path).Trim() : "0";
        }
        catch
        {
            return "0";
        }
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

internal enum StatusKind { Online, Offline, Connecting }

/// Small colored dot next to the header - green (online), amber (connecting),
/// red (offline) - so the shop owner gets an at-a-glance signal without
/// reading the log.
internal sealed class StatusDot : Control
{
    public StatusKind Kind { get; set; } = StatusKind.Connecting;

    public StatusDot()
    {
        Size = new Size(10, 10);
        DoubleBuffered = true;
    }

    protected override void OnPaint(PaintEventArgs e)
    {
        base.OnPaint(e);
        e.Graphics.SmoothingMode = SmoothingMode.AntiAlias;
        var color = Kind switch
        {
            StatusKind.Online => Theme.Success,
            StatusKind.Offline => Theme.Danger,
            _ => Color.FromArgb(230, 162, 34),
        };
        using var brush = new SolidBrush(color);
        e.Graphics.FillEllipse(brush, 0, 0, Width - 1, Height - 1);
    }
}
