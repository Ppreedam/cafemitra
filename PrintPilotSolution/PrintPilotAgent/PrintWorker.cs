namespace PrintPilotAgent;

internal sealed class PrintWorker(CafeMitraApi api, AgentConfig config, Action<string> log, Func<PrintJob, string, string> choosePdfOutputPath, Func<PrintJob, bool> confirmCashPrint)
{
    public async Task ProcessOnce(CancellationToken token)
    {
        var jobs = await api.FetchJobs(token);
        if (jobs.Count == 0)
        {
            return;
        }

        log($"Found {jobs.Count} job(s).");
        foreach (var job in jobs)
        {
            log(
                $"Fetched job: token={job.TokenId}, order={job.OrderNumber}, service={job.ServiceName}, mode={job.PrintColorModeLabel}, file={job.FileName}, pages={job.Pages}, copies={job.Copies}, amount=Rs. {job.TotalAmount}, payment={job.PaymentStatus}"
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
                    log($"{tokenId}: cash print rejected.");
                    return;
                }

                await api.ApproveCashOrder(job.Id, token);
                log($"{tokenId}: cash collected confirmation accepted.");
            }

            log($"{tokenId}: downloading {fileName}");
            await api.DownloadFile(job.DownloadUrl, destination, token);
            var downloaded = new FileInfo(destination);
            log($"{tokenId}: downloaded ({downloaded.Length} bytes), mode={job.PrintColorModeLabel}");

            var printerName = ResolvePrinterName(job, tokenId);
            log($"{tokenId}: sending to {printerName}");
            await api.UpdateStatus(job.Id, "printing", $"Sent to {printerName} ({job.PrintColorModeLabel})", token);

            var printResult = PrinterService.PrintFile(destination, printerName, job, choosePdfOutputPath);
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

    // Orders never carry a paper size today (customers only pick B/W vs
    // Color) - every job is treated as A4, matching the reference/default
    // paper size shops actually use, so a preset only needs to be saved
    // once per color mode to be picked up here.
    private const string DefaultPaperSize = "A4";

    /// Looks for a saved printer preset (PrinterSettingForm/printerSetting.text)
    /// matching this job's color mode at the default paper size, and routes
    /// to that printer instead of the single configured one - e.g. a B/W job
    /// goes to whichever printer was saved as "A4 + Grayscale", a color job
    /// to whichever was saved as "A4 + Color". Falls back to the configured
    /// printer when no matching preset exists.
    private string ResolvePrinterName(PrintJob job, string tokenId)
    {
        var wantedColorMode = job.PrintColorMode.ToPresetColorMode();
        var match = PrinterSettingStore.Load().FirstOrDefault(preset =>
            preset.PaperSize.Equals(DefaultPaperSize, StringComparison.OrdinalIgnoreCase) &&
            preset.ColorMode.Equals(wantedColorMode, StringComparison.OrdinalIgnoreCase) &&
            !string.IsNullOrWhiteSpace(preset.PrinterName));

        if (match is not null)
        {
            log($"{tokenId}: matched saved setting ({DefaultPaperSize} + {wantedColorMode}) -> {match.PrinterName}");
            return match.PrinterName;
        }

        log($"{tokenId}: no saved setting for {DefaultPaperSize} + {wantedColorMode}, using default printer {config.PrinterName}");
        return config.PrinterName;
    }

    private static string SafeFileName(string value)
    {
        var invalid = Path.GetInvalidFileNameChars();
        var cleaned = new string(value.Select(ch => invalid.Contains(ch) ? '_' : ch).ToArray()).Trim();
        return string.IsNullOrWhiteSpace(cleaned) ? "print-job.pdf" : cleaned;
    }
}
