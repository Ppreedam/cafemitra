using System.Diagnostics;
using System.IO.Compression;

namespace PrintAgentUpdater;

internal sealed class UpdaterForm : Form
{
    private const string UpdateZipUrl =
        "https://raw.githubusercontent.com/httpsankit/cafemitra_updates/refs/heads/main/update.zip";

    private readonly UpdateOptions _options;
    private readonly Label _title = new();
    private readonly Label _status = new();
    private readonly ProgressBar _progress = new();
    private readonly Button _close = new();

    public UpdaterForm(UpdateOptions options)
    {
        _options = options;

        Text = "Print Agent Updater";
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

        _title.Text = "Updating Print Agent";
        _title.AutoSize = true;
        _title.Font = new Font("Segoe UI", 14, FontStyle.Bold);
        root.Controls.Add(_title);

        _status.Text = "Preparing update…";
        _status.AutoSize = true;
        _status.ForeColor = Color.DimGray;
        _status.Padding = new Padding(0, 8, 0, 12);
        root.Controls.Add(_status);

        _progress.Dock = DockStyle.Top;
        _progress.Height = 14;
        _progress.Style = ProgressBarStyle.Continuous;
        root.Controls.Add(_progress);

        _close.Text = "Close";
        _close.Visible = false;
        _close.AutoSize = true;
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
        _status.ForeColor = isError ? Color.Firebrick : Color.DimGray;
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
            var zipPath = Path.Combine(Path.GetTempPath(), $"printagent-update-{Guid.NewGuid():N}.zip");
            await DownloadWithProgress(UpdateZipUrl, zipPath);

            SetStatus("Extracting update…", 65);
            var extractDir = Path.Combine(Path.GetTempPath(), $"printagent-update-{Guid.NewGuid():N}");
            Directory.CreateDirectory(extractDir);
            ZipFile.ExtractToDirectory(zipPath, extractDir, overwriteFiles: true);

            SetStatus("Installing update…", 90);
            await CopyOverInstallDirWithRetry(extractDir, _options.InstallDir);

            CleanupQuiet(zipPath, extractDir);

            SetStatus("Update complete. Restarting Print Agent…", 100);
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

    // Finds every PrintAgent.exe instance that could be locking the install
    // directory - not just the PID passed in on the command line. That PID
    // is only the instance that happened to launch us; a copy started from
    // Windows startup, a second manual launch, or a leftover from a prior
    // failed update all run under their own PID and would otherwise still
    // be holding the files open when we try to overwrite them.
    private async Task CloseMainAppBeforeUpdating()
    {
        SetStatus("Checking for a running Print Agent…", 2);

        var targetExe = SafeFullPath(_options.ExePath);
        var candidates = new List<Process>();

        if (_options.ParentPid > 0)
        {
            try
            {
                var byPid = Process.GetProcessById(_options.ParentPid);
                if (!byPid.HasExited)
                {
                    candidates.Add(byPid);
                }
            }
            catch (ArgumentException)
            {
                // Already closed.
            }
        }

        foreach (var proc in Process.GetProcessesByName("PrintAgent"))
        {
            if (candidates.Any(p => p.Id == proc.Id))
            {
                continue;
            }

            // Only touch instances actually running from this install
            // (C:\Repetigo\PrintAgent.exe) - if we can't tell, err on the
            // side of closing it rather than risk a locked file.
            if (!string.IsNullOrEmpty(targetExe))
            {
                try
                {
                    var path = SafeFullPath(proc.MainModule?.FileName);
                    if (!string.IsNullOrEmpty(path) && !string.Equals(path, targetExe, StringComparison.OrdinalIgnoreCase))
                    {
                        continue; // A different install entirely - leave it alone.
                    }
                }
                catch
                {
                    // Couldn't inspect it (permissions, race with exit) - include it anyway.
                }
            }

            candidates.Add(proc);
        }

        if (candidates.Count == 0)
        {
            return;
        }

        SetStatus(candidates.Count == 1
            ? "Closing Print Agent…"
            : $"Closing {candidates.Count} running Print Agent instances…", 3);

        foreach (var process in candidates)
        {
            await CloseProcess(process);
        }

        SetStatus("Print Agent closed.", 5);
    }

    private static async Task CloseProcess(Process process)
    {
        try
        {
            if (process.HasExited)
            {
                return;
            }
        }
        catch
        {
            return;
        }

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
                return;
            }
            catch (OperationCanceledException)
            {
                // Didn't close gracefully in time (e.g. it just minimized to
                // tray instead of exiting) - force it below.
            }
        }

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
    }

    private static string SafeFullPath(string? path)
    {
        if (string.IsNullOrWhiteSpace(path))
        {
            return "";
        }

        try
        {
            return Path.GetFullPath(path);
        }
        catch
        {
            return "";
        }
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

            // The old PrintAgent.exe/dlls might still be releasing file
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
