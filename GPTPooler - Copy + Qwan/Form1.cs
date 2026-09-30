using Microsoft.Web.WebView2.Core;
using System.Windows.Forms;

namespace GeminiPool;

public sealed class Form1 : Form
{
    private const int WorkerCount = 10;

    private readonly AgentConfig _config;
    private readonly string _configPath;
    private readonly List<GeminiWorker> _workers = new();
    private readonly SemaphoreSlim _clipboardLock = new(1, 1);
    private readonly HashSet<int> _claimedJobIds = new();
    private readonly object _dispatchLock = new();

    private System.Windows.Forms.Timer? _pollTimer;
    private CancellationTokenSource? _autoLoginStop;

    // ── UI controls ──────────────────────────────────────────────────
    private readonly Label _lblPoolStatus = new();
    private readonly Label _lblAccountStatus = new();
    private readonly Label _lblPriorityStatus = new();
    private string _lastPriorityText = "";
    private readonly TextBox _txtEmail = new();
    private readonly TextBox _txtPassword = new();
    private readonly Button _btnLogin = new();
    private readonly Button _btnLogout = new();
    private readonly TableLayoutPanel _grid = new();
    private readonly List<Label> _workerLabels = new();
    private readonly List<Button> _workerToggleButtons = new();
    private readonly List<Button> _workerClearButtons = new();
    private readonly List<CheckBox> _workerLoginChecks = new();
    private readonly TextBox _txtLog = new();

    public Form1()
    {
        Text = $"ChatGPT Pool - {WorkerCount} Worker Passport Photo Processor";
        Width = 1200;
        Height = 800;
        StartPosition = FormStartPosition.CenterScreen;

        Directory.CreateDirectory(AgentPaths.ConfigDir);
        Directory.CreateDirectory(AgentPaths.JobsDir);
        Directory.CreateDirectory(AgentPaths.WebViewDataDir);
        _configPath = AgentPaths.ConfigPath;
        _config = AgentConfig.Load(_configPath);

        BuildUi();
        Load += Form1_Load;
        FormClosing += Form1_FormClosing;
    }

    private void BuildUi()
    {
        var topPanel = new Panel { Dock = DockStyle.Top, Height = 40, Padding = new Padding(10) };

        _lblPoolStatus.AutoSize = true;
        _lblPoolStatus.Location = new Point(10, 12);
        _lblPoolStatus.Text = $"Workers: 0 / {WorkerCount} busy";

        _txtEmail.PlaceholderText = "Email";
        _txtEmail.Location = new Point(220, 8);
        _txtEmail.Width = 160;

        _txtPassword.PlaceholderText = "Password";
        _txtPassword.PasswordChar = '*';
        _txtPassword.Location = new Point(390, 8);
        _txtPassword.Width = 120;

        _btnLogin.Text = "Login";
        _btnLogin.Location = new Point(520, 6);
        _btnLogin.Width = 70;
        _btnLogin.Click += BtnLogin_Click;

        _btnLogout.Text = "Logout";
        _btnLogout.Location = new Point(596, 6);
        _btnLogout.Width = 70;
        _btnLogout.Click += BtnLogout_Click;

        _lblAccountStatus.AutoSize = true;
        _lblAccountStatus.Location = new Point(676, 12);
        _lblAccountStatus.Text = "Not logged in";

        topPanel.Controls.Add(_lblPoolStatus);
        topPanel.Controls.Add(_txtEmail);
        topPanel.Controls.Add(_txtPassword);
        topPanel.Controls.Add(_btnLogin);
        topPanel.Controls.Add(_btnLogout);
        _lblPriorityStatus.AutoSize = true;
        _lblPriorityStatus.Location = new Point(980, 12);
        _lblPriorityStatus.Text = "Priority: -";

        topPanel.Controls.Add(_lblAccountStatus);
        topPanel.Controls.Add(_lblPriorityStatus);

        _txtLog.Dock = DockStyle.Bottom;
        _txtLog.Height = 160;
        _txtLog.Multiline = true;
        _txtLog.ScrollBars = ScrollBars.Vertical;
        _txtLog.ReadOnly = true;

        _grid.Dock = DockStyle.Fill;
        _grid.CellBorderStyle = TableLayoutPanelCellBorderStyle.Single;

        const int columns = 5;
        var rows = (int)Math.Ceiling(WorkerCount / (double)columns);

        _grid.ColumnCount = columns;
        _grid.RowCount = rows;
        for (var c = 0; c < columns; c++)
        {
            _grid.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100f / columns));
        }
        for (var r = 0; r < rows; r++)
        {
            _grid.RowStyles.Add(new RowStyle(SizeType.Percent, 100f / rows));
        }

        for (var i = 0; i < WorkerCount; i++)
        {
            var worker = new GeminiWorker(i + 1, _clipboardLock);
            worker.StatusChanged += Worker_StatusChanged;
            _workers.Add(worker);

            var label = new Label
            {
                Dock = DockStyle.Fill,
                TextAlign = ContentAlignment.MiddleLeft,
                BackColor = SystemColors.ControlDark,
                ForeColor = SystemColors.ControlLightLight,
                Text = $"Worker {i + 1} - Idle",
            };
            _workerLabels.Add(label);

            var btnClear = new Button
            {
                Dock = DockStyle.Right,
                Width = 45,
                Text = "Clear",
            };
            btnClear.Click += (_, _) => BtnClearWorker_Click(worker, btnClear);
            _workerClearButtons.Add(btnClear);

            var btnToggle = new Button
            {
                Dock = DockStyle.Right,
                Width = 45,
                Text = "ON",
                BackColor = Color.LightGreen,
            };
            btnToggle.Click += (_, _) => BtnToggleWorker_Click(worker, btnToggle);
            _workerToggleButtons.Add(btnToggle);

            var chkLogin = new CheckBox
            {
                Dock = DockStyle.Right,
                Width = 60,
                Text = "Login",
                Checked = false,
            };
            chkLogin.CheckedChanged += (_, _) => worker.SetLoggedIn(chkLogin.Checked);
            _workerLoginChecks.Add(chkLogin);

            var header = new Panel { Dock = DockStyle.Top, Height = 24 };
            header.Controls.Add(btnClear);
            header.Controls.Add(btnToggle);
            header.Controls.Add(chkLogin);
            header.Controls.Add(label);

            var cell = new Panel { Dock = DockStyle.Fill };
            cell.Controls.Add(worker.WebView);
            cell.Controls.Add(header);
            worker.WebView.Dock = DockStyle.Fill;

            _grid.Controls.Add(cell, i % columns, i / columns);
        }

        Controls.Add(_grid);
        Controls.Add(_txtLog);
        Controls.Add(topPanel);
    }

    private void Worker_StatusChanged(GeminiWorker worker)
    {
        void Apply()
        {
            _workerLabels[worker.Index - 1].Text = $"Worker {worker.Index} - {worker.Status}";

            var toggleBtn = _workerToggleButtons[worker.Index - 1];
            toggleBtn.Text = worker.Enabled ? "ON" : "OFF";
            toggleBtn.BackColor = worker.Enabled ? Color.LightGreen : Color.LightCoral;

            var busyCount = _workers.Count(w => w.IsBusy);
            _lblPoolStatus.Text = $"Workers: {busyCount} / {WorkerCount} busy";
        }

        if (InvokeRequired)
        {
            BeginInvoke(Apply);
        }
        else
        {
            Apply();
        }
    }

    private void BtnToggleWorker_Click(GeminiWorker worker, Button button)
    {
        worker.SetEnabled(!worker.Enabled);
        LogStatus($"Worker {worker.Index}: turned {(worker.Enabled ? "ON" : "OFF")}.");
    }

    private async void BtnClearWorker_Click(GeminiWorker worker, Button button)
    {
        if (worker.IsBusy)
        {
            MessageBox.Show(
                $"Worker {worker.Index} is currently busy with a job. Wait for it to finish before clearing.",
                "Worker busy",
                MessageBoxButtons.OK,
                MessageBoxIcon.Warning
            );
            return;
        }

        var confirm = MessageBox.Show(
            $"This will log Worker {worker.Index} out and permanently delete its saved ChatGPT session/profile data (cookies, cache, local storage) on this computer, so a new account can be logged in. Continue?",
            "Clear worker profile",
            MessageBoxButtons.YesNo,
            MessageBoxIcon.Warning
        );
        if (confirm != DialogResult.Yes)
        {
            return;
        }

        button.Enabled = false;
        LogStatus($"Worker {worker.Index}: clearing profile...");
        try
        {
            var ok = await worker.ClearProfileAsync();
            LogStatus(ok
                ? $"Worker {worker.Index}: profile cleared. Ready for a new account."
                : $"Worker {worker.Index}: clear failed.");
        }
        finally
        {
            button.Enabled = true;
        }
    }

    private CafeMitraApi NewApi()
    {
        var http = new HttpClient { BaseAddress = new Uri(_config.ApiBaseUrl.TrimEnd('/') + "/"), Timeout = TimeSpan.FromMinutes(1) };
        return new CafeMitraApi(http, _config, _configPath);
    }

    // ── Login ────────────────────────────────────────────────────────

    private void UpdateAccountLabel()
    {
        var loggedIn = !string.IsNullOrWhiteSpace(_config.AccessToken);
        _lblAccountStatus.Text = loggedIn
            ? $"Logged in as {_config.OwnerName} ({_config.OwnerEmail})".Trim()
            : "Not logged in";
    }

    private async Task BootstrapLoginAsync()
    {
        if (!string.IsNullOrWhiteSpace(_config.AccessToken))
        {
            LogStatus("Saved session found, skipping login.");
            UpdateAccountLabel();
            return;
        }

        var saved = CredentialStore.Load();
        if (saved is null || string.IsNullOrWhiteSpace(saved.Email))
        {
            LogStatus("No saved login on this computer. Please log in once.");
            return;
        }

        _txtEmail.Text = saved.Email;
        await AutoLoginLoop(saved.Email, saved.Password);
    }

    private async Task AutoLoginLoop(string email, string password)
    {
        _autoLoginStop = new CancellationTokenSource();
        var token = _autoLoginStop.Token;
        var backoffSeconds = new[] { 3, 5, 10, 20, 30, 60 };
        var attempt = 0;

        while (!token.IsCancellationRequested)
        {
            attempt++;
            try
            {
                var api = NewApi();
                LogStatus(attempt == 1 ? $"Auto-login for {email}..." : $"Auto-login retry #{attempt} for {email}...");
                var response = await api.Login(email, password);
                _config.OwnerName = response.User?.FullName ?? "";
                _config.OwnerEmail = response.User?.Email ?? email;
                AgentConfig.Save(_configPath, _config);
                UpdateAccountLabel();
                LogStatus("Auto-login successful.");
                return;
            }
            catch (AuthenticationFailedException error)
            {
                LogStatus($"Saved login rejected by server: {error.Message}. Please log in manually.");
                return;
            }
            catch (Exception error)
            {
                LogStatus($"Still offline ({error.Message}). Will retry automatically.");
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

    private async void BtnLogin_Click(object? sender, EventArgs e)
    {
        _autoLoginStop?.Cancel();
        _btnLogin.Enabled = false;
        try
        {
            var email = _txtEmail.Text.Trim();
            var password = _txtPassword.Text;
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
            {
                LogStatus("Enter email and password.");
                return;
            }

            var api = NewApi();
            LogStatus($"Login request sending for {email}");
            var response = await api.Login(email, password);
            _config.OwnerName = response.User?.FullName ?? "";
            _config.OwnerEmail = response.User?.Email ?? email;
            AgentConfig.Save(_configPath, _config);

            CredentialStore.Save(email, password);

            UpdateAccountLabel();
            _txtPassword.Clear();
            LogStatus("Login successful. This device will sign in automatically next time.");
        }
        catch (AuthenticationFailedException error)
        {
            LogStatus($"Login failed: {error.Message}");
            MessageBox.Show(error.Message, "Login failed", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
        catch (Exception)
        {
            LogStatus("Login failed: could not reach the server.");
            MessageBox.Show(
                "Could not reach the server. Check the internet connection and try again.",
                "Login failed",
                MessageBoxButtons.OK,
                MessageBoxIcon.Warning
            );
        }
        finally
        {
            _btnLogin.Enabled = true;
        }
    }

    private async void BtnLogout_Click(object? sender, EventArgs e)
    {
        _autoLoginStop?.Cancel();
        await NotifyOfflineAsync();
        _config.AccessToken = "";
        _config.RefreshToken = "";
        AgentConfig.Save(_configPath, _config);
        CredentialStore.Clear();
        _txtPassword.Clear();
        UpdateAccountLabel();
        LogStatus("Logged out and removed the saved login from this computer.");
    }

    private async void Form1_Load(object? sender, EventArgs e)
    {
        LogStatus("Starting ChatGPT worker environment...");

        foreach (var worker in _workers)
        {
            try
            {
                var profileDir = Path.Combine(AgentPaths.WebViewDataDir, $"worker-{worker.Index}");
                Directory.CreateDirectory(profileDir);
                var env = await CoreWebView2Environment.CreateAsync(userDataFolder: profileDir);
                await worker.InitAsync(env);
            }
            catch (Exception ex)
            {
                LogStatus($"Worker {worker.Index}: failed to start - {ex.Message}");
            }
        }

        LogStatus($"All {WorkerCount} workers initialized.");
        UpdateAccountLabel();

        _pollTimer = new System.Windows.Forms.Timer { Interval = Math.Max(_config.PollIntervalSeconds, 3) * 1000 };
        _pollTimer.Tick += async (_, _) => await PollAsync();
        _pollTimer.Start();

        await BootstrapLoginAsync();

        _ = PollAsync();
    }

    private void Form1_FormClosing(object? sender, FormClosingEventArgs e)
    {
        _autoLoginStop?.Cancel();
        _pollTimer?.Stop();
        _pollTimer?.Dispose();

        // Hand over to the next pooler in priority order right away. Bounded
        // wait so a dead network never blocks closing the app - if this
        // doesn't get through, the server fails over on heartbeat timeout.
        try { Task.Run(NotifyOfflineAsync).Wait(TimeSpan.FromSeconds(3)); } catch { /* best effort */ }
    }

    private async Task NotifyOfflineAsync()
    {
        if (string.IsNullOrWhiteSpace(_config.AccessToken)) return;
        try
        {
            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(3));
            await NewApi().GoOffline(cts.Token);
        }
        catch
        {
            // Best effort - heartbeat timeout covers it.
        }
    }

    private void UpdatePriorityLabel(PoolerInfo? pooler)
    {
        var text = pooler is null
            ? "Priority: -"
            : !pooler.IsEnabled
                ? $"Priority {pooler.Priority} - DISABLED on server"
                : pooler.CanPull
                    ? $"Priority {pooler.Priority} - ACTIVE (pulling jobs)"
                    : $"Priority {pooler.Priority} - STANDBY (higher priority pooler online)";

        if (text == _lastPriorityText) return;
        _lastPriorityText = text;
        LogStatus(text);

        void Apply()
        {
            _lblPriorityStatus.Text = text;
            _lblPriorityStatus.ForeColor = pooler is { IsEnabled: true, CanPull: true } ? Color.DarkGreen : Color.DarkOrange;
        }

        if (InvokeRequired) BeginInvoke(Apply); else Apply();
    }

    // ── Dispatcher: poll every N seconds, hand jobs to idle workers ────

    private async Task PollAsync()
    {
        if (string.IsNullOrWhiteSpace(_config.AccessToken))
        {
            return; // Not logged in yet - nothing to fetch.
        }

        var api = NewApi();
        IReadOnlyList<PassportJob> jobs;
        try
        {
            int freeWorkers;
            lock (_dispatchLock)
            {
                freeWorkers = _workers.Count(w => w.LoggedIn && !w.IsBusy);
            }
            var response = await api.FetchPassportJobs(freeWorkers, WorkerCount, CancellationToken.None);
            jobs = response.Jobs;
            UpdatePriorityLabel(response.Pooler);
        }
        catch (Exception ex)
        {
            LogStatus($"Poll error: {ex.Message}");
            return;
        }

        foreach (var job in jobs)
        {
            if (job.Id <= 0) continue;

            GeminiWorker? worker = null;
            lock (_dispatchLock)
            {
                if (_claimedJobIds.Contains(job.Id)) continue;

                worker = SelectWorkerForDispatch();
                if (worker is null) break; // no eligible worker right now - retry remaining jobs next tick

                worker.MarkBusy($"Job #{job.Id}: claiming");
                _claimedJobIds.Add(job.Id);
            }

            _ = ProcessJobAsync(api, worker, job);
        }
    }

    /// Picks the next worker that should get a job: any logged-in, idle
    /// worker is fair game immediately, so a burst of requests fans out
    /// across every free worker at once instead of waiting on a rotation.
    /// A worker that is idle but manually switched OFF is turned back ON
    /// and handed the job anyway, so a stuck-off worker never blocks a
    /// request that's otherwise ready to run - only a worker still mid-job
    /// is actually unavailable. Must be called under _dispatchLock.
    private GeminiWorker? SelectWorkerForDispatch()
    {
        var idleLoggedInWorkers = _workers.Where(w => w.LoggedIn && !w.IsBusy).ToList();
        if (idleLoggedInWorkers.Count == 0) return null;

        var candidate = idleLoggedInWorkers.FirstOrDefault(w => w.Enabled)
            ?? idleLoggedInWorkers[0];

        if (!candidate.Enabled)
        {
            candidate.SetEnabled(true);
        }

        return candidate;
    }

    private async Task ProcessJobAsync(CafeMitraApi api, GeminiWorker worker, PassportJob job)
    {
        try
        {
            var claimed = await api.ClaimPassportJob(job.Id, CancellationToken.None);
            if (claimed is null || !claimed.Status.Equals("claimed", StringComparison.OrdinalIgnoreCase))
            {
                LogStatus($"Worker {worker.Index}: job #{job.Id} taken by another pooler, skipping.");
                return;
            }

            worker.MarkBusy($"Job #{job.Id}: downloading source");
            var sourcePath = Path.Combine(AgentPaths.JobsDir, $"passport-{job.Id}-source.jpg");
            await api.DownloadFile(job.OriginalImageUrl, sourcePath, CancellationToken.None);

            LogStatus($"Worker {worker.Index}: job #{job.Id} started (prompt: {job.Prompt}).");
            var generatedPath = await worker.RunJobAsync(sourcePath, job.Prompt, CancellationToken.None);

            if (generatedPath is null)
            {
                LogStatus($"Worker {worker.Index}: job #{job.Id} - Reptigo did not return a photo in time.");
                await api.FailPassportJob(job.Id, "Reptigo did not return a photo in time.", CancellationToken.None);
                return;
            }

            await api.CompletePassportJob(job.Id, generatedPath, CancellationToken.None);
            LogStatus($"Worker {worker.Index}: job #{job.Id} completed -> {generatedPath}");

            worker.MarkBusy($"Job #{job.Id}: starting new chat");
            await worker.StartNewChatAsync();
        }
        catch (Exception ex)
        {
            LogStatus($"Worker {worker.Index}: job #{job.Id} failed - {ex.Message}");
            try { await api.FailPassportJob(job.Id, ex.Message, CancellationToken.None); } catch { /* best effort */ }
        }
        finally
        {
            lock (_dispatchLock)
            {
                _claimedJobIds.Remove(job.Id);
            }
            worker.MarkIdle();
        }
    }

    // ── Log ──────────────────────────────────────────────────────────

    private void LogStatus(string msg)
    {
        System.Diagnostics.Debug.WriteLine($"[{DateTime.Now:HH:mm:ss}] {msg}");

        void Append() => _txtLog.AppendText($"[{DateTime.Now:HH:mm:ss}] {msg}{Environment.NewLine}");

        if (_txtLog.InvokeRequired)
        {
            _txtLog.BeginInvoke(Append);
        }
        else
        {
            Append();
        }
    }
}
