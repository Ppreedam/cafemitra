using Patagames.Pdf;
using Patagames.Pdf.Enums;
using Patagames.Pdf.Net;
using System;
using System.Drawing;
using System.Drawing.Printing;
using System.IO;
using System.Windows.Forms;

namespace Print_Agent
{
    public partial class Form1 : Form
    {
        // ── Fields ────────────────────────────────────────────────────
        private System.Windows.Forms.Timer _pollTimer;
        private readonly System.Collections.Generic.HashSet<int> _printedIds
            = new System.Collections.Generic.HashSet<int>();

        private readonly AgentConfig _config;
        private readonly string _configPath;
        private LocalStatusServer _localServer;
        private CancellationTokenSource _autoLoginStop;

        private static readonly string SettingsFilePath =
        Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "printer_settings.txt");

        private const string DefaultPaperSize = "A4";

        private string selectedFile = string.Empty;
        private Image imageToPrint;

        private PdfDocument _pdfDoc;
        private int _currentPageIndex;

        public Form1()
        {
            components = new System.ComponentModel.Container();
            InitializeComponent();
            PdfCommon.Initialize();
            LoadPrinters();

            Directory.CreateDirectory(AgentPaths.ConfigDir);
            Directory.CreateDirectory(AgentPaths.JobsDir);
            _configPath = AgentPaths.ConfigPath;
            _config = AgentConfig.Load(_configPath);
        }

        // ── Login ─────────────────────────────────────────────────────

        private CafeMitraApi NewApi()
        {
            var http = new System.Net.Http.HttpClient { BaseAddress = new Uri(_config.ApiBaseUrl.TrimEnd('/') + "/"), Timeout = TimeSpan.FromSeconds(20) };
            return new CafeMitraApi(http, _config, _configPath);
        }

        private void UpdateAccountLabel()
        {
            lblAccountStatus.Text = string.IsNullOrWhiteSpace(_config.AccessToken)
                ? "Not logged in"
                : $"Logged in as {_config.OwnerName} ({_config.OwnerEmail})".Trim();
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

        private async void btnLogin_Click(object sender, EventArgs e)
        {
            _autoLoginStop?.Cancel();
            btnLogin.Enabled = false;
            try
            {
                var email = txtEmail.Text.Trim();
                var password = txtPassword.Text;
                if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
                {
                    MessageBox.Show("Enter email and password.", "Print Agent", MessageBoxButtons.OK, MessageBoxIcon.Warning);
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
                txtPassword.Clear();
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
                btnLogin.Enabled = true;
            }
        }

        private void btnLogout_Click(object sender, EventArgs e)
        {
            _autoLoginStop?.Cancel();
            _config.AccessToken = "";
            _config.RefreshToken = "";
            AgentConfig.Save(_configPath, _config);
            CredentialStore.Clear();
            txtPassword.Clear();
            UpdateAccountLabel();
            LogStatus("Logged out and removed the saved login from this computer.");
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
                MessageBox.Show("Please select all settings before saving.",
                    "Validation", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            // Append to file
            File.AppendAllText(SettingsFilePath, $"{printer}|{pageSize}|{colorType}{Environment.NewLine}");

            // Add row to grid
            int rowIdx = dataGridPrinterSetting.Rows.Add(printer, pageSize, colorType);
            dataGridPrinterSetting.Rows[rowIdx].Cells["colDelete"].Value = "Delete";

            MessageBox.Show("Settings saved successfully.", "Saved",
                MessageBoxButtons.OK, MessageBoxIcon.Information);
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
                MessageBox.Show("Please select a file first.");
                return;
            }

            if (cmbPrinters.SelectedItem == null)
            {
                MessageBox.Show("Please select a printer.");
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
                    MessageBox.Show("Unsupported file type.");
                    return;
                }

                MessageBox.Show("Print job sent successfully.", "Success",
                    MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Printing Error",
                    MessageBoxButtons.OK, MessageBoxIcon.Error);
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

            _pdfDoc = PdfDocument.Load(filePath);
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
                _pdfDoc.Dispose();
                _pdfDoc = null;
            }
        }

        private void PdfPrintPage(object sender, PrintPageEventArgs e)
        {
            using (PdfPage page = _pdfDoc.Pages[_currentPageIndex])
            {
                Rectangle bounds = e.MarginBounds;

                float dpi = e.Graphics.DpiX > 0 ? e.Graphics.DpiX : 96f;

                int bmpWidth = (int)(page.Width / 72f * dpi);
                int bmpHeight = (int)(page.Height / 72f * dpi);

                using (PdfBitmap pdfBmp = new PdfBitmap(bmpWidth, bmpHeight, true))
                {
                    pdfBmp.FillRect(0, 0, bmpWidth, bmpHeight, new FS_COLOR(255, 255, 255, 255));

                    page.Render(
                        pdfBmp,
                        0, 0,
                        bmpWidth, bmpHeight,
                        Patagames.Pdf.PageRotate.Normal,
                        RenderFlags.FPDF_PRINTING);

                    using (Bitmap bmp = new Bitmap(
                        pdfBmp.Width, pdfBmp.Height,
                        pdfBmp.Stride,
                        System.Drawing.Imaging.PixelFormat.Format32bppArgb,
                        pdfBmp.Buffer))
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
                }

                _currentPageIndex++;
                e.HasMorePages = (_currentPageIndex < _pdfDoc.Pages.Count);
            }
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
            // Start hidden in the tray on every launch - Hide() here (rather
            // than never showing at all) still lets Load run normally so the
            // poll timer/local server/etc. below all start correctly.
            WindowState = FormWindowState.Minimized;
            Hide();

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
                Width = 200,
                ReadOnly = true
            });

            dataGridPrinterSetting.Columns.Add(new DataGridViewTextBoxColumn
            {
                Name = "colPageSize",
                HeaderText = "Page Size",
                Width = 100,
                ReadOnly = true
            });

            dataGridPrinterSetting.Columns.Add(new DataGridViewTextBoxColumn
            {
                Name = "colColorType",
                HeaderText = "Color",
                Width = 100,
                ReadOnly = true
            });

            dataGridPrinterSetting.Columns.Add(new DataGridViewButtonColumn
            {
                Name = "colDelete",
                HeaderText = "",
                Text = "Delete",
                UseColumnTextForButtonValue = true,
                Width = 70,
                FlatStyle = FlatStyle.Flat
            });
            // ─────────────────────────────────────────────────────────

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

            UpdateAccountLabel();

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

            // ── Poll Timer ────────────────────────────────────────────────
            _pollTimer = new System.Windows.Forms.Timer();
            _pollTimer.Interval = Math.Max(_config.PollIntervalSeconds, 5) * 1000;
            _pollTimer.Tick += async (s, ev) => await PollAndPrintAsync();
            _pollTimer.Start();

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

        // ── Download + Auto Print One Job ──────────────────────────────
        private async System.Threading.Tasks.Task ProcessJobAsync(CafeMitraApi api, PrintJob job)
        {
            var tokenId = string.IsNullOrWhiteSpace(job.TokenId) ? $"Order {job.Id}" : job.TokenId;

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
                    LogStatus($"{tokenId}: no matching printer for {DefaultPaperSize} / {colorType} - skipping (add it in Printer Setting).");
                    _printedIds.Remove(job.Id); // retry next poll once a matching printer is saved
                    return;
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
                for (var copy = 0; copy < copies; copy++)
                {
                    if (string.IsNullOrWhiteSpace(selectedFile))
                    {
                        MessageBox.Show("Please select a file first.");
                        return;
                    }

                    if (cmbPrinters.SelectedItem == null)
                    {
                        MessageBox.Show("Please select a printer.");
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
                            MessageBox.Show("Unsupported file type.");
                            return;
                        }

                        MessageBox.Show("Print job sent successfully.", "Success",
                            MessageBoxButtons.OK, MessageBoxIcon.Information);
                    }
                    catch (Exception ex)
                    {
                        MessageBox.Show(ex.Message, "Printing Error",
                            MessageBoxButtons.OK, MessageBoxIcon.Error);
                    }
                }

                var printResult = $"Printed via {matchedPrinter} ({job.PrintColorModeLabel}), {copies} cop{(copies == 1 ? "y" : "ies")}.";
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

        private static string SafeFileName(string value)
        {
            var invalid = Path.GetInvalidFileNameChars();
            var cleaned = new string(value.Select(ch => invalid.Contains(ch) ? '_' : ch).ToArray()).Trim();
            return string.IsNullOrWhiteSpace(cleaned) ? "print-job.pdf" : cleaned;
        }

        private bool ConfirmCashPrint(PrintJob job)
        {
            if (InvokeRequired)
            {
                return (bool)Invoke(new Func<bool>(() => ConfirmCashPrint(job)));
            }

            var result = MessageBox.Show(
                $"Customer se Rs. {job.TotalAmount:0.##} cash payment collect karke hi print confirm karein.\n\n{job.PrintColorModeLabel}, {job.Pages} page(s) x {job.Copies}",
                "Cash counter print request",
                MessageBoxButtons.YesNo,
                MessageBoxIcon.Question
            );
            return result == DialogResult.Yes;
        }

        // ── PDF Auto Print (printer explicitly passed) ────────────────
        private void PrintPdfAuto(string filePath, string printer, string paper, string color)
        {
            if (!File.Exists(filePath))
                throw new FileNotFoundException("PDF not found.", filePath);

            _pdfDoc = PdfDocument.Load(filePath);
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
                _pdfDoc.Dispose();
                _pdfDoc = null;
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
                Status = _pollTimer is { Enabled: true } ? "running" : "stopped",
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
        private void LogStatus(string msg)
        {
            System.Diagnostics.Debug.WriteLine($"[{DateTime.Now:HH:mm:ss}] {msg}");

            if (txtAgentLog is null) return;

            if (txtAgentLog.InvokeRequired)
            {
                txtAgentLog.BeginInvoke(new Action(() => LogStatus(msg)));
                return;
            }

            txtAgentLog.AppendText($"[{DateTime.Now:HH:mm:ss}] {msg}{Environment.NewLine}");
        }

        // ── Cleanup on Form Close ─────────────────────────────────────
        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            _autoLoginStop?.Cancel();
            _pollTimer?.Stop();
            _pollTimer?.Dispose();
            _localServer?.Dispose();
            trayIcon.Visible = false; // hide immediately so the icon doesn't linger in the tray
            base.OnFormClosing(e);
        }

        private void cBoxSettingPage_SelectedIndexChanged(object sender, EventArgs e)
        {

        }

        private void close_Click(object sender, EventArgs e)
        {
            this.Close();
        }

        // ── Tray behavior ─────────────────────────────────────────────
        protected override void OnResize(EventArgs e)
        {
            base.OnResize(e);
            if (WindowState == FormWindowState.Minimized)
            {
                Hide(); // no taskbar entry either way (ShowInTaskbar=false) - tray icon is the only way back
            }
        }

        private void RestoreFromTray()
        {
            Show();
            WindowState = FormWindowState.Normal;
            Activate();
            BringToFront();
        }

        private void trayIcon_DoubleClick(object sender, EventArgs e) => RestoreFromTray();

        private void openMenuItem_Click(object sender, EventArgs e) => RestoreFromTray();

        private void exitMenuItem_Click(object sender, EventArgs e)
        {
            try { File.WriteAllText(AgentPaths.StopFlagPath, "1"); } catch { /* best effort */ }
            Application.Exit();
        }
    }
}
