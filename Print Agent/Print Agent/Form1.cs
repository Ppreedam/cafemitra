using PDFtoImage;
using SkiaSharp;
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Printing;
using System.IO;
using System.Management;
using System.Text.Json;
using System.Windows.Forms;
using System.Drawing.Drawing2D;

namespace Print_Agent
{

    public partial class Form1 : Form
    {
        // ── Fields ────────────────────────────────────────────────────
        private System.Windows.Forms.Timer _pollTimer;
        private readonly System.Collections.Generic.HashSet<int> _printedIds
            = new System.Collections.Generic.HashSet<int>();

        // Job IDs this agent physically printed in a *previous* run, loaded
        // from AgentPaths.PrintedJobsPath at startup (see LoadPrintedJobIds).
        // _printedIds alone doesn't survive a restart - if the process died
        // between the printer accepting the job and the "printed" status
        // update reaching the server, the job is still "pending" server-side
        // and a fresh _printedIds would print it again on the next poll.
        // Anything in this set instead gets its status reconciled, never
        // reprinted - see PollAndPrintAsync/ReconcilePreviouslyPrintedJobAsync.
        private readonly System.Collections.Generic.HashSet<int> _recoveredPrintedIds
            = new System.Collections.Generic.HashSet<int>();

        private readonly AgentConfig _config;
        private readonly string _configPath;
        private LocalStatusServer _localServer;
        private WebSocketAgentClient _wsClient;
        private volatile bool _wsConnected;
        private System.Windows.Forms.Timer _wsBlinkTimer;
        private bool _wsBlinkBright;
        private static readonly Color WsBlinkGreenBright = Color.FromArgb(34, 197, 94);
        private static readonly Color WsBlinkGreenDim = Color.FromArgb(134, 239, 172);
        private static readonly Color WsBlinkAmberBright = Color.FromArgb(234, 179, 8);
        private static readonly Color WsBlinkAmberDim = Color.FromArgb(253, 224, 71);
        private volatile bool _printerOfflineAlertShown;
        private volatile bool _virtualPrinterAlertShown;
        private volatile bool _missingPresetAlertShown;
        // PollAndPrintAsync fires one ProcessJobAsync per job it finds
        // without awaiting them, so 2+ jobs from the same poll/push run
        // concurrently by default. They'd otherwise interleave through
        // state that isn't per-job - it's fields/controls on this one form
        // (selectedFile, cmbPrinters.SelectedItem, _pdfBytes, ...) - so job
        // B's download/print landing mid-await of job A's can silently swap
        // A's printer, paper size, or PDF bytes out from under it. This
        // gate makes each job run end-to-end (cash confirm through the
        // printed/failed status update) before the next one starts.
        private readonly SemaphoreSlim _printQueueGate = new(1, 1);
        private CancellationTokenSource _autoLoginStop;

        // Was Path.Combine(AppDomain.CurrentDomain.BaseDirectory,
        // "printer_settings.txt") - tied to wherever this exact copy of the
        // exe happens to be running from, unlike everything else (login,
        // credentials, jobs, logs), which all live under AgentPaths.ConfigDir
        // and survive a move/reinstall/update to a different folder. A shop
        // whose install ever moved (or who has more than one copy of the
        // exe, e.g. an old and a new build side by side) could see presets
        // that seem to "reset" or disagree with what the website shows,
        // with no obvious cause - login still worked fine, masking that this
        // one file didn't come along. See MigrateLegacySettingsFileIfNeeded.
        private static readonly string SettingsFilePath = AgentPaths.PrinterSettingsPath;

        private const string DefaultPaperSize = "A4";

        private string selectedFile = string.Empty;
        private Image imageToPrint;

        private byte[] _pdfBytes;
        private int _pdfPageCount;
        private int _currentPageIndex;

        // ── Tray ──────────────────────────────────────────────────────
        private NotifyIcon _trayIcon;
        private bool _isExiting;

        // ── Login-required reminder ──────────────────────────────────
        // Set when the saved auto-login is rejected by the server (e.g. the
        // account password changed elsewhere) - re-shown on a timer, not
        // just once, since a single balloon is easy to miss while the app
        // sits minimized in the tray. Cleared the moment a manual login
        // succeeds, from wherever it succeeds.
        private System.Windows.Forms.Timer _loginReminderTimer;
        private bool _loginReminderActive;

        // Small green checkmark badge + email line shown next to the
        // account status text once signed in - built in code (not the
        // Designer) since they're additions to an existing panel.
        private Label lblLoginBadge;
        private Label lblLoginEmail;
        private ToolTip _chipTip;

        // Set once from Program.cs when this launch came from Windows
        // sign-in (--autostart) - SetVisibleCore below uses it to skip
        // straight to the tray instead of flashing the window on screen.
        private readonly bool _startMinimized;
        private bool _initialVisibilityHandled;

        public Form1(bool startMinimized = false)
        {
            _startMinimized = startMinimized;

            InitializeComponent();
            ApplyTheme();
            LoadPrinters();

            Directory.CreateDirectory(AgentPaths.ConfigDir);
            Directory.CreateDirectory(AgentPaths.JobsDir);
            _configPath = AgentPaths.ConfigPath;
            _config = AgentConfig.Load(_configPath);

            InitTrayIcon();
        }

        // Intercepts the very first Show() that Application.Run() triggers -
        // returning false here means the window is never actually painted
        // on screen (not "shown then immediately hidden", which still
        // flashes). Only applies once; every later Show()/Hide() (manual
        // restore-from-tray, minimize, etc.) behaves normally.
        protected override void SetVisibleCore(bool value)
        {
            if (_startMinimized && !_initialVisibilityHandled)
            {
                _initialVisibilityHandled = true;
                base.SetVisibleCore(false);

                // base.SetVisibleCore(false) never actually shows the form,
                // so the window handle is not guaranteed to exist yet at
                // this point - calling BeginInvoke before it does throws
                // "Invoke or BeginInvoke cannot be called on a control
                // until the window handle has been created." Reading
                // Handle forces creation (it's a no-op if it already
                // exists), making the BeginInvoke below safe.
                _ = Handle;
                BeginInvoke(new Action(MinimizeToTray));
                return;
            }

            base.SetVisibleCore(value);
        }

        // ── Tray icon / minimize+close to tray ───────────────────────
        private void InitTrayIcon()
        {
            var trayMenu = new ContextMenuStrip();
            trayMenu.Items.Add("Open Print Agent", null, (s, e) => RestoreFromTray());
            trayMenu.Items.Add(new ToolStripSeparator());
            trayMenu.Items.Add("Exit", null, (s, e) =>
            {
                _isExiting = true;
                Close();
            });

            _trayIcon = new NotifyIcon
            {
                Icon = Icon,
                Text = "Print Agent",
                Visible = false,
                ContextMenuStrip = trayMenu
            };
            _trayIcon.DoubleClick += (s, e) => RestoreFromTray();
        }

        // ── Login-required reminder ───────────────────────────────────
        // A real, un-dismissable-by-Windows popup (LoginReminderForm below) -
        // not a NotifyIcon balloon, which Windows auto-hides after a few
        // seconds and is easy to miss entirely. Keeps reappearing on its own
        // schedule (self-rescheduling one-shot timer, not a fixed repeating
        // one) until a login actually succeeds: default follow-up is 5
        // minutes, but "Remind Me in 1 Hour" explicitly pushes the next one
        // out further.
        private static readonly TimeSpan LoginReminderDefaultDelay = TimeSpan.FromMinutes(5);
        private static readonly TimeSpan LoginReminderSnoozeDelay = TimeSpan.FromHours(1);

        private void StartLoginReminder()
        {
            if (_loginReminderActive) return; // already nagging - don't stack popups
            _loginReminderActive = true;
            ShowLoginReminderNow();
        }

        private void ShowLoginReminderNow()
        {
            if (!_loginReminderActive) return; // logged in elsewhere while this was pending

            var loginRequested = LoginReminderForm.ShowReminder();

            if (!_loginReminderActive) return; // StopLoginReminder() ran while the popup was open

            if (loginRequested)
            {
                RestoreFromTray();
                ScheduleNextLoginReminder(LoginReminderDefaultDelay);
            }
            else
            {
                ScheduleNextLoginReminder(LoginReminderSnoozeDelay);
            }
        }

        private void ScheduleNextLoginReminder(TimeSpan delay)
        {
            _loginReminderTimer?.Stop();
            _loginReminderTimer?.Dispose();

            _loginReminderTimer = new System.Windows.Forms.Timer { Interval = (int)delay.TotalMilliseconds };
            _loginReminderTimer.Tick += (s, e) =>
            {
                _loginReminderTimer.Stop();
                ShowLoginReminderNow();
            };
            _loginReminderTimer.Start();
        }

        private void StopLoginReminder()
        {
            if (!_loginReminderActive) return;
            _loginReminderActive = false;
            _loginReminderTimer?.Stop();
            _loginReminderTimer?.Dispose();
            _loginReminderTimer = null;
        }

        public void RestoreFromTray()
        {
            Show();
            WindowState = FormWindowState.Normal;
            ShowInTaskbar = true;
            Activate();
            BringToFront();
            _trayIcon.Visible = false;
        }

        private void MinimizeToTray()
        {
            Hide();
            ShowInTaskbar = false;
            _trayIcon.Visible = true;
        }

        protected override void OnResize(EventArgs e)
        {
            base.OnResize(e);
            if (WindowState == FormWindowState.Minimized)
            {
                MinimizeToTray();
            }
        }

        // ── Theme / Navigation ───────────────────────────────────────

        private void ApplyTheme()
        {
            Theme.StyleBrandButton(btnLogin);
            txtEmail.TextChanged += (s, e) => UpdateLoginButtonEnabled();
            txtPassword.TextChanged += (s, e) => UpdateLoginButtonEnabled();
            UpdateLoginButtonEnabled(); // starts disabled - both fields are empty
            Theme.StylePrimaryButton(btnPrint);
            Theme.StyleSecondaryButton(btnBrowse);
            Theme.StyleBrandButton(btnSavePrinterSetting);
            Theme.StyleIconButton(btnGear);
            Theme.StyleBackButton(btnBackFromSettings);
            MoveSignOutNextToSettings();

            Theme.StyleTextBox(txtEmail);
            Theme.StyleTextBox(txtPassword);
            Theme.StyleTextBox(txtFilePath);

            Theme.StyleCombo(cmbPageSize);
            Theme.StyleCombo(cmbColorType);
            Theme.StyleCombo(cmbPrinters);
            Theme.StyleCombo(cBoxSettingPage);
            Theme.StyleCombo(cBoxSettingColor);
            Theme.StyleCombo(cBoxSettingPrinter);

            Theme.StyleRoundedCard(pnlAccountCard);
            Theme.StyleRoundedCard(pnlLogsCard);
            Theme.StyleRoundedCard(pnlSettingsCard);

            SetupSignedInChip();
            ShowSettingsOverlay(false);

            // softwareVersion.Text (hidden - see VersionChecker) is the one
            // real source of truth for the build's version, already bumped
            // on every release for the update-check to work at all. label3
            // is only the human-visible "Version: N" text; it used to carry
            // its own separately-typed number and silently drifted out of
            // sync with softwareVersion (shipped v15 while still reading
            // "Version: 14" here). Deriving it removes the second place a
            // release has to remember to touch.
            label3.Text = $"Version: {softwareVersion.Text}";
        }

        // Chip location constants (relative to pnlAccountCard) for the
        // compact "signed in" row: a round check badge + two-line
        // name/email, replacing the login form once authenticated.
        private static readonly Point ChipBadgeLocation = new(20, 18);
        private static readonly Size ChipBadgeSize = new(32, 32);
        private static readonly Point ChipNameLocation = new(62, 16);
        private static readonly Point ChipEmailLocation = new(62, 36);
        private const int ChipContentWidth = 260; // btnLogout no longer shares this row (moved to the top bar)
        private const int LoggedInCardHeight = 70;
        private const int LoggedOutCardHeight = 300;

        // Builds the compact, hoverable "signed in" chip shown in place of
        // the login form once authenticated: a round check badge plus a
        // two-line name/email block. Hovering it highlights the row and
        // clicking it copies the account email to the clipboard - a small,
        // real bit of interactivity rather than a static status line.
        private void SetupSignedInChip()
        {
            lblLoginBadge = new Label
            {
                Text = "✓",
                Font = new Font("Segoe UI", 12F, FontStyle.Bold),
                ForeColor = Color.White,
                BackColor = Theme.Teal,
                TextAlign = ContentAlignment.MiddleCenter,
                Location = ChipBadgeLocation,
                Size = ChipBadgeSize,
                Cursor = Cursors.Hand,
                Visible = false,
            };
            var path = new GraphicsPath();
            path.AddEllipse(0, 0, lblLoginBadge.Width, lblLoginBadge.Height);
            lblLoginBadge.Region = new Region(path);

            lblLoginEmail = new Label
            {
                AutoSize = false,
                Font = Theme.FontLabel,
                ForeColor = Theme.TextMuted,
                Location = ChipEmailLocation,
                Size = new Size(ChipContentWidth, 18),
                AutoEllipsis = true,
                Cursor = Cursors.Hand,
                Visible = false,
            };

            pnlAccountCard.Controls.Add(lblLoginBadge);
            pnlAccountCard.Controls.Add(lblLoginEmail);
            lblLoginBadge.BringToFront();
            lblLoginEmail.BringToFront();

            void EnterHover(object s, EventArgs e) => SetChipHighlighted(true);
            void LeaveHover(object s, EventArgs e) => SetChipHighlighted(false);
            void Click(object s, EventArgs e) => CopyAccountEmailToClipboard();

            foreach (var c in new Control[] { lblLoginBadge, lblAccountStatus, lblLoginEmail })
            {
                c.MouseEnter += EnterHover;
                c.MouseLeave += LeaveHover;
                c.Click += Click;
            }

            _chipTip = new ToolTip { AutoPopDelay = 1500, InitialDelay = 0, ReshowDelay = 0 };
        }

        private void SetChipHighlighted(bool on)
        {
            var bg = on ? ColorTranslator.FromHtml("#F0FDFA") : Color.White;
            lblAccountStatus.BackColor = bg;
            lblLoginEmail.BackColor = bg;
        }

        // Blinks the signed-in badge (the round "✓" right before the account
        // name) so connection health is visible at a glance, right next to
        // the name where a shop owner is already looking: green while the
        // WebSocket push is live, amber while running on the poll fallback
        // (WS never connected yet, or dropped) - never a plain static color,
        // since that reads the same as "logged in" whether or not either
        // channel is actually delivering jobs. Must run on the UI thread;
        // callers marshal first.
        private void UpdateWsIndicator(bool wsConnected)
        {
            var (bright, dim) = wsConnected ? (WsBlinkGreenBright, WsBlinkGreenDim) : (WsBlinkAmberBright, WsBlinkAmberDim);

            if (_wsBlinkTimer == null)
            {
                _wsBlinkTimer = new System.Windows.Forms.Timer { Interval = 600 };
            }
            else
            {
                _wsBlinkTimer.Stop();
            }

            _wsBlinkTimer.Tag = (bright, dim);
            _wsBlinkTimer.Tick -= WsBlinkTick;
            _wsBlinkTimer.Tick += WsBlinkTick;

            _wsBlinkBright = true;
            lblLoginBadge.BackColor = bright;
            _wsBlinkTimer.Start();
        }

        private void WsBlinkTick(object sender, EventArgs e)
        {
            var (bright, dim) = ((Color, Color))_wsBlinkTimer.Tag;
            _wsBlinkBright = !_wsBlinkBright;
            lblLoginBadge.BackColor = _wsBlinkBright ? bright : dim;
        }

        private void CopyAccountEmailToClipboard()
        {
            if (string.IsNullOrWhiteSpace(_config.OwnerEmail)) return;

            Clipboard.SetText(_config.OwnerEmail);
            _chipTip.Show("Email copied", lblLoginEmail, lblLoginEmail.Width / 2, -28, 1200);
        }

        // Printer Setup lives out of the way, behind the gear icon in the
        // top-right corner, since day-to-day use is all on the Account page.
        private void ShowSettingsOverlay(bool show)
        {
            pnlSettings.Visible = show;
            pnlAccount.Visible = !show;
            (show ? (Control)pnlSettings : pnlAccount).BringToFront();
        }

        private void btnGear_Click(object sender, EventArgs e) => ShowSettingsOverlay(true);

        private void btnBackFromSettings_Click(object sender, EventArgs e) => ShowSettingsOverlay(false);

        // ── Login ─────────────────────────────────────────────────────

        private CafeMitraApi NewApi()
        {
            var http = new System.Net.Http.HttpClient { BaseAddress = new Uri(_config.ApiBaseUrl.TrimEnd('/') + "/"), Timeout = TimeSpan.FromSeconds(20) };
            return new CafeMitraApi(http, _config, _configPath);
        }

        private void UpdateLoginButtonEnabled()
        {
            btnLogin.Enabled = !string.IsNullOrWhiteSpace(txtEmail.Text) && !string.IsNullOrWhiteSpace(txtPassword.Text);
        }

        // Moved out of the main "Signed in" card and into the top bar, right
        // beside the settings gear - it used to sit as a full-width red
        // button in the main flow, easy to hit by mistake reaching for
        // something else. Now a small "⋮" overflow trigger next to the
        // gear - Sign Out itself only appears (red-highlighted, like any
        // destructive menu action) once that's deliberately opened.
        private void MoveSignOutNextToSettings()
        {
            pnlAccountCard.Controls.Remove(btnLogout);
            pnlTopBar.Controls.Add(btnLogout);
            btnLogout.BringToFront();

            // The Designer wires btnLogout.Click straight to the sign-out
            // logic (btnLogout_Click) - re-point that same click to open the
            // menu instead; the menu item below is what actually calls it.
            btnLogout.Click -= btnLogout_Click;

            Theme.StyleIconButton(btnLogout);
            btnLogout.Text = "⋮";
            btnLogout.Size = new Size(36, 36);
            btnLogout.Anchor = AnchorStyles.Top | AnchorStyles.Right;
            btnLogout.Location = new Point(btnGear.Left - btnLogout.Width - 6, btnGear.Top);

            var signOutMenu = new ContextMenuStrip();
            var signOutItem = new ToolStripMenuItem("Sign Out")
            {
                ForeColor = Theme.Danger,
                Font = Theme.FontLabelBold,
            };
            signOutItem.Click += (s, e) => btnLogout_Click(s, e);
            signOutMenu.Items.Add(signOutItem);

            btnLogout.Click += (s, e) => signOutMenu.Show(btnLogout, new Point(0, btnLogout.Height));
        }

        private void UpdateAccountLabel()
        {
            var loggedIn = !string.IsNullOrWhiteSpace(_config.AccessToken);

            // Login form (email/password/Sign In) only makes sense while
            // signed out; once logged in, replace it with a compact
            // "signed in" chip (badge + name/email) and a Sign Out button.
            lblWelcomeTitle.Visible = !loggedIn;
            lblWelcomeSub.Visible = !loggedIn;
            lblEmail.Visible = !loggedIn;
            txtEmail.Visible = !loggedIn;
            lblPassword.Visible = !loggedIn;
            txtPassword.Visible = !loggedIn;
            btnLogin.Visible = !loggedIn;

            btnLogout.Visible = loggedIn;
            lblLoginBadge.Visible = loggedIn;
            lblLoginEmail.Visible = loggedIn;

            if (loggedIn)
            {
                var name = string.IsNullOrWhiteSpace(_config.OwnerName) ? "there" : _config.OwnerName;

                lblAccountStatus.Visible = true;
                lblAccountStatus.AutoSize = false;
                lblAccountStatus.AutoEllipsis = true;
                lblAccountStatus.Font = Theme.FontLabelBold;
                lblAccountStatus.ForeColor = Theme.TextPrimary;
                lblAccountStatus.Text = $"Hi, {name}!";
                lblAccountStatus.Location = ChipNameLocation;
                lblAccountStatus.Size = new Size(ChipContentWidth, 18);

                // Shop name reads as more useful/personal here than the raw
                // email - the email is still available via the "click to
                // copy" chip behavior (CopyAccountEmailToClipboard), which
                // reads _config.OwnerEmail directly, not this label's text.
                lblLoginEmail.Text = !string.IsNullOrWhiteSpace(_config.ShopName)
                    ? _config.ShopName
                    : (_config.OwnerEmail ?? "");

                pnlAccountCard.Height = LogicalToDeviceUnits(LoggedInCardHeight);
            }
            else
            {
                // The empty login form itself already communicates "not
                // logged in" - this label just sat overlapping btnLogin's
                // left edge (visible depending on display scaling) for no
                // real benefit, so it's hidden here entirely. Still used
                // (and re-shown) for the "Signed in as X" chip above.
                lblAccountStatus.Visible = false;

                // LogicalToDeviceUnits, not the raw constant: this height is
                // assigned in code (after InitializeComponent's own DPI
                // auto-scale pass already ran once), so it must be scaled by
                // hand or it stays a fixed 300px design-time value forever.
                // On a laptop running above 100% text scaling, the labels/
                // textboxes/button inside are already taller than that (they
                // scaled correctly), so the unscaled 300px cut the bottom of
                // the login card off - the Sign In button included.
                pnlAccountCard.Height = LogicalToDeviceUnits(LoggedOutCardHeight);
            }

            SetChipHighlighted(false);
            pnlAccountCard.Invalidate(true);
        }

        private async Task BootstrapLoginAsync()
        {
            if (!string.IsNullOrWhiteSpace(_config.AccessToken))
            {
                LogStatus("Saved session found, skipping login.");
                UpdateAccountLabel();
                _wsClient?.Start();
                return;
            }

            var saved = CredentialStore.Load();
            if (saved is null || string.IsNullOrWhiteSpace(saved.Email))
            {
                LogStatus("No saved login on this computer. Please log in once.");
                return;
            }

            txtEmail.Text = saved.Email;
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
                    _config.ShopName = response.Shop?.ShopName ?? "";
                    AgentConfig.Save(_configPath, _config);
                    UpdateAccountLabel();
                    LogStatus("Auto-login successful.");
                    _wsClient?.Start();
                    return;
                }
                catch (AuthenticationFailedException error)
                {
                    LogStatus($"Saved login rejected by server: {error.Message}. Please log in manually.");
                    StartLoginReminder();
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

        private async void btnLogin_Click(object sender, EventArgs e)
        {
            _autoLoginStop?.Cancel();
            btnLogin.Enabled = false;
            btnLogin.Text = "Signing in...";
            try
            {
                var email = txtEmail.Text.Trim();
                var password = txtPassword.Text;
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
                _config.ShopName = response.Shop?.ShopName ?? "";
                AgentConfig.Save(_configPath, _config);

                CredentialStore.Save(email, password);

                UpdateAccountLabel();
                txtPassword.Clear();
                LogStatus("Login successful. This device will sign in automatically next time.");
                _wsClient?.Start();
                StopLoginReminder();
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
                btnLogin.Text = "Sign In";
                UpdateLoginButtonEnabled();
            }
        }

        private void btnLogout_Click(object sender, EventArgs e)
        {
            _autoLoginStop?.Cancel();
            _wsClient?.Stop();
            _wsBlinkTimer?.Stop();
            _config.AccessToken = "";
            _config.RefreshToken = "";
            AgentConfig.Save(_configPath, _config);
            CredentialStore.Clear();
            txtPassword.Clear();
            UpdateAccountLabel();
            LogStatus("Logged out and removed the saved login from this computer.");
        }

        // One-time move from the old exe-relative location to the stable
        // AgentPaths.ConfigDir one (see SettingsFilePath's comment) - only
        // when nothing has been saved yet at the new path, so it never
        // overwrites presets a shop already has there. Best-effort: a
        // failure here just means presets stay wherever they already were,
        // not lost, and this never blocks startup over it.
        private static void MigrateLegacySettingsFileIfNeeded()
        {
            try
            {
                if (File.Exists(AgentPaths.PrinterSettingsPath)) return;

                var legacyPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "printer_settings.txt");
                if (!File.Exists(legacyPath)) return;

                Directory.CreateDirectory(AgentPaths.ConfigDir);
                File.Copy(legacyPath, AgentPaths.PrinterSettingsPath);
            }
            catch
            {
                // Best-effort - see comment above.
            }
        }

        // ── Load Settings File & Populate Grid ───────────────────────
        private void LoadPrinterSettings()
        {
            dataGridPrinterSetting.Rows.Clear();

            if (!File.Exists(SettingsFilePath)) return;

            foreach (string line in File.ReadAllLines(SettingsFilePath))
            {
                string[] parts = line.Split('|');
                if (parts.Length != 3) continue;

                int rowIdx = dataGridPrinterSetting.Rows.Add(parts[0], parts[1], parts[2]);
                dataGridPrinterSetting.Rows[rowIdx].Cells["colDelete"].Value = "Delete";
            }
        }

        // ── Save Button Click ─────────────────────────────────────────
        private void btnSavePrinterSetting_Click(object sender, EventArgs e)
        {
            string printer = cBoxSettingPrinter.SelectedItem?.ToString();
            string pageSize = cBoxSettingPage.SelectedItem?.ToString();
            string colorType = cBoxSettingColor.SelectedItem?.ToString();

            if (string.IsNullOrEmpty(printer) ||
                string.IsNullOrEmpty(pageSize) ||
                string.IsNullOrEmpty(colorType))
            {
                LogStatus("Please select all settings before saving.");
                return;
            }

            // Append to file
            File.AppendAllText(SettingsFilePath, $"{printer}|{pageSize}|{colorType}{Environment.NewLine}");

            // Add row to grid
            int rowIdx = dataGridPrinterSetting.Rows.Add(printer, pageSize, colorType);
            dataGridPrinterSetting.Rows[rowIdx].Cells["colDelete"].Value = "Delete";

            LogStatus("Settings saved successfully.");
        }

        // ── Delete Row on Cell Click ──────────────────────────────────
        private void dataGridPrinterSetting_CellContentClick(object sender, DataGridViewCellEventArgs e)
        {
            if (e.RowIndex < 0) return;
            if (dataGridPrinterSetting.Columns[e.ColumnIndex].Name != "colDelete") return;

            var confirm = MessageBox.Show("Delete this setting?", "Confirm",
                MessageBoxButtons.YesNo, MessageBoxIcon.Question);
            if (confirm != DialogResult.Yes) return;

            dataGridPrinterSetting.Rows.RemoveAt(e.RowIndex);
            SaveAllSettingsToFile();
        }

        // ── Rewrite File After Delete ─────────────────────────────────
        private void SaveAllSettingsToFile()
        {
            var lines = new System.Collections.Generic.List<string>();

            foreach (DataGridViewRow row in dataGridPrinterSetting.Rows)
            {
                if (row.IsNewRow) continue;

                string printer = row.Cells["colPrinter"].Value?.ToString() ?? "";
                string pageSize = row.Cells["colPageSize"].Value?.ToString() ?? "";
                string colorType = row.Cells["colColorType"].Value?.ToString() ?? "";

                if (!string.IsNullOrEmpty(printer))
                    lines.Add($"{printer}|{pageSize}|{colorType}");
            }

            File.WriteAllLines(SettingsFilePath, lines);
        }

        private void LoadPrinters()
        {
            cmbPrinters.Items.Clear();
            cBoxSettingPrinter.Items.Clear();

            foreach (string printer in PrinterSettings.InstalledPrinters)
            {
                cmbPrinters.Items.Add(printer);
                cBoxSettingPrinter.Items.Add(printer);
            }


            PrinterSettings ps = new PrinterSettings();

            if (cmbPrinters.Items.Contains(ps.PrinterName))
            {

                cmbPrinters.SelectedItem = ps.PrinterName;
                cBoxSettingPrinter.SelectedItem = ps.PrinterName;
            }

        }

        private void btnBrowse_Click(object sender, EventArgs e)
        {
            OpenFileDialog ofd = new OpenFileDialog
            {
                Filter =
                    "Supported Files|*.pdf;*.jpg;*.jpeg;*.png;*.bmp|" +
                    "PDF Files|*.pdf|" +
                    "Image Files|*.jpg;*.jpeg;*.png;*.bmp"
            };

            if (ofd.ShowDialog() == DialogResult.OK)
            {
                selectedFile = ofd.FileName;
                txtFilePath.Text = selectedFile;
            }
        }

        private async void btnPrint_Click(object sender, EventArgs e)
        {
            if (string.IsNullOrWhiteSpace(selectedFile))
            {
                LogStatus("Please select a file first.");
                return;
            }

            if (cmbPrinters.SelectedItem == null)
            {
                LogStatus("Please select a printer.");
                return;
            }

            string extension = Path.GetExtension(selectedFile).ToLower();

            try
            {
                if (extension == ".pdf")
                    await PrintPdf(selectedFile);
                else if (extension == ".jpg" || extension == ".jpeg" ||
                         extension == ".png" || extension == ".bmp")
                    await PrintImage(selectedFile);
                else
                {
                    LogStatus("Unsupported file type.");
                    return;
                }

                LogStatus("Print job sent successfully.");
            }
            catch (Exception ex)
            {
                LogStatus($"Printing Error: {ex.Message}");
            }
        }

        // ── Shared: Apply printer + paper + color settings ────────────

        private void ApplyPrinterSettings(PrintDocument pd, string printerName, string paperSize, string colorType)
        {
            pd.PrinterSettings.PrinterName = printerName;
            pd.DefaultPageSettings.Landscape = false;
            pd.DefaultPageSettings.Margins = new Margins(0, 0, 0, 0);

            bool paperFound = false;
            foreach (PaperSize ps in pd.PrinterSettings.PaperSizes)
            {
                if (ps.PaperName.Equals(paperSize, StringComparison.OrdinalIgnoreCase))
                {
                    pd.DefaultPageSettings.PaperSize = ps;
                    paperFound = true;
                    break;
                }
            }

            if (!paperFound)
            {
                switch (paperSize)
                {
                    case "A4": pd.DefaultPageSettings.PaperSize = new PaperSize("A4", 827, 1169); break;
                    case "A5": pd.DefaultPageSettings.PaperSize = new PaperSize("A5", 583, 827); break;
                    case "Letter": pd.DefaultPageSettings.PaperSize = new PaperSize("Letter", 850, 1100); break;
                }
            }

            bool isGrayscale = colorType == "Grayscale";
            pd.DefaultPageSettings.Color = !isGrayscale;
        }

        // Manual print (btnPrint_Click) ke liye — combobox se values leta hai
        private void ApplyPrinterSettingsFromUI(PrintDocument pd)
        {
            string printerName = cmbPrinters.SelectedItem.ToString();
            string paperSize = cmbPageSize.SelectedItem?.ToString() ?? "A4";
            string colorType = cmbColorType.SelectedItem?.ToString() ?? "Color";
            ApplyPrinterSettings(pd, printerName, paperSize, colorType);
        }

        // ── Match Printer from Settings Grid ─────────────────────────
        private string FindMatchingPrinter(string paperSize, string colorType)
        {
            foreach (DataGridViewRow row in dataGridPrinterSetting.Rows)
            {
                if (row.IsNewRow) continue;

                string rowPaper = row.Cells["colPageSize"].Value?.ToString() ?? "";
                string rowColor = row.Cells["colColorType"].Value?.ToString() ?? "";
                string rowPrinter = row.Cells["colPrinter"].Value?.ToString() ?? "";

                if (rowPaper.Equals(paperSize, StringComparison.OrdinalIgnoreCase) &&
                    rowColor.Equals(colorType, StringComparison.OrdinalIgnoreCase) &&
                    !string.IsNullOrEmpty(rowPrinter))
                {
                    return rowPrinter;
                }
            }
            return null; // no match
        }
        // ── PDF Printing ──────────────────────────────────────────────

        private async Task PrintPdf(string filePath)
        {
            if (!File.Exists(filePath))
                throw new FileNotFoundException("PDF file not found.", filePath);

            _pdfBytes = await File.ReadAllBytesAsync(filePath);
            _pdfPageCount = Conversion.GetPageCount(_pdfBytes);
            _currentPageIndex = 0;

            PrintDocument pd = new PrintDocument();
            ApplyPrinterSettingsFromUI(pd);

            if (!pd.PrinterSettings.IsValid)
                throw new Exception("Selected printer is not valid.");

            pd.PrintPage += PdfPrintPage;

            try
            {
                pd.Print();
            }
            finally
            {
                pd.PrintPage -= PdfPrintPage;
                _pdfBytes = null;
            }
        }

        private void PdfPrintPage(object sender, PrintPageEventArgs e)
        {
            Rectangle bounds = e.MarginBounds;
            float dpi = e.Graphics.DpiX > 0 ? e.Graphics.DpiX : 96f;

            using (SKBitmap skBmp = Conversion.ToImage(_pdfBytes, _currentPageIndex, options: new RenderOptions(Dpi: (int)dpi, WithAnnotations: true)))
            using (Bitmap bmp = SkBitmapToGdiBitmap(skBmp))
            {
                Bitmap toPrint = bmp;

                if (cmbColorType.SelectedItem?.ToString() == "Grayscale")
                    toPrint = ConvertToGrayscale(new Bitmap(bmp));

                float ratioX = (float)bounds.Width / toPrint.Width;
                float ratioY = (float)bounds.Height / toPrint.Height;
                float ratio = Math.Min(ratioX, ratioY);

                int w = (int)(toPrint.Width * ratio);
                int h = (int)(toPrint.Height * ratio);
                int x = bounds.X + (bounds.Width - w) / 2;
                int y = bounds.Y + (bounds.Height - h) / 2;

                e.Graphics.DrawImage(toPrint, x, y, w, h);

                if (toPrint != bmp)
                    toPrint.Dispose();
            }

            _currentPageIndex++;
            e.HasMorePages = (_currentPageIndex < _pdfPageCount);
        }

        // SkiaSharp's default color type on Windows (Bgra8888) matches GDI+'s
        // Format32bppArgb byte order, so the pixel buffer can be wrapped
        // directly without a conversion pass - same zero-copy approach the
        // old PdfBitmap.Buffer wrapping used.
        private static Bitmap SkBitmapToGdiBitmap(SKBitmap skBmp)
        {
            return new Bitmap(skBmp.Width, skBmp.Height, skBmp.RowBytes, PixelFormat.Format32bppArgb, skBmp.GetPixels());
        }

        // ── Image Printing ────────────────────────────────────────────

        private async Task PrintImage(string filePath)
        {
            imageToPrint = Image.FromFile(filePath);

            if (cmbColorType.SelectedItem?.ToString() == "Grayscale")
                imageToPrint = ConvertToGrayscale((Bitmap)imageToPrint);

            PrintDocument pd = new PrintDocument();
            ApplyPrinterSettingsFromUI(pd);

            if (!pd.PrinterSettings.IsValid)
                throw new Exception("Selected printer is not valid.");

            pd.PrintPage += Pd_PrintPage;
            pd.Print();

            imageToPrint.Dispose();
        }

        private void Pd_PrintPage(object sender, PrintPageEventArgs e)
        {
            Rectangle bounds = e.MarginBounds;

            float ratioX = (float)bounds.Width / imageToPrint.Width;
            float ratioY = (float)bounds.Height / imageToPrint.Height;
            float ratio = Math.Min(ratioX, ratioY);

            int width = (int)(imageToPrint.Width * ratio);
            int height = (int)(imageToPrint.Height * ratio);

            int x = bounds.X + (bounds.Width - width) / 2;
            int y = bounds.Y + (bounds.Height - height) / 2;

            e.Graphics.DrawImage(imageToPrint, x, y, width, height);
            e.HasMorePages = false;
        }

        // ── Grayscale Conversion ──────────────────────────────────────

        private Bitmap ConvertToGrayscale(Bitmap original)
        {
            Bitmap gray = new Bitmap(original.Width, original.Height);

            using (Graphics g = Graphics.FromImage(gray))
            {
                var matrix = new System.Drawing.Imaging.ColorMatrix(new float[][]
                {
                    new float[] { 0.299f, 0.299f, 0.299f, 0, 0 },
                    new float[] { 0.587f, 0.587f, 0.587f, 0, 0 },
                    new float[] { 0.114f, 0.114f, 0.114f, 0, 0 },
                    new float[] { 0,      0,      0,      1, 0 },
                    new float[] { 0,      0,      0,      0, 1 }
                });

                var attrs = new System.Drawing.Imaging.ImageAttributes();
                attrs.SetColorMatrix(matrix);

                g.DrawImage(original,
                    new Rectangle(0, 0, gray.Width, gray.Height),
                    0, 0, original.Width, original.Height,
                    GraphicsUnit.Pixel, attrs);
            }

            original.Dispose();
            return gray;
        }

        // ── Form Load ─────────────────────────────────────────────────

        private async void Form1_Load(object sender, EventArgs e)
        {
            // Pull the current API base URL before anything else touches
            // the network, so login/polling/etc. all target the right host.
            await ApiBaseUrlProvider.RefreshBaseUrl(_config, _configPath, LogStatus);

            // Dev convenience: if a local `manage.py runserver` is up on
            // localhost:8000, use it for this session instead of production
            // - never persisted, so the next launch without it running falls
            // straight back to production automatically.
            await ApiBaseUrlProvider.UseLocalDevServerIfAvailable(_config, LogStatus);

            // Check for an update before doing anything else. If one is
            // needed, Updater.exe is already launched by this point - it
            // will close this process (by pid) once it's ready to install,
            // so there is no point setting up timers/webview/etc. here.
            var updateLaunched = await VersionChecker.CheckAndLaunchUpdaterIfNeeded(softwareVersion.Text, LogStatus);
            if (updateLaunched)
            {
                // Without this, OnFormClosing treats this as the user
                // clicking X and just hides the window to the tray instead
                // of exiting - leaving the old process (and its file locks)
                // alive in the background for the updater to fight with.
                _isExiting = true;
                Close();
                return;
            }

            // Paper Size combobox
            cmbPageSize.Items.Clear();
            cmbPageSize.Items.Add("A4");
            cmbPageSize.Items.Add("A5");
            cmbPageSize.Items.Add("Letter");
            cmbPageSize.SelectedIndex = 0;

            // Color Type combobox
            cmbColorType.Items.Clear();
            cmbColorType.Items.Add("Color");
            cmbColorType.Items.Add("Grayscale");
            cmbColorType.SelectedIndex = 0;

            cBoxSettingPage.Items.Clear();
            cBoxSettingPage.Items.Add("A4");
            cBoxSettingPage.Items.Add("A5");
            cBoxSettingPage.Items.Add("Letter");
            cBoxSettingPage.SelectedIndex = 0;

            cBoxSettingColor.Items.Clear();
            cBoxSettingColor.Items.Add("Color");
            cBoxSettingColor.Items.Add("Grayscale");
            cBoxSettingColor.SelectedIndex = 0;

            // ── Grid Styling ──────────────────────────────────────────
            Theme.StyleGrid(dataGridPrinterSetting);
            Theme.StyleGrid(dataGridPendingPrintData);
            Theme.StyleGrid(dataGridCompletedPrintData);

            // ── Grid Columns Setup ────────────────────────────────────
            dataGridPrinterSetting.Columns.Clear();
            dataGridPrinterSetting.AutoGenerateColumns = false;
            dataGridPrinterSetting.AllowUserToAddRows = false;
            dataGridPrinterSetting.AllowUserToDeleteRows = false;
            dataGridPrinterSetting.RowHeadersVisible = false;
            dataGridPrinterSetting.SelectionMode = DataGridViewSelectionMode.FullRowSelect;

            dataGridPrinterSetting.Columns.Add(new DataGridViewTextBoxColumn
            {
                Name = "colPrinter",
                HeaderText = "Printer",
                FillWeight = 45,
                ReadOnly = true
            });

            dataGridPrinterSetting.Columns.Add(new DataGridViewTextBoxColumn
            {
                Name = "colPageSize",
                HeaderText = "Page Size",
                FillWeight = 20,
                ReadOnly = true
            });

            dataGridPrinterSetting.Columns.Add(new DataGridViewTextBoxColumn
            {
                Name = "colColorType",
                HeaderText = "Color",
                FillWeight = 20,
                ReadOnly = true
            });

            dataGridPrinterSetting.Columns.Add(new DataGridViewButtonColumn
            {
                Name = "colDelete",
                HeaderText = "",
                Text = "Delete",
                UseColumnTextForButtonValue = true,
                FillWeight = 15,
                FlatStyle = FlatStyle.Flat
            });
            dataGridPrinterSetting.AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill;
            // ─────────────────────────────────────────────────────────

            MigrateLegacySettingsFileIfNeeded();
            LoadPrinterSettings();  // file se load karo

            // ── Pending Print Grid Setup ──────────────────────────────────
            dataGridPendingPrintData.Columns.Clear();
            dataGridPendingPrintData.AutoGenerateColumns = false;
            dataGridPendingPrintData.AllowUserToAddRows = false;
            dataGridPendingPrintData.AllowUserToDeleteRows = false;
            dataGridPendingPrintData.RowHeadersVisible = false;
            dataGridPendingPrintData.SelectionMode = DataGridViewSelectionMode.FullRowSelect;

            dataGridPendingPrintData.Columns.Add(new DataGridViewTextBoxColumn { Name = "colPrintId", HeaderText = "Print ID", Width = 70, ReadOnly = true });
            dataGridPendingPrintData.Columns.Add(new DataGridViewTextBoxColumn { Name = "colFilePath", HeaderText = "File", Width = 200, ReadOnly = true });
            dataGridPendingPrintData.Columns.Add(new DataGridViewTextBoxColumn { Name = "colPages", HeaderText = "Pages", Width = 60, ReadOnly = true });
            dataGridPendingPrintData.Columns.Add(new DataGridViewTextBoxColumn { Name = "colCopies", HeaderText = "Copies", Width = 60, ReadOnly = true });
            dataGridPendingPrintData.Columns.Add(new DataGridViewTextBoxColumn { Name = "colPaper", HeaderText = "Paper", Width = 60, ReadOnly = true });
            dataGridPendingPrintData.Columns.Add(new DataGridViewTextBoxColumn { Name = "colColor", HeaderText = "Color", Width = 70, ReadOnly = true });
            dataGridPendingPrintData.Columns.Add(new DataGridViewTextBoxColumn { Name = "colPayment", HeaderText = "Amount", Width = 70, ReadOnly = true });
            dataGridPendingPrintData.Columns.Add(new DataGridViewTextBoxColumn { Name = "colPaymentMode", HeaderText = "Mode", Width = 70, ReadOnly = true });
            dataGridPendingPrintData.Columns.Add(new DataGridViewTextBoxColumn { Name = "colDate", HeaderText = "Date", Width = 100, ReadOnly = true });
            dataGridPendingPrintData.Columns.Add(new DataGridViewTextBoxColumn { Name = "colStatus", HeaderText = "Status", Width = 80, ReadOnly = true });
            dataGridPendingPrintData.AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill;

            UpdateAccountLabel();
            LoadPrintedJobIds();

            _localServer = new LocalStatusServer(
                GetStatusSnapshot,
                SavePrinterFromLocalApi,
                ListPresetsFromLocalApi,
                SavePresetFromLocalApi,
                DeletePresetFromLocalApi,
                request => RunQrPrintFromLocalApi(request, isPoster: false),
                request => RunQrPrintFromLocalApi(request, isPoster: true),
                LogStatus
            );
            _localServer.Start();

            // ── WebSocket "new job available" push ───────────────────────
            // Signal-only - any message received just triggers an immediate
            // PollAndPrintAsync() via the existing poll pipeline. Marshaled
            // onto the UI thread before calling it (see the callback body)
            // since PollAndPrintAsync's job-claim sequence (_printedIds) is
            // not thread-safe and must not run concurrently with a
            // timer-triggered call. Started only after a successful login
            // (see BootstrapLoginAsync/AutoLoginLoop/btnLogin_Click) - not here.
            _wsClient = new WebSocketAgentClient(
                () => _config,
                () =>
                {
                    if (InvokeRequired)
                        BeginInvoke(new Action(() => _ = PollAndPrintAsync()));
                    else
                        _ = PollAndPrintAsync();
                    return Task.CompletedTask;
                },
                LogStatus,
                connected =>
                {
                    // WS connected: stop polling entirely - the push tells us
                    // the instant a job shows up, so a timer hit in between
                    // would only ever find nothing. WS disconnected: resume
                    // polling at the configured interval immediately, since
                    // that's now the only way jobs get noticed until it
                    // reconnects.
                    //
                    // GetStatusSnapshot() must also know about this: it used
                    // to infer "running" purely from the poll timer being
                    // enabled, which broke the website's Verify Agent step
                    // the instant WS connected and legitimately stopped that
                    // timer (agent report itself as "stopped" while healthy).
                    _wsConnected = connected;

                    void ApplyPollState()
                    {
                        // The real poll-timer toggle runs FIRST and is never
                        // allowed to be skipped by the cosmetic badge update
                        // below - GetStatusSnapshot()'s "running"/"stopped"
                        // answer depends entirely on this actually running.
                        // An earlier version called UpdateWsIndicator first;
                        // if that ever threw (e.g. a WinForms control access
                        // issue), the poll timer was never restarted on a WS
                        // disconnect and the agent got stuck reporting
                        // "stopped" until the next successful reconnect -
                        // exactly the symptom this whole status field exists
                        // to avoid.
                        if (_pollTimer != null)
                        {
                            if (connected)
                            {
                                _pollTimer.Stop();
                                LogStatus("Poll timer stopped - WebSocket is live, no more periodic /api/agent/jobs/ calls.");
                            }
                            else
                            {
                                _pollTimer.Interval = Math.Max(_config.PollIntervalSeconds, 5) * 1000;
                                _pollTimer.Start();
                                LogStatus($"Poll timer resumed - polling every {Math.Max(_config.PollIntervalSeconds, 5)}s (WebSocket disconnected).");
                            }
                        }

                        try
                        {
                            UpdateWsIndicator(connected);
                        }
                        catch (Exception ex)
                        {
                            // Purely cosmetic (the badge blink) - must never
                            // take the poll timer down with it.
                            LogStatus($"WS indicator update failed (cosmetic only): {ex.Message}");
                        }
                    }

                    if (InvokeRequired)
                        BeginInvoke(new Action(ApplyPollState));
                    else
                        ApplyPollState();
                }
            );

            // ── Poll Timer ────────────────────────────────────────────────
            _pollTimer = new System.Windows.Forms.Timer();
            _pollTimer.Interval = Math.Max(_config.PollIntervalSeconds, 5) * 1000;
            _pollTimer.Tick += async (s, ev) =>
            {
                await PollAndPrintAsync();
            };
            _pollTimer.Start();
            UpdateWsIndicator(wsConnected: false); // amber until the WebSocket's first connect callback fires

            await BootstrapLoginAsync();

            // First immediate fetch
            _ = PollAndPrintAsync();
        }

        // ── API Poll + Auto Print ─────────────────────────────────────
        private async System.Threading.Tasks.Task PollAndPrintAsync()
        {
            if (string.IsNullOrWhiteSpace(_config.AccessToken))
            {
                return; // Not logged in yet - nothing to fetch.
            }

            try
            {
                var api = NewApi();
                var jobs = await api.FetchJobs(CancellationToken.None);
                if (jobs.Count == 0) return;

                LogStatus($"Found {jobs.Count} job(s).");

                if (InvokeRequired)
                    Invoke(new Action(() => RefreshPendingGrid(jobs)));
                else
                    RefreshPendingGrid(jobs);

                foreach (var job in jobs)
                {
                    if (job.Id <= 0 || string.IsNullOrWhiteSpace(job.DownloadUrl)) continue;
                    if (_printedIds.Contains(job.Id)) continue;

                    _printedIds.Add(job.Id);

                    if (_recoveredPrintedIds.Contains(job.Id))
                    {
                        // Physically printed in a previous run - the server
                        // only still shows it because that run ended before
                        // the "printed" status update went out. Reconcile
                        // the status, do not print it again.
                        if (InvokeRequired)
                            Invoke(new Action(() => _ = ReconcilePreviouslyPrintedJobAsync(api, job)));
                        else
                            _ = ReconcilePreviouslyPrintedJobAsync(api, job);
                        continue;
                    }

                    if (InvokeRequired)
                        Invoke(new Action(() => _ = ProcessJobAsync(api, job)));
                    else
                        _ = ProcessJobAsync(api, job);
                }
            }
            catch (Exception ex)
            {
                LogStatus($"Poll error: {ex.Message}");
            }
        }

        // ── Refresh Grid ──────────────────────────────────────────────
        private void RefreshPendingGrid(System.Collections.Generic.IReadOnlyList<PrintJob> jobs)
        {
            dataGridPendingPrintData.Rows.Clear();

            foreach (var job in jobs)
            {
                dataGridPendingPrintData.Rows.Add(
                    job.Id,
                    job.FileName,
                    job.Pages,
                    job.Copies,
                    DefaultPaperSize,
                    job.PrintColorModeLabel,
                    $"₹{job.TotalAmount}",
                    job.PaymentMode,
                    job.CreatedAt,
                    job.Status
                );
            }
        }

        // Reports a job recovered from AgentPaths.PrintedJobsPath as
        // "printed" without touching the printer - see _recoveredPrintedIds.
        // Best-effort: a failure here just means the job is picked up again
        // on the next poll (still in _recoveredPrintedIds, no longer
        // eligible for _printedIds' one-shot dispatch guard until then).
        private async System.Threading.Tasks.Task ReconcilePreviouslyPrintedJobAsync(CafeMitraApi api, PrintJob job)
        {
            var tokenId = string.IsNullOrWhiteSpace(job.TokenId) ? $"Order {job.Id}" : job.TokenId;
            try
            {
                await api.UpdateStatus(job.Id, "printed", "Recovered after an agent restart - already printed, not reprinted.", CancellationToken.None);
                LogStatus($"{tokenId}: was already printed before the last restart - status reconciled, not reprinted.");
            }
            catch (Exception ex)
            {
                _printedIds.Remove(job.Id); // retry reconciling next poll
                LogStatus($"{tokenId}: could not reconcile already-printed status - {ex.Message}");
            }
        }

        // ── Download + Auto Print One Job ──────────────────────────────
        private async System.Threading.Tasks.Task ProcessJobAsync(CafeMitraApi api, PrintJob job)
        {
            var tokenId = string.IsNullOrWhiteSpace(job.TokenId) ? $"Order {job.Id}" : job.TokenId;

            await _printQueueGate.WaitAsync();
            try
            {
                await ProcessJobCoreAsync(api, job, tokenId);
            }
            finally
            {
                _printQueueGate.Release();
            }
        }

        private async System.Threading.Tasks.Task ProcessJobCoreAsync(CafeMitraApi api, PrintJob job, string tokenId)
        {
            try
            {
                if (job.IsCashApprovalPending)
                {
                    LogStatus($"{tokenId}: waiting for cash confirmation.");
                    var approved = ConfirmCashPrint(job);
                    if (!approved)
                    {
                        await api.RejectCashOrder(job.Id, CancellationToken.None);
                        LogStatus($"{tokenId}: cash print rejected.");
                        return;
                    }

                    await api.ApproveCashOrder(job.Id, CancellationToken.None);
                    LogStatus($"{tokenId}: cash collected confirmation accepted.");
                }

                var fileName = SafeFileName(string.IsNullOrWhiteSpace(job.FileName) ? $"order-{job.Id}.pdf" : job.FileName);
                var destination = Path.Combine(AgentPaths.JobsDir, $"{job.Id}-{fileName}");

                LogStatus($"{tokenId}: downloading {fileName}");
                await api.DownloadFile(job.DownloadUrl, destination, CancellationToken.None);

                var colorType = job.PrintColorMode.ToPresetColorMode();
                var matchedPrinter = FindMatchingPrinter(DefaultPaperSize, colorType);
                if (matchedPrinter is null)
                {
                    // Same silent-failure shape as an offline/virtual printer
                    // - just log-and-skip, forever, with nothing telling the
                    // shop why a customer's job never came out. Common real
                    // case: only a Grayscale preset was ever saved (e.g. for
                    // A4), and a Color order comes in - there's no A4/Color
                    // row, so this is a permanent dead end for that job
                    // until someone happens to notice and adds the preset.
                    LogStatus($"{tokenId}: no printer preset saved for {DefaultPaperSize} / {colorType} - holding job until one is added.");
                    _printedIds.Remove(job.Id); // retry next poll once a matching preset is saved
                    ShowMissingPresetAlert(DefaultPaperSize, colorType);
                    return; // job stays exactly as it was on the server (pending) - not failed, not printed
                }

                // Skipped only against the local dev server - never in
                // production. A dev machine testing the poll/print pipeline
                // routinely has no real printer attached at all, so
                // "Microsoft Print to PDF" is the only thing there is to
                // pick; this alert exists to protect a real shop's real
                // customer from a silent fake-success, not to block that
                // kind of local testing.
                if (!IsLocalDevSession && IsVirtualPrinter(matchedPrinter))
                {
                    // Windows' built-in "printers" (Print to PDF, XPS Document
                    // Writer, Fax, OneNote) always pass PrinterSettings.IsValid
                    // and are never "offline" - they happily accept a job and
                    // produce... a PDF file, a fax queue entry, a OneNote page.
                    // No exception, no paper. A shop whose real printer was
                    // never actually selected in Setup (or got swapped/
                    // disconnected and one of these was already sitting in the
                    // dropdown) would have every job "print" successfully
                    // forever with nothing ever coming out - seen live on a
                    // client machine.
                    LogStatus($"{tokenId}: matched printer '{matchedPrinter}' is a virtual/built-in Windows printer, not a physical one - holding job until a real printer is selected.");
                    _printedIds.Remove(job.Id); // retry automatically once a real printer is saved in Printer Setting
                    ShowVirtualPrinterAlert(matchedPrinter);
                    return; // job stays exactly as it was on the server (pending) - not failed, not printed
                }

                var printerFault = GetPrinterFault(matchedPrinter);
                if (printerFault != null)
                {
                    LogStatus($"{tokenId}: printer '{matchedPrinter}' {printerFault} - holding job until it's resolved.");
                    _printedIds.Remove(job.Id); // retry automatically on a later poll/push, once the fault clears
                    ShowPrinterFaultAlert(matchedPrinter, printerFault);
                    return; // job stays exactly as it was on the server (pending) - not failed, not printed
                }

                LogStatus($"{tokenId}: using printer {matchedPrinter}");
                await api.UpdateStatus(job.Id, "printing", $"Sent to {matchedPrinter} ({job.PrintColorModeLabel})", CancellationToken.None);

                // Drive the same manual Browse+Print controls/click handler
                // instead of calling PrintPdfAuto/PrintImageAuto directly -
                // this is the exact path already confirmed working.
                selectedFile = destination;
                txtFilePath.Text = destination;
                cmbPageSize.SelectedItem = DefaultPaperSize;
                cmbPrinters.SelectedItem = matchedPrinter;
                cmbColorType.SelectedItem = colorType;

                var copies = Math.Max(job.Copies, 1);
                var printedCopies = 0;
                Exception lastPrintError = null;
                for (var copy = 0; copy < copies; copy++)
                {
                    if (string.IsNullOrWhiteSpace(selectedFile))
                    {
                        LogStatus("Please select a file first.");
                        return;
                    }

                    if (cmbPrinters.SelectedItem == null)
                    {
                        LogStatus("Please select a printer.");
                        return;
                    }

                    string extension = Path.GetExtension(selectedFile).ToLower();

                    try
                    {
                        if (extension == ".pdf")
                            await PrintPdf(selectedFile);
                        else if (extension == ".jpg" || extension == ".jpeg" ||
                                 extension == ".png" || extension == ".bmp")
                            await PrintImage(selectedFile);
                        else
                        {
                            LogStatus("Unsupported file type.");
                            return;
                        }

                        printedCopies++;
                        LogStatus("Print job sent successfully.");
                    }
                    catch (Exception ex)
                    {
                        // Was previously swallowed here and the job still got
                        // reported "printed" below regardless - e.g. the
                        // printer saved in Setup got unplugged/uninstalled
                        // since, so PrinterSettings.IsValid throws for every
                        // copy, yet the customer (who paid for this) and the
                        // shop dashboard both saw "printed". Record it and
                        // let the zero-success check below turn this into a
                        // real "failed" status instead.
                        lastPrintError = ex;
                        LogStatus($"Printing Error: {ex.Message}");
                    }
                }

                if (printedCopies == 0)
                {
                    throw lastPrintError ?? new Exception("Printer did not accept the job.");
                }

                // Durably record the physical print *before* telling the
                // server - if the process dies right here (crash, forced
                // close, power loss), a restart must see this job as already
                // printed and reconcile its status instead of reprinting it.
                PersistPrintedJobId(job.Id);

                var printResult = printedCopies == copies
                    ? $"Printed via {matchedPrinter} ({job.PrintColorModeLabel}), {copies} cop{(copies == 1 ? "y" : "ies")}."
                    : $"Printed {printedCopies} of {copies} cop{(copies == 1 ? "y" : "ies")} via {matchedPrinter} - remaining copies failed: {lastPrintError?.Message}";
                await api.UpdateStatus(job.Id, "printed", printResult, CancellationToken.None);
                LogStatus($"{tokenId}: printed.");
            }
            catch (Exception ex)
            {
                _printedIds.Remove(job.Id); // retry next poll
                LogStatus($"{tokenId}: failed - {ex.Message}");
                try { await api.UpdateStatus(job.Id, "failed", ex.Message, CancellationToken.None); } catch { /* best effort */ }
            }
        }

        // True only when this session is actually talking to the local
        // manage.py runserver (see ApiBaseUrlProvider.UseLocalDevServerIfAvailable) -
        // never true against production, so gating a safety check on this
        // can't weaken it for a real shop.
        private bool IsLocalDevSession => _config.ApiBaseUrl == ApiBaseUrlProvider.LocalDevBaseUrl;

        // Windows' own built-in "printers" - they'll match any paper-size/
        // color-mode preset a shop saves in Printer Setting just as happily
        // as a real one, always report "online", and never throw: they just
        // silently produce a PDF/fax/OneNote page instead of paper. Matched
        // by substring, not exact name, since "OneNote (Desktop)" vs
        // "OneNote for Windows 10" vs a future Windows version's exact
        // wording all vary, but the identifying word doesn't.
        private static readonly string[] VirtualPrinterMarkers =
        {
            "Print to PDF",
            "XPS Document Writer",
            "OneNote",
            "Fax",
        };

        private static bool IsVirtualPrinter(string printerName)
        {
            return VirtualPrinterMarkers.Any(marker =>
                printerName.Contains(marker, StringComparison.OrdinalIgnoreCase));
        }

        // Windows keeps a printer object around (still "installed", still
        // passes PrinterSettings.IsValid) even when it can't actually
        // produce output right now - powered off/unplugged/unreachable,
        // paper-jammed, out of paper or toner, a door open, or its queue
        // manually paused after an earlier stuck job. System.Drawing.
        // Printing's print path doesn't reliably throw for any of that, it
        // just hands the job to the spooler and returns "success" - WMI's
        // Win32_Printer is the one place this is actually visible ahead of
        // time. One query covers all of it (WorkOffline, the PrinterState
        // bitmask, and DetectedErrorState as a fallback for whichever of
        // those a given driver actually populates).
        //
        // Returns a short, human-readable reason (fit for a popup message),
        // or null if the printer looks healthy enough to attempt.
        private static string GetPrinterFault(string printerName)
        {
            try
            {
                var escaped = printerName.Replace("'", "''");
                using var searcher = new ManagementObjectSearcher(
                    $"SELECT WorkOffline, PrinterState, DetectedErrorState FROM Win32_Printer WHERE Name = '{escaped}'");
                using var results = searcher.Get();
                foreach (ManagementObject printer in results)
                {
                    using (printer)
                    {
                        if (printer["WorkOffline"] is bool offline && offline)
                        {
                            return "is not connected (offline)";
                        }

                        // Win32_Printer.PrinterState: a bitmask mirroring the
                        // spooler API's PRINTER_STATUS_* flags. Low-toner/
                        // low-paper deliberately don't hold the job - a
                        // printer running low still produces (fainter, but
                        // real) output, so blocking on "low" rather than
                        // "empty" would just be a false alarm on every job.
                        var state = Convert.ToUInt32(printer["PrinterState"] ?? 0u);
                        const uint Paused = 0x1, PrinterError = 0x2, PaperJam = 0x8, PaperOut = 0x10,
                            NoToner = 0x40000, DoorOpen = 0x400000;

                        if ((state & Paused) != 0) return "has its print queue paused";
                        if ((state & PaperJam) != 0) return "has a paper jam";
                        if ((state & PaperOut) != 0) return "is out of paper";
                        if ((state & NoToner) != 0) return "is out of toner/ink";
                        if ((state & DoorOpen) != 0) return "has a door or cover open";
                        if ((state & PrinterError) != 0) return "is reporting an error";

                        // Not every driver populates PrinterState - fall back
                        // to DetectedErrorState (a plain enum, not a bitmask)
                        // for the ones that only set that instead.
                        var errorState = Convert.ToUInt32(printer["DetectedErrorState"] ?? 0u);
                        return errorState switch
                        {
                            4 => "is out of paper",
                            6 => "is out of toner/ink",
                            7 => "has a door or cover open",
                            8 => "has a paper jam",
                            9 => "is not connected (offline)",
                            11 => "has a full output tray",
                            12 => "has a paper problem",
                            _ => null,
                        };
                    }
                }

                // Not found in WMI at all - e.g. unplugged and Windows has
                // dropped it from the printer list - treat that as offline
                // too rather than letting the job silently vanish into a
                // queue nobody is watching.
                return "is not connected (offline)";
            }
            catch
            {
                // WMI unavailable/query failed for an unrelated reason -
                // don't block a possibly-fine printer over an inconclusive
                // check; fall through to the normal print attempt and its
                // existing error handling.
                return null;
            }
        }

        // One dialog at a time, no matter how many queued jobs hit the same
        // faulted printer back to back - each held job still retries on its
        // own via _printedIds.Remove, this just stops the operator from
        // being stacked with a popup per job. Modal on purpose (blocks this
        // form until dismissed): the whole point is the shop owner notices
        // it before walking away, since a customer already paid for a job
        // that is currently going nowhere.
        private void ShowPrinterFaultAlert(string printerName, string fault)
        {
            if (_printerOfflineAlertShown) return;
            _printerOfflineAlertShown = true;
            try
            {
                PrintAlertForm.Show(
                    "Printer Needs Attention",
                    $"Printer \"{printerName}\" {fault}.\n\n" +
                    "Please check it and fix the issue. " +
                    "The customer's print job is on hold and will print automatically once it's resolved - it does not need to be resent.\n\n" +
                    "If a customer is waiting, let them know the shop's printer needs attention.");
            }
            finally
            {
                _printerOfflineAlertShown = false;
            }
        }

        // Same one-at-a-time treatment as ShowPrinterOfflineAlert - a shop
        // whose printer preset never got past a virtual/built-in one would
        // otherwise get this popup once per queued job.
        private void ShowVirtualPrinterAlert(string printerName)
        {
            if (_virtualPrinterAlertShown) return;
            _virtualPrinterAlertShown = true;
            try
            {
                PrintAlertForm.Show(
                    "Wrong Printer Selected",
                    $"\"{printerName}\" is a Windows built-in printer, not a real one - it will never produce paper.\n\n" +
                    "Click the ⚙ gear icon in this app (top-right) and select your actual printer there. " +
                    "The customer's print job is on hold and will print automatically the moment you save a real printer - it does not need to be resent.\n\n" +
                    "If a customer is waiting, let them know the shop's printer needs to be set up.");
            }
            finally
            {
                _virtualPrinterAlertShown = false;
            }
        }

        // Same one-at-a-time treatment as the other print-blocking alerts -
        // triggered when a job needs a paper-size/color-mode combo that was
        // never saved as a preset at all (e.g. only Grayscale was ever set
        // up, and a Color order comes in - there's no row for that
        // combination, matchedPrinter is null, and without this alert that
        // job would just sit silently retrying forever with nothing telling
        // the shop why).
        private void ShowMissingPresetAlert(string paperSize, string colorType)
        {
            if (_missingPresetAlertShown) return;
            _missingPresetAlertShown = true;
            try
            {
                PrintAlertForm.Show(
                    "Printer Not Set Up",
                    $"No printer is set up for {paperSize} / {colorType}.\n\n" +
                    "Click the ⚙ gear icon in this app (top-right) and save a printer preset for this paper size and color mode. " +
                    "The customer's print job is on hold and will print automatically the moment that preset is saved - it does not need to be resent.\n\n" +
                    "If a customer is waiting, let them know the shop's printer needs to be set up for this print type.");
            }
            finally
            {
                _missingPresetAlertShown = false;
            }
        }

        private static string SafeFileName(string value)
        {
            var invalid = Path.GetInvalidFileNameChars();
            var cleaned = new string(value.Select(ch => invalid.Contains(ch) ? '_' : ch).ToArray()).Trim();
            return string.IsNullOrWhiteSpace(cleaned) ? "print-job.pdf" : cleaned;
        }

        private bool ConfirmCashPrint(PrintJob job)
        {
            //if (InvokeRequired)
            //{
            //    return (bool)Invoke(new Func<bool>(() => ConfirmCashPrint(job)));
            //}

            //var result = MessageBox.Show(
            //    $"Customer se Rs. {job.TotalAmount:0.##} cash payment collect karke hi print confirm karein.\n\n{job.PrintColorModeLabel}, {job.Pages} page(s) x {job.Copies}",
            //    "Cash counter print request",
            //    MessageBoxButtons.YesNo,
            //    MessageBoxIcon.Question
            //);
            //return result == DialogResult.Yes;


            if (InvokeRequired)
            {
                return (bool)Invoke(new Func<bool>(() => ConfirmCashPrint(job)));
            }

            return CashConfirmForm.ShowConfirm(
                job.TotalAmount,
                job.PrintColorModeLabel,
                job.Pages,
                job.Copies,
                job.TokenId
            );

        }

        // ── PDF Auto Print (printer explicitly passed) ────────────────
        private void PrintPdfAuto(string filePath, string printer, string paper, string color)
        {
            if (!File.Exists(filePath))
                throw new FileNotFoundException("PDF not found.", filePath);

            _pdfBytes = File.ReadAllBytes(filePath);
            _pdfPageCount = Conversion.GetPageCount(_pdfBytes);
            _currentPageIndex = 0;

            PrintDocument pd = new PrintDocument();
            ApplyPrinterSettings(pd, printer, paper, color);

            if (!pd.PrinterSettings.IsValid)
                throw new Exception($"Printer not valid: {printer}");

            pd.PrintPage += PdfPrintPage;
            try { pd.Print(); }
            finally
            {
                pd.PrintPage -= PdfPrintPage;
                _pdfBytes = null;
            }
        }

        // ── Image Auto Print (printer explicitly passed) ──────────────
        private void PrintImageAuto(string filePath, string printer, string paper, string color)
        {
            imageToPrint = Image.FromFile(filePath);

            if (color == "Grayscale")
                imageToPrint = ConvertToGrayscale((Bitmap)imageToPrint);

            PrintDocument pd = new PrintDocument();
            ApplyPrinterSettings(pd, printer, paper, color);

            if (!pd.PrinterSettings.IsValid)
                throw new Exception($"Printer not valid: {printer}");

            pd.PrintPage += Pd_PrintPage;
            try { pd.Print(); }
            finally
            {
                pd.PrintPage -= Pd_PrintPage;
                imageToPrint.Dispose();
                imageToPrint = null;
            }
        }

        // ── Local bridge (website) hooks ────────────────────────────────

        private AgentStatusSnapshot GetStatusSnapshot()
        {
            if (InvokeRequired)
            {
                return (AgentStatusSnapshot)Invoke(new Func<AgentStatusSnapshot>(GetStatusSnapshot));
            }

            var printers = cmbPrinters.Items.Cast<object>().Select(p => p?.ToString()).Where(name => !string.IsNullOrWhiteSpace(name)).ToArray();
            return new AgentStatusSnapshot
            {
                App = "PrintAgent",
                Status = _wsConnected || _pollTimer is { Enabled: true } ? "running" : "stopped",
                Account = string.IsNullOrWhiteSpace(_config.OwnerEmail) ? "" : $"{_config.OwnerName} {_config.OwnerEmail}".Trim(),
                Printer = cmbPrinters.SelectedItem?.ToString() ?? "",
                Printers = printers,
                ApiBaseUrl = _config.ApiBaseUrl,
                LastCheckAt = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
                Online = !string.IsNullOrWhiteSpace(_config.AccessToken),
            };
        }

        private AgentStatusSnapshot SavePrinterFromLocalApi(string printerName)
        {
            if (InvokeRequired)
            {
                return (AgentStatusSnapshot)Invoke(new Func<string, AgentStatusSnapshot>(SavePrinterFromLocalApi), printerName);
            }

            if (!string.IsNullOrWhiteSpace(printerName))
            {
                if (!cmbPrinters.Items.Contains(printerName))
                {
                    cmbPrinters.Items.Insert(0, printerName);
                }

                cmbPrinters.SelectedItem = printerName;
                LogStatus($"Printer saved from local dashboard: {printerName}");
            }

            return GetStatusSnapshot();
        }

        private PrinterPresetsResponse ListPresetsFromLocalApi()
        {
            if (InvokeRequired)
            {
                return (PrinterPresetsResponse)Invoke(new Func<PrinterPresetsResponse>(ListPresetsFromLocalApi));
            }

            return BuildPresetsResponse();
        }

        private PrinterPresetsResponse SavePresetFromLocalApi(SavePrinterPresetRequest request)
        {
            if (InvokeRequired)
            {
                return (PrinterPresetsResponse)Invoke(new Func<SavePrinterPresetRequest, PrinterPresetsResponse>(SavePresetFromLocalApi), request);
            }

            if (string.IsNullOrWhiteSpace(request.Printer) || string.IsNullOrWhiteSpace(request.PaperSize) || string.IsNullOrWhiteSpace(request.ColorMode))
            {
                throw new InvalidOperationException("Printer, paper size and color mode are required.");
            }

            if (request.Original is { } original && !string.IsNullOrWhiteSpace(original.Printer))
            {
                RemovePresetRow(original.Printer, original.PaperSize, original.ColorMode);
            }

            RemovePresetRow(request.Printer, request.PaperSize, request.ColorMode); // de-dupe exact match
            int rowIdx = dataGridPrinterSetting.Rows.Add(request.Printer, request.PaperSize, request.ColorMode);
            dataGridPrinterSetting.Rows[rowIdx].Cells["colDelete"].Value = "Delete";
            SaveAllSettingsToFile();

            return BuildPresetsResponse();
        }

        private PrinterPresetsResponse DeletePresetFromLocalApi(PrinterPresetDto dto)
        {
            if (InvokeRequired)
            {
                return (PrinterPresetsResponse)Invoke(new Func<PrinterPresetDto, PrinterPresetsResponse>(DeletePresetFromLocalApi), dto);
            }

            RemovePresetRow(dto.Printer, dto.PaperSize, dto.ColorMode);
            SaveAllSettingsToFile();
            return BuildPresetsResponse();
        }

        private void RemovePresetRow(string printer, string paperSize, string colorMode)
        {
            for (var i = dataGridPrinterSetting.Rows.Count - 1; i >= 0; i--)
            {
                var row = dataGridPrinterSetting.Rows[i];
                if (row.IsNewRow) continue;

                var rowPrinter = row.Cells["colPrinter"].Value?.ToString() ?? "";
                var rowPaper = row.Cells["colPageSize"].Value?.ToString() ?? "";
                var rowColor = row.Cells["colColorType"].Value?.ToString() ?? "";

                if (rowPrinter == (printer ?? "") && rowPaper == (paperSize ?? "") && rowColor == (colorMode ?? ""))
                {
                    dataGridPrinterSetting.Rows.RemoveAt(i);
                }
            }
        }

        private PrinterPresetsResponse BuildPresetsResponse()
        {
            var presets = new System.Collections.Generic.List<PrinterPresetDto>();
            foreach (DataGridViewRow row in dataGridPrinterSetting.Rows)
            {
                if (row.IsNewRow) continue;
                presets.Add(new PrinterPresetDto
                {
                    Printer = row.Cells["colPrinter"].Value?.ToString() ?? "",
                    PaperSize = row.Cells["colPageSize"].Value?.ToString() ?? "",
                    ColorMode = row.Cells["colColorType"].Value?.ToString() ?? "",
                });
            }

            var printers = cmbPrinters.Items.Cast<object>().Select(p => p?.ToString()).Where(name => !string.IsNullOrWhiteSpace(name)).ToArray();

            return new PrinterPresetsResponse
            {
                Presets = presets,
                Printers = printers,
                PaperSizes = new[] { "A4", "A5", "Letter" },
                ColorModes = new[] { "Color", "Grayscale" },
            };
        }

        private LocalTestPrintResult RunQrPrintFromLocalApi(LocalTestPrintRequest request, bool isPoster)
        {
            if (InvokeRequired)
            {
                return (LocalTestPrintResult)Invoke(new Func<LocalTestPrintRequest, bool, LocalTestPrintResult>(RunQrPrintFromLocalApi), request, isPoster);
            }

            var printerName = string.IsNullOrWhiteSpace(request.Printer) ? cmbPrinters.SelectedItem?.ToString() : request.Printer;
            if (string.IsNullOrWhiteSpace(printerName))
            {
                throw new InvalidOperationException("Select printer first.");
            }

            if (!string.IsNullOrWhiteSpace(request.Printer) && !cmbPrinters.Items.Contains(request.Printer))
            {
                cmbPrinters.Items.Insert(0, request.Printer);
            }
            if (!string.IsNullOrWhiteSpace(request.Printer))
            {
                cmbPrinters.SelectedItem = request.Printer;
            }

            var colorMode = ParseColorMode(request.ColorMode);
            var result = isPoster
                ? QrPrintService.PrintQrPoster(printerName, request.ShopName ?? "CafeMitra Shop", request.ShopCode ?? "", request.QrUrl ?? "", request.QrImage ?? "", colorMode)
                : QrPrintService.PrintQrTestPage(printerName, request.ShopName ?? "CafeMitra Shop", request.ShopCode ?? "", request.QrUrl ?? "", request.QrImage ?? "", colorMode);

            LogStatus($"{(isPoster ? "Poster print" : "Test print")}: {result}");
            return new LocalTestPrintResult
            {
                Message = result,
                Printer = printerName,
                PrintedAt = DateTimeOffset.Now.ToString("O"),
                Printers = PrinterSettings.InstalledPrinters.Cast<string>().ToArray(),
            };
        }

        private static PrintColorMode ParseColorMode(string value)
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

        // ── Simple Status Log ─────────────────────────────────────────
        // Cap on-disk log size so a chatty session (e.g. the poll timer
        // ticking every few seconds for days) can't grow this file
        // unbounded - trimmed back to half this size, not to zero, so
        // there's still recent context immediately after a trim.
        private const long MaxLogFileBytes = 2 * 1024 * 1024; // 2 MB

        private void LogStatus(string msg)
        {
            var line = $"[{DateTime.Now:HH:mm:ss}] {msg}";
            System.Diagnostics.Debug.WriteLine(line);
            AppendToLogFile(line);
            AppendToLogBox(line);
        }

        // Split out of LogStatus so the file/Debug writes above only ever
        // happen once per call - this recurses via BeginInvoke to reach the
        // UI thread, and having the whole of LogStatus in that recursive
        // path (as before) meant every call from a background thread (e.g.
        // WebSocketAgentClient's log callback, off Task.Run) wrote its line
        // to agent.log twice: once before the redirect, once again when the
        // redirected call re-ran from the top.
        private void AppendToLogBox(string line)
        {
            if (txtAgentLog is null) return;

            if (txtAgentLog.InvokeRequired)
            {
                txtAgentLog.BeginInvoke(new Action(() => AppendToLogBox(line)));
                return;
            }

            txtAgentLog.AppendText(line + Environment.NewLine);
        }

        // Persists every LogStatus line to disk (see AgentPaths.LogPath) so
        // the activity log survives the app being closed/exited - the UI
        // log box is in-memory only and is lost the moment the process ends,
        // which made past issues impossible to diagnose after the fact.
        // Best-effort: a disk/permission hiccup here must never crash the
        // agent or block the caller.
        private static void AppendToLogFile(string line)
        {
            try
            {
                Directory.CreateDirectory(AgentPaths.ConfigDir);

                var info = new FileInfo(AgentPaths.LogPath);
                if (info.Exists && info.Length > MaxLogFileBytes)
                {
                    var lines = File.ReadAllLines(AgentPaths.LogPath);
                    var keepFrom = Math.Max(0, lines.Length - lines.Length / 2);
                    File.WriteAllLines(AgentPaths.LogPath, lines[keepFrom..]);
                }

                File.AppendAllText(AgentPaths.LogPath, line + Environment.NewLine);
            }
            catch
            {
                // Best-effort - see comment above.
            }
        }

        // ── Printed-Job Durability (see _recoveredPrintedIds) ──────────
        // Newline-delimited job IDs, capped the same way as agent.log - a
        // long-running shop could otherwise grow this file unbounded, and
        // only the most recent IDs are ever useful (older ones' jobs have
        // long since either had their status update land, or been retried
        // and resolved some other way).
        private const int MaxPrintedJobIdEntries = 2000;

        private void LoadPrintedJobIds()
        {
            try
            {
                if (!File.Exists(AgentPaths.PrintedJobsPath)) return;

                foreach (var line in File.ReadAllLines(AgentPaths.PrintedJobsPath))
                {
                    if (int.TryParse(line.Trim(), out var jobId))
                    {
                        _recoveredPrintedIds.Add(jobId);
                    }
                }

                if (_recoveredPrintedIds.Count > 0)
                {
                    LogStatus($"Loaded {_recoveredPrintedIds.Count} previously-printed job ID(s) from disk - these will be reconciled, not reprinted, if the server still lists them.");
                }
            }
            catch (Exception error)
            {
                // Best-effort: if this can't be read, the agent just loses
                // the crash-recovery safety net for this run, not the
                // ability to print - never block startup over it.
                LogStatus($"Could not load printed-job history: {error.Message}");
            }
        }

        // Best-effort: a disk/permission hiccup here must never crash the
        // agent or block the caller - see AppendToLogFile above.
        private static void PersistPrintedJobId(int jobId)
        {
            try
            {
                Directory.CreateDirectory(AgentPaths.ConfigDir);

                var info = new FileInfo(AgentPaths.PrintedJobsPath);
                if (info.Exists)
                {
                    var lines = File.ReadAllLines(AgentPaths.PrintedJobsPath);
                    if (lines.Length > MaxPrintedJobIdEntries)
                    {
                        var keepFrom = Math.Max(0, lines.Length - MaxPrintedJobIdEntries / 2);
                        File.WriteAllLines(AgentPaths.PrintedJobsPath, lines[keepFrom..]);
                    }
                }

                File.AppendAllText(AgentPaths.PrintedJobsPath, jobId.ToString(System.Globalization.CultureInfo.InvariantCulture) + Environment.NewLine);
            }
            catch
            {
                // Best-effort - see comment above.
            }
        }

        // ── Cleanup on Form Close ─────────────────────────────────────
        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            if (!_isExiting && e.CloseReason == CloseReason.UserClosing)
            {
                e.Cancel = true;
                MinimizeToTray();
                return;
            }

            _autoLoginStop?.Cancel();
            _pollTimer?.Stop();
            _pollTimer?.Dispose();
            _loginReminderTimer?.Stop();
            _loginReminderTimer?.Dispose();
            _localServer?.Dispose();
            _wsClient?.Dispose();
            _wsBlinkTimer?.Stop();
            _wsBlinkTimer?.Dispose();
            _printQueueGate?.Dispose();
            _trayIcon?.Dispose();
            base.OnFormClosing(e);
        }

        private void cBoxSettingPage_SelectedIndexChanged(object sender, EventArgs e)
        {

        }

        private void close_Click(object sender, EventArgs e)
        {
            this.Close();
        }

        private void txtAgentLog_TextChanged(object sender, EventArgs e)
        {

        }

        private void softwareVersion_Click(object sender, EventArgs e)
        {

        }
    }


    public class CashConfirmForm : Form
    {
        private readonly Label lblTitle;
        private readonly Label lblToken;
        private readonly Label lblAmount;
        private readonly Label lblDetails;
        private readonly Button btnConfirm;
        private readonly Button btnReject;

        public bool Confirmed { get; private set; }

        public CashConfirmForm(decimal amount, string colorLabel, int pages, int copies, string tokenId)
        {
            // ── Form chrome ──────────────────────────────────────────
            FormBorderStyle = FormBorderStyle.None;
            StartPosition = FormStartPosition.CenterScreen;
            Size = new Size(420, 292);
            BackColor = Color.White;
            TopMost = true;                 // always-on-top
            ShowInTaskbar = true;
            KeyPreview = true;

            // Rounded corners
            Region = Region.FromHrgn(NativeMethods.CreateRoundRectRgn(0, 0, Width, Height, 18, 18));

            // Subtle border via Paint
            Paint += (s, e) =>
            {
                using var pen = new Pen(Theme.Teal, 2);
                e.Graphics.DrawRectangle(pen, 1, 1, Width - 3, Height - 3);
            };

            // ── Top accent bar ───────────────────────────────────────
            var topBar = new Panel
            {
                Dock = DockStyle.Top,
                Height = 56,
                BackColor = Theme.Teal
            };
            lblTitle = new Label
            {
                Text = "Cash Counter Print Request",
                ForeColor = Color.White,
                Font = new Font("Segoe UI", 12F, FontStyle.Bold),
                AutoSize = false,
                TextAlign = ContentAlignment.MiddleLeft,
                Dock = DockStyle.Fill,
                Padding = new Padding(20, 0, 0, 0)
            };
            topBar.Controls.Add(lblTitle);

            // Close (X) button top-right
            var btnClose = new Button
            {
                Text = "✕",
                FlatStyle = FlatStyle.Flat,
                ForeColor = Color.White,
                BackColor = Theme.Teal,
                Size = new Size(40, 40),
                Location = new Point(Width - 48, 8),
                Cursor = Cursors.Hand,
                Anchor = AnchorStyles.Top | AnchorStyles.Right
            };
            btnClose.FlatAppearance.BorderSize = 0;
            btnClose.FlatAppearance.MouseOverBackColor = Color.FromArgb(255, 255, 255, 40);
            btnClose.Click += (s, e) => RejectAndClose();
            topBar.Controls.Add(btnClose);
            btnClose.BringToFront();

            // ── Token/Order ID (so the cafe owner knows which customer this
            // request belongs to) ────────────────────────────────────
            lblToken = new Label
            {
                Text = string.IsNullOrWhiteSpace(tokenId) ? "" : $"Token: {tokenId}",
                Font = new Font("Segoe UI", 9.5F, FontStyle.Bold),
                ForeColor = Theme.Teal,
                AutoSize = false,
                TextAlign = ContentAlignment.MiddleCenter,
                Location = new Point(20, 64),
                Size = new Size(Width - 40, 22)
            };

            // ── Amount (big, bold) ───────────────────────────────────
            lblAmount = new Label
            {
                Text = $"₹{amount:0.##}",
                Font = new Font("Segoe UI", 26F, FontStyle.Bold),
                ForeColor = Theme.Teal,
                AutoSize = false,
                TextAlign = ContentAlignment.MiddleCenter,
                Location = new Point(20, 104),
                Size = new Size(Width - 40, 50)
            };

            // ── Details line ─────────────────────────────────────────
            lblDetails = new Label
            {
                Text = $"{colorLabel}  •  {pages} page(s)  ×  {copies} copy/copies",
                Font = new Font("Segoe UI", 10F),
                ForeColor = Color.Gray,
                AutoSize = false,
                TextAlign = ContentAlignment.MiddleCenter,
                Location = new Point(20, 154),
                Size = new Size(Width - 40, 24)
            };

            var lblInstruction = new Label
            {
                Text = "Please collect cash from the customer before confirming.",
                Font = new Font("Segoe UI", 9.5F, FontStyle.Italic),
                ForeColor = Color.DimGray,
                AutoSize = false,
                TextAlign = ContentAlignment.MiddleCenter,
                Location = new Point(20, 182),
                Size = new Size(Width - 40, 36)
            };

            // ── Buttons ──────────────────────────────────────────────
            btnReject = new Button
            {
                Text = "Reject",
                Size = new Size(160, 42),
                Location = new Point(30, 232),
                Font = new Font("Segoe UI", 10F, FontStyle.Bold),
                Cursor = Cursors.Hand
            };
            Theme.StyleSecondaryButton(btnReject);
            btnReject.Click += (s, e) => RejectAndClose();

            btnConfirm = new Button
            {
                Text = "Confirm ✓",
                Size = new Size(160, 42),
                Location = new Point(Width - 190, 232),
                Font = new Font("Segoe UI", 10F, FontStyle.Bold),
                Cursor = Cursors.Hand
            };
            Theme.StylePrimaryButton(btnConfirm);
            btnConfirm.Click += (s, e) => ConfirmAndClose();

            Controls.Add(topBar);
            Controls.Add(lblToken);
            Controls.Add(lblAmount);
            Controls.Add(lblDetails);
            Controls.Add(lblInstruction);
            Controls.Add(btnReject);
            Controls.Add(btnConfirm);

            AcceptButton = btnConfirm;
            CancelButton = btnReject;

            // Allow dragging the borderless form from the top bar
            topBar.MouseDown += (s, e) => NativeMethods.DragMove(this, e);
            lblTitle.MouseDown += (s, e) => NativeMethods.DragMove(this, e);
        }

        private void ConfirmAndClose()
        {
            Confirmed = true;
            DialogResult = DialogResult.OK;
            Close();
        }

        private void RejectAndClose()
        {
            Confirmed = false;
            DialogResult = DialogResult.Cancel;
            Close();
        }

        /// <summary>
        /// Shows the dialog modally and returns true if the user confirmed cash collection.
        /// </summary>
        public static bool ShowConfirm(decimal amount, string colorLabel, int pages, int copies, string tokenId)
        {
            using var form = new CashConfirmForm(amount, colorLabel, pages, copies, tokenId);
            form.ShowDialog();
            return form.Confirmed;
        }
    }

    /// Same branded-popup template as CashConfirmForm (borderless, rounded,
    /// colored top bar, draggable, TopMost) - used for the "your print job
    /// is stuck" family of alerts (offline printer, virtual printer, no
    /// preset saved) instead of a plain MessageBox, so they read as part of
    /// the app rather than a generic Windows dialog. Amber instead of teal:
    /// teal already means "success/confirmed" elsewhere in this app (the
    /// signed-in badge, Cash Counter's own Confirm), and these are warnings.
    public class PrintAlertForm : Form
    {
        private readonly Label lblBody;
        private readonly Button btnOk;

        public PrintAlertForm(string title, string message)
        {
            FormBorderStyle = FormBorderStyle.None;
            StartPosition = FormStartPosition.CenterScreen;
            Size = new Size(460, 360);
            BackColor = Color.White;
            TopMost = true;
            ShowInTaskbar = true;
            KeyPreview = true;

            Region = Region.FromHrgn(NativeMethods.CreateRoundRectRgn(0, 0, Width, Height, 18, 18));

            Paint += (s, e) =>
            {
                using var pen = new Pen(Theme.Warning, 2);
                e.Graphics.DrawRectangle(pen, 1, 1, Width - 3, Height - 3);
            };

            var topBar = new Panel
            {
                Dock = DockStyle.Top,
                Height = 56,
                BackColor = Theme.Warning
            };
            var lblTitle = new Label
            {
                Text = "⚠  " + title,
                ForeColor = Color.White,
                Font = new Font("Segoe UI", 12F, FontStyle.Bold),
                AutoSize = false,
                TextAlign = ContentAlignment.MiddleLeft,
                Dock = DockStyle.Fill,
                Padding = new Padding(20, 0, 0, 0)
            };
            topBar.Controls.Add(lblTitle);

            var btnClose = new Button
            {
                Text = "✕",
                FlatStyle = FlatStyle.Flat,
                ForeColor = Color.White,
                BackColor = Theme.Warning,
                Size = new Size(40, 40),
                Location = new Point(Width - 48, 8),
                Cursor = Cursors.Hand,
                Anchor = AnchorStyles.Top | AnchorStyles.Right
            };
            btnClose.FlatAppearance.BorderSize = 0;
            btnClose.FlatAppearance.MouseOverBackColor = Color.FromArgb(255, 255, 255, 40);
            btnClose.Click += (s, e) => Close();
            topBar.Controls.Add(btnClose);
            btnClose.BringToFront();

            lblBody = new Label
            {
                Text = message,
                Font = new Font("Segoe UI", 10F),
                ForeColor = Theme.TextPrimary,
                AutoSize = false,
                TextAlign = ContentAlignment.TopLeft,
                Location = new Point(24, 72),
                Size = new Size(Width - 48, 216)
            };

            btnOk = new Button
            {
                Text = "Got it",
                Size = new Size(160, 42),
                Location = new Point(Width - 190, 300),
                Font = new Font("Segoe UI", 10F, FontStyle.Bold),
                Cursor = Cursors.Hand
            };
            Theme.StylePrimaryButton(btnOk);
            btnOk.Click += (s, e) => Close();

            Controls.Add(topBar);
            Controls.Add(lblBody);
            Controls.Add(btnOk);

            AcceptButton = btnOk;
            CancelButton = btnOk;

            topBar.MouseDown += (s, e) => NativeMethods.DragMove(this, e);
            lblTitle.MouseDown += (s, e) => NativeMethods.DragMove(this, e);
        }

        public static void Show(string title, string message)
        {
            using var form = new PrintAlertForm(title, message);
            form.ShowDialog();
        }
    }

    /// Shown when the saved auto-login gets rejected by the server (e.g. the
    /// account password changed elsewhere). Deliberately a real, borderless
    /// popup rather than a NotifyIcon balloon - Windows auto-hides balloons
    /// after a few seconds regardless of what the app wants, which makes
    /// them easy to miss entirely while the app sits minimized in the tray.
    /// This one stays open until the operator picks one of the two actions.
    public class LoginReminderForm : Form
    {
        private readonly Button btnLoginNow;
        private readonly Button btnRemindLater;

        public bool LoginRequested { get; private set; }

        public LoginReminderForm()
        {
            FormBorderStyle = FormBorderStyle.None;
            StartPosition = FormStartPosition.CenterScreen;
            Size = new Size(420, 230);
            BackColor = Color.White;
            TopMost = true;
            ShowInTaskbar = true;
            KeyPreview = true;

            Region = Region.FromHrgn(NativeMethods.CreateRoundRectRgn(0, 0, Width, Height, 18, 18));

            Paint += (s, e) =>
            {
                using var pen = new Pen(Theme.Teal, 2);
                e.Graphics.DrawRectangle(pen, 1, 1, Width - 3, Height - 3);
            };

            var topBar = new Panel
            {
                Dock = DockStyle.Top,
                Height = 56,
                BackColor = Theme.Teal
            };
            var lblTitle = new Label
            {
                Text = "Sign-in Needed",
                ForeColor = Color.White,
                Font = new Font("Segoe UI", 12F, FontStyle.Bold),
                AutoSize = false,
                TextAlign = ContentAlignment.MiddleLeft,
                Dock = DockStyle.Fill,
                Padding = new Padding(20, 0, 0, 0)
            };
            topBar.Controls.Add(lblTitle);

            var lblMessage = new Label
            {
                Text = "Print Agent couldn't sign in automatically - the saved password may have changed.\n\nSign in again to keep printing jobs for this shop.",
                Font = new Font("Segoe UI", 10F),
                ForeColor = Color.DimGray,
                AutoSize = false,
                TextAlign = ContentAlignment.TopLeft,
                Location = new Point(20, 70),
                Size = new Size(Width - 40, 90)
            };

            btnRemindLater = new Button
            {
                Text = "Remind Me in 1 Hour",
                Size = new Size(190, 42),
                Location = new Point(24, 168),
                Font = new Font("Segoe UI", 9.5F, FontStyle.Bold),
                Cursor = Cursors.Hand
            };
            Theme.StyleSecondaryButton(btnRemindLater);
            btnRemindLater.Click += (s, e) => RemindLaterAndClose();

            btnLoginNow = new Button
            {
                Text = "Login Now",
                Size = new Size(160, 42),
                Location = new Point(Width - 190, 168),
                Font = new Font("Segoe UI", 9.5F, FontStyle.Bold),
                Cursor = Cursors.Hand
            };
            Theme.StylePrimaryButton(btnLoginNow);
            btnLoginNow.Click += (s, e) => LoginNowAndClose();

            Controls.Add(topBar);
            Controls.Add(lblMessage);
            Controls.Add(btnRemindLater);
            Controls.Add(btnLoginNow);

            AcceptButton = btnLoginNow;

            // Closing via the X / Alt+F4 counts as "remind later", not
            // "logged in" - never silently treat a dismissed popup as handled.
            FormClosing += (s, e) =>
            {
                if (e.CloseReason == CloseReason.UserClosing && !_resolved)
                {
                    RemindLaterAndClose();
                }
            };

            topBar.MouseDown += (s, e) => NativeMethods.DragMove(this, e);
            lblTitle.MouseDown += (s, e) => NativeMethods.DragMove(this, e);
        }

        private bool _resolved;

        private void LoginNowAndClose()
        {
            _resolved = true;
            LoginRequested = true;
            Close();
        }

        private void RemindLaterAndClose()
        {
            _resolved = true;
            LoginRequested = false;
            Close();
        }

        /// <summary>
        /// Shows the popup modally. Returns true if "Login Now" was chosen,
        /// false if snoozed ("Remind Me in 1 Hour" or dismissed).
        /// </summary>
        public static bool ShowReminder()
        {
            using var form = new LoginReminderForm();
            form.ShowDialog();
            return form.LoginRequested;
        }
    }

    internal static class NativeMethods
    {
        [System.Runtime.InteropServices.DllImport("gdi32.dll")]
        internal static extern IntPtr CreateRoundRectRgn(
            int nLeftRect, int nTopRect, int nRightRect, int nBottomRect,
            int nWidthEllipse, int nHeightEllipse);

        // Lets you drag a FormBorderStyle.None form by a child control
        [System.Runtime.InteropServices.DllImport("user32.dll")]
        private static extern bool ReleaseCapture();

        [System.Runtime.InteropServices.DllImport("user32.dll")]
        private static extern IntPtr SendMessage(IntPtr hWnd, int Msg, int wParam, int lParam);

        internal static void DragMove(Form form, MouseEventArgs e)
        {
            if (e.Button != MouseButtons.Left) return;
            ReleaseCapture();
            SendMessage(form.Handle, 0x112 /*WM_SYSCOMMAND*/, 0xF012 /*SC_MOVE + HTCAPTION*/, 0);
        }
    }
}
