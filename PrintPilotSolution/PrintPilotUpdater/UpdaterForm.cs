using System.Diagnostics;
using System.Drawing;
using System.IO.Compression;
using System.Windows.Forms;

namespace PrintPilotUpdater;

internal sealed class UpdaterForm : Form
{
    private static readonly Color Brand = Color.FromArgb(13, 23, 72);
    private static readonly Color Accent = Color.FromArgb(87, 64, 237);
    private static readonly Color Danger = Color.FromArgb(199, 48, 75);
    private static readonly Color Muted = Color.FromArgb(89, 101, 140);

    private readonly UpdateOptions _options;
    private readonly Label _title = new();
    private readonly Label _status = new();
    private readonly ProgressBar _progress = new();
    private readonly Button _close = new();

    public UpdaterForm(UpdateOptions options)
    {
        _options = options;

        Text = "PrintPilot Updater";
        Width = 460;
        Height = 220;
        FormBorderStyle = FormBorderStyle.FixedDialog;
        MaximizeBox = false;
        MinimizeBox = false;
        StartPosition = FormStartPosition.CenterScreen;
        BackColor = Color.White;
        TopMost = true;
        Font = new Font("Segoe UI", 10);

        BuildUi();
        Shown += async (_, _) => await RunUpdate();
    }

    private void BuildUi()
    {
        var root = new TableLayoutPanel { Dock = DockStyle.Fill, Padding = new Padding(24), RowCount = 4, ColumnCount = 1 };
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.Percent, 100));
        Controls.Add(root);

        _title.Text = "Updating PrintPilot Agent";
        _title.AutoSize = true;
        _title.Font = new Font("Segoe UI", 14, FontStyle.Bold);
        _title.ForeColor = Brand;
        root.Controls.Add(_title);

        _status.Text = "Preparing update…";
        _status.AutoSize = true;
        _status.ForeColor = Muted;
        _status.Padding = new Padding(0, 8, 0, 12);
        root.Controls.Add(_status);

        _progress.Dock = DockStyle.Top;
        _progress.Height = 14;
        _progress.Style = ProgressBarStyle.Continuous;
        root.Controls.Add(_progress);

        _close.Text = "Close";
        _close.Visible = false;
        _close.AutoSize = true;
        _close.FlatStyle = FlatStyle.Flat;
        _close.BackColor = Accent;
        _close.ForeColor = Color.White;
        _close.FlatAppearance.BorderSize = 0;
        _close.Margin = new Padding(0, 16, 0, 0);
        _close.Click += (_, _) => Close();
        root.Controls.Add(_close);
    }

    private void SetStatus(string text, int? percent = null, bool isError = false)
    {
        if (InvokeRequired)
        {
            BeginInvoke(() => SetStatus(text, percent, isError));
            return;
        }

        _status.Text = text;
        _status.ForeColor = isError ? Danger : Muted;
        if (percent is not null)
        {
            _progress.Value = Math.Clamp(percent.Value, 0, 100);
        }
    }

    private async Task RunUpdate()
    {
        try
        {
            await CloseMainAppBeforeUpdating();

            SetStatus("Downloading update…", 10);
            var zipPath = Path.Combine(Path.GetTempPath(), $"printpilot-update-{Guid.NewGuid():N}.zip");
            await DownloadWithProgress($"{_options.ApiBaseUrl.TrimEnd('/')}/api/agent/update/", zipPath);

            SetStatus("Extracting update…", 65);
            var extractDir = Path.Combine(Path.GetTempPath(), $"printpilot-update-{Guid.NewGuid():N}");
            Directory.CreateDirectory(extractDir);
            ZipFile.ExtractToDirectory(zipPath, extractDir, overwriteFiles: true);

            SetStatus("Installing update…", 80);
            await CopyOverInstallDirWithRetry(extractDir, _options.InstallDir);

            SetStatus("Recording new version…", 92);
            await RefreshLocalVersionFile();

            CleanupQuiet(zipPath, extractDir);

            SetStatus("Update complete. Restarting PrintPilot…", 100);
            RelaunchMainApp();
            await Task.Delay(600);
            Close();
        }
        catch (Exception error)
        {
            SetStatus($"Update failed: {error.Message}", isError: true);
            _close.Visible = true;
            // Don't leave the shop stuck without a working app - bring the
            // previous version back up even though the update failed.
            RelaunchMainApp();
        }
    }

    /// Actively shuts PrintPilot down before touching any files - first asks
    /// it to close normally (so it saves config etc.), then force-kills it
    /// if it hasn't gone within a few seconds. We only move on to
    /// downloading/extracting once it's confirmed gone, so PrintPilot.exe
    /// and its DLLs are never in use during the file copy.
    private async Task CloseMainAppBeforeUpdating()
    {
        if (_options.ParentPid <= 0)
        {
            return;
        }

        Process process;
        try
        {
            process = Process.GetProcessById(_options.ParentPid);
        }
        catch (ArgumentException)
        {
            return; // Already closed.
        }

        if (process.HasExited)
        {
            return;
        }

        SetStatus("Closing PrintPilot Agent…", 2);

        try
        {
            process.CloseMainWindow();
        }
        catch
        {
            // No main window / already gone - fall through to the wait below.
        }

        using (var graceful = new CancellationTokenSource(TimeSpan.FromSeconds(8)))
        {
            try
            {
                await process.WaitForExitAsync(graceful.Token);
                SetStatus("PrintPilot Agent closed.", 5);
                return;
            }
            catch (OperationCanceledException)
            {
                // Didn't close gracefully in time - force it below.
            }
        }

        SetStatus("PrintPilot Agent not responding, closing forcefully…", 4);
        try
        {
            process.Refresh();
            if (!process.HasExited)
            {
                process.Kill(entireProcessTree: true);
            }
        }
        catch
        {
            // Process may have exited between the checks above - fine either way.
        }

        using var forced = new CancellationTokenSource(TimeSpan.FromSeconds(10));
        try
        {
            await process.WaitForExitAsync(forced.Token);
        }
        catch (OperationCanceledException)
        {
            // Proceed regardless - the retrying file copy below still
            // protects against a file that's briefly still locked.
        }

        SetStatus("PrintPilot Agent closed.", 5);
    }

    private async Task DownloadWithProgress(string url, string destination)
    {
        using var http = new HttpClient { Timeout = TimeSpan.FromMinutes(5) };
        using var response = await http.GetAsync(url, HttpCompletionOption.ResponseHeadersRead);
        response.EnsureSuccessStatusCode();

        var totalBytes = response.Content.Headers.ContentLength ?? -1;
        await using var contentStream = await response.Content.ReadAsStreamAsync();
        await using var fileStream = File.Create(destination);

        var buffer = new byte[81920];
        long readBytes = 0;
        int read;
        while ((read = await contentStream.ReadAsync(buffer)) > 0)
        {
            await fileStream.WriteAsync(buffer.AsMemory(0, read));
            readBytes += read;
            if (totalBytes > 0)
            {
                var percent = 10 + (int)(readBytes * 50 / totalBytes); // 10-60% range for download
                SetStatus($"Downloading update… {readBytes / 1024}KB / {totalBytes / 1024}KB", percent);
            }
        }
    }

    private async Task CopyOverInstallDirWithRetry(string sourceDir, string installDir)
    {
        Directory.CreateDirectory(installDir);
        foreach (var sourceFile in Directory.GetFiles(sourceDir, "*", SearchOption.AllDirectories))
        {
            var relativePath = Path.GetRelativePath(sourceDir, sourceFile);
            var destinationFile = Path.Combine(installDir, relativePath);
            var destinationDir = Path.GetDirectoryName(destinationFile);
            if (!string.IsNullOrEmpty(destinationDir))
            {
                Directory.CreateDirectory(destinationDir);
            }

            // The old PrintPilot.exe/dlls might still be releasing file
            // handles right after exiting - retry briefly instead of failing
            // the whole update over one locked file.
            const int maxAttempts = 6;
            for (var attempt = 1; attempt <= maxAttempts; attempt++)
            {
                try
                {
                    File.Copy(sourceFile, destinationFile, overwrite: true);
                    break;
                }
                catch (IOException) when (attempt < maxAttempts)
                {
                    await Task.Delay(500 * attempt);
                }
            }
        }
    }

    private async Task RefreshLocalVersionFile()
    {
        try
        {
            using var http = new HttpClient { Timeout = TimeSpan.FromSeconds(8) };
            var remoteVersion = (await http.GetStringAsync($"{_options.ApiBaseUrl.TrimEnd('/')}/api/agent/version-check/")).Trim();
            if (!string.IsNullOrWhiteSpace(remoteVersion))
            {
                await File.WriteAllTextAsync(Path.Combine(_options.InstallDir, "version.txt"), remoteVersion);
            }
        }
        catch
        {
            // The zip itself should already contain the correct version.txt;
            // this is just a safety net, not worth failing the update over.
        }
    }

    private static void CleanupQuiet(string zipPath, string extractDir)
    {
        try { File.Delete(zipPath); } catch { /* best effort */ }
        try { Directory.Delete(extractDir, recursive: true); } catch { /* best effort */ }
    }

    private void RelaunchMainApp()
    {
        try
        {
            if (File.Exists(_options.ExePath))
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = _options.ExePath,
                    UseShellExecute = true,
                    WorkingDirectory = _options.InstallDir,
                });
            }
        }
        catch
        {
            // If this fails there is nothing more the updater can do; the
            // error label (on failure paths) already tells the user.
        }
    }
}
