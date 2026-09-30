using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;
using System.Drawing.Imaging;
using System.Text.Json;
using System.Windows.Forms;

namespace GeminiPool;

/// One tab in the pool: a single WebView2 pointed at chatgpt.com plus the
/// automation to drive one image+prompt job through it end to end (paste ->
/// send -> poll for the generated image -> download -> reset chat).
///
/// All ten workers run their jobs concurrently, EXCEPT for the clipboard
/// paste step: the Windows clipboard is a single machine-global resource,
/// so setting/reading it must be serialized across workers via the shared
/// clipboardLock, even though everything else about the job runs in
/// parallel.
internal sealed class GeminiWorker
{
    public int Index { get; }
    public WebView2 WebView { get; } = new() { Dock = DockStyle.Fill };
    public bool IsBusy { get; private set; }
    public bool Enabled { get; private set; } = true;

    /// Manually checked once the user has logged into this worker's site in
    /// its tab. The dispatcher will not send jobs to a worker that isn't
    /// marked logged in.
    public bool LoggedIn { get; private set; }
    public string Status { get; private set; } = "Idle";

    public event Action<GeminiWorker>? StatusChanged;

    private const string SiteUrl = "https://chatgpt.com";
    private const string SiteHost = "chatgpt.com";

    private readonly SemaphoreSlim _clipboardLock;
    private readonly System.Windows.Forms.Timer _activityTimer;
    private bool _geminiScrollAtBottomNext;
    private TaskCompletionSource<string?>? _downloadTcs;

    public GeminiWorker(int index, SemaphoreSlim clipboardLock)
    {
        Index = index;
        _clipboardLock = clipboardLock;
        _activityTimer = new System.Windows.Forms.Timer { Interval = 1000 };
        _activityTimer.Tick += async (_, _) => await ScrollGeminiToTopOrBottomAsync();
    }

    public async Task InitAsync(CoreWebView2Environment env)
    {
        await WebView.EnsureCoreWebView2Async(env);
        WebView.CoreWebView2.Settings.AreDefaultContextMenusEnabled = true;
        WebView.CoreWebView2.Settings.AreDevToolsEnabled = true;
        WebView.CoreWebView2.Settings.IsStatusBarEnabled = true;
        WebView.CoreWebView2.DownloadStarting += OnDownloadStarting;
        WebView.ZoomFactor = 0.5;
        WebView.CoreWebView2.Navigate(SiteUrl);
        _activityTimer.Start();
    }

    // Only reacts to downloads we ourselves triggered from SmartDownloadImageAsync
    // (tracked via _downloadTcs); anything else is left to WebView2's defaults.
    // Setting ResultFilePath + Handled makes this behave like the target/Ctrl+S
    // "Save As" flow but silently, straight to our jobs folder.
    private void OnDownloadStarting(object? sender, CoreWebView2DownloadStartingEventArgs e)
    {
        var tcs = _downloadTcs;
        if (tcs is null) return;

        Directory.CreateDirectory(AgentPaths.JobsDir);
        string savePath = Path.Combine(
            AgentPaths.JobsDir,
            $"reptigo-output-w{Index}-{DateTime.Now:yyyyMMdd_HHmmss}.png");

        e.ResultFilePath = savePath;
        e.Handled = true;

        var operation = e.DownloadOperation;
        operation.StateChanged += (_, _) =>
        {
            if (operation.State == CoreWebView2DownloadState.Completed)
            {
                tcs.TrySetResult(savePath);
            }
            else if (operation.State == CoreWebView2DownloadState.Interrupted)
            {
                tcs.TrySetResult(null);
            }
        };
    }

    // ---------------------------------------------------------------
    // Alternates the page between fully scrolled to the top and
    // fully scrolled to the bottom every 1 second (one direction per
    // tick), so a newly generated image is always brought into view and
    // the tab keeps registering as active instead of throttling
    // background timers/animations across 10 simultaneously open tabs.
    // Best-effort: every failure is swallowed since this is a purely
    // cosmetic tick that may run mid-navigation.
    // ---------------------------------------------------------------
    private async Task ScrollGeminiToTopOrBottomAsync()
    {
        if (WebView.CoreWebView2 == null) return;

        bool toBottom = _geminiScrollAtBottomNext;
        _geminiScrollAtBottomNext = !_geminiScrollAtBottomNext;

        string script = $@"
    (function() {{
        try {{
            const toBottom = {(toBottom ? "true" : "false")};
            const targets = [window];
            document.querySelectorAll('*').forEach((el) => {{
                if (el.scrollHeight > el.clientHeight + 50) targets.push(el);
            }});

            targets.forEach((target) => {{
                const isWindow = target === window;
                const top = toBottom
                    ? (isWindow ? document.body.scrollHeight : target.scrollHeight)
                    : 0;

                if (isWindow) {{
                    window.scrollTo({{ top: top, behavior: 'smooth' }});
                }} else {{
                    target.scrollTo({{ top: top, behavior: 'smooth' }});
                }}
            }});

            return 'ok';
        }} catch (err) {{
            return 'error: ' + err.message;
        }}
    }})();
    ";

        try
        {
            await WebView.CoreWebView2.ExecuteScriptAsync(script);
        }
        catch
        {
            // best-effort cosmetic tick - ignore (page may be mid-navigation)
        }
    }

    public void MarkBusy(string reason)
    {
        IsBusy = true;
        SetStatus(reason);
    }

    public void MarkIdle()
    {
        IsBusy = false;
        SetStatus(Enabled ? "Idle" : "Disabled");
    }

    /// Turns the worker on/off. When off, the dispatcher will not hand it
    /// new jobs (see Form1.PollAsync), but a job already in progress is
    /// left to finish on its own.
    public void SetEnabled(bool enabled)
    {
        Enabled = enabled;
        if (!IsBusy)
        {
            SetStatus(enabled ? "Idle" : "Disabled");
        }
        else
        {
            StatusChanged?.Invoke(this);
        }
    }

    public void SetLoggedIn(bool loggedIn)
    {
        LoggedIn = loggedIn;
        StatusChanged?.Invoke(this);
    }

    private void SetStatus(string status)
    {
        Status = status;
        StatusChanged?.Invoke(this);
    }

    /// Wipes this worker's session (cookies, cache, local storage, etc.) so
    /// a different account can be logged into a clean profile. Refuses
    /// while a job is in flight. Returns false on failure/refusal.
    public async Task<bool> ClearProfileAsync()
    {
        if (IsBusy)
        {
            return false;
        }

        SetStatus("Clearing profile");
        try
        {
            await NavigateAsync("about:blank");
            await WebView.CoreWebView2.Profile.ClearBrowsingDataAsync();
            await NavigateAsync(SiteUrl);
            SetStatus(Enabled ? "Idle" : "Disabled");
            return true;
        }
        catch (Exception ex)
        {
            SetStatus("Error: clear failed - " + ex.Message);
            return false;
        }
    }

    /// Runs one image+prompt job through this worker's tab.
    /// Returns the saved file path of the generated image, or null on
    /// timeout/failure.
    public async Task<string?> RunJobAsync(string imagePath, string promptText, CancellationToken token)
    {
        SetStatus("Loading site");
        await EnsureGeminiLoadedAsync();

        SetStatus("Pasting image");
        var pasteOk = await PasteImageAsync(imagePath);
        if (!pasteOk) return null;

        // wait for the image to finish uploading before sending the message
        await Task.Delay(500, token);

        SetStatus("Typing prompt");
        var promptOk = await InsertPromptAsync(promptText);
        if (!promptOk) return null;

        SetStatus("Sending");
        var sendOk = await SendAsync();
        if (!sendOk) return null;

        SetStatus("Waiting for image");
        var savedPath = await SmartDownloadImageAsync(token);

        // The conversation is reset separately, via StartNewChatAsync,
        // once the caller has confirmed the generated photo was uploaded
        // to the server - not here, so a job that failed to upload can
        // still be retried against the same chat.
        return savedPath;
    }

    private Task EnsureGeminiLoadedAsync()
    {
        if (WebView.CoreWebView2.Source != null &&
            WebView.CoreWebView2.Source.Contains(SiteHost))
        {
            return Task.CompletedTask;
        }

        return NavigateAsync(SiteUrl);
    }

    private Task<bool> NavigateAsync(string url)
    {
        var tcs = new TaskCompletionSource<bool>();

        void Handler(object? sender, CoreWebView2NavigationCompletedEventArgs args)
        {
            WebView.CoreWebView2.NavigationCompleted -= Handler;
            tcs.TrySetResult(args.IsSuccess);
        }

        WebView.CoreWebView2.NavigationCompleted += Handler;
        WebView.CoreWebView2.Navigate(url);

        return tcs.Task;
    }

    // JS expression (no trailing semicolon) that resolves to the prompt
    // editor element, or null if not found yet.
    private static string EditorSelectorJs() =>
        @"(document.querySelector('#prompt-textarea') || document.querySelector('div[contenteditable=""true""]'))";

    private async Task<bool> PasteImageAsync(string imagePath)
    {
        await _clipboardLock.WaitAsync();
        try
        {
            using (Bitmap bitmap = new Bitmap(imagePath))
            {
                Clipboard.Clear();
                Clipboard.SetImage(new Bitmap(bitmap));
            }

            if (!Clipboard.ContainsImage())
            {
                SetStatus("Error: clipboard has no image");
                return false;
            }

            Image? img = Clipboard.GetImage();
            if (img is null)
            {
                SetStatus("Error: clipboard image unavailable");
                return false;
            }

            string base64;
            using (var ms = new MemoryStream())
            {
                img.Save(ms, ImageFormat.Png);
                base64 = Convert.ToBase64String(ms.ToArray());
            }

            string script = @"
    (function() {
        try {
            function base64ToBlob(base64, mime) {
                const byteChars = atob(base64);
                const byteNumbers = new Array(byteChars.length);
                for (let i = 0; i < byteChars.length; i++) {
                    byteNumbers[i] = byteChars.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                return new Blob([byteArray], { type: mime });
            }

            const blob = base64ToBlob('" + base64 + @"', 'image/png');
            const file = new File([blob], 'clipboard.png', { type: 'image/png' });

            const dt = new DataTransfer();
            dt.items.add(file);

            const editor = " + EditorSelectorJs() + @";
            if (!editor) { return 'editor_not_found'; }
            editor.focus();

            const pasteEvent = new Event('paste', { bubbles: true, cancelable: true });
            Object.defineProperty(pasteEvent, 'clipboardData', { value: dt });
            editor.dispatchEvent(pasteEvent);

            return 'ok';
        } catch (err) {
            return 'error: ' + err.message;
        }
    })();
    ";

            string result = await WebView.CoreWebView2.ExecuteScriptAsync(script);
            string pasteStatus = JsonSerializer.Deserialize<string>(result) ?? "";

            if (pasteStatus != "ok")
            {
                SetStatus("Error: paste failed - " + pasteStatus);
                return false;
            }

            return true;
        }
        finally
        {
            _clipboardLock.Release();
        }
    }

    // ChatGPT's editor is a contenteditable div (Quill-backed): directly
    // setting p.textContent mutates the DOM without firing input/beforeinput
    // events, so its internal document model (and the send-button state)
    // never learns the text exists. execCommand('insertText', ...) fires a
    // real input event, which is what it actually listens to; a manual
    // InputEvent is the fallback if execCommand is unsupported/blocked.
    private async Task<bool> InsertPromptAsync(string promptText)
    {
        string prompt = JsonSerializer.Serialize(promptText);

        string script = $@"
        (function() {{
            const editor = {EditorSelectorJs()};
            if (!editor) {{ return 'editor_not_found'; }}

            editor.focus();
            const range = document.createRange();
            range.selectNodeContents(editor);
            range.collapse(false);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);

            let inserted = false;
            try {{
                inserted = document.execCommand('insertText', false, {prompt});
            }} catch (err) {{
                inserted = false;
            }}

            if (!inserted) {{
                const beforeInputEvent = new InputEvent('beforeinput', {{
                    bubbles: true,
                    cancelable: true,
                    composed: true,
                    inputType: 'insertText',
                    data: {prompt},
                }});
                editor.dispatchEvent(beforeInputEvent);

                const currentSelection = window.getSelection();
                const currentRange = currentSelection.rangeCount ? currentSelection.getRangeAt(0) : range;
                currentRange.deleteContents();
                const textNode = document.createTextNode({prompt});
                currentRange.insertNode(textNode);
                currentRange.setStartAfter(textNode);
                currentRange.collapse(true);
                currentSelection.removeAllRanges();
                currentSelection.addRange(currentRange);

                editor.dispatchEvent(new InputEvent('input', {{
                    bubbles: true,
                    composed: true,
                    inputType: 'insertText',
                    data: {prompt},
                }}));
            }}

            const finalLength = editor.textContent ? editor.textContent.length : 0;
            return 'ok:' + finalLength;
        }})();
    ";

        string scriptResult = await WebView.CoreWebView2.ExecuteScriptAsync(script);
        string promptStatus = JsonSerializer.Deserialize<string>(scriptResult) ?? "";
        if (!promptStatus.StartsWith("ok:") || promptStatus == "ok:0")
        {
            SetStatus("Error: prompt insert failed - " + promptStatus);
            return false;
        }

        return true;
    }

    private Task<bool> SendAsync() => SendViaButtonAsync(
        @"document.querySelector('button[data-testid=""send-button""]') || document.querySelector('button[aria-label=""Send prompt""]')");

    // The send button stays disabled until ChatGPT's own async re-render
    // notices the prompt text was entered, so this polls briefly instead of
    // clicking once right after the insert. buttonSelectorJs
    // must be a JS expression (no trailing semicolon) resolving to the
    // button element, or null/undefined if not found yet.
    private async Task<bool> SendViaButtonAsync(string buttonSelectorJs)
    {
        string script = $@"
    (function() {{
        try {{
            const btn = {buttonSelectorJs};
            if (!btn) {{ return 'button_not_found'; }}
            if (btn.getAttribute('aria-disabled') === 'true' || btn.disabled) {{
                return 'button_disabled';
            }}
            btn.click();
            return 'ok';
        }} catch (err) {{
            return 'error: ' + err.message;
        }}
    }})();
    ";

        string sendStatus = "button_disabled";
        for (var attempt = 0; attempt < 6 && sendStatus == "button_disabled"; attempt++)
        {
            await Task.Delay(300);
            string result = await WebView.CoreWebView2.ExecuteScriptAsync(script);
            sendStatus = JsonSerializer.Deserialize<string>(result) ?? "";
        }

        if (sendStatus != "ok")
        {
            SetStatus("Error: send failed - " + sendStatus);
            return false;
        }

        return true;
    }

    private Task<string?> SmartDownloadImageAsync(CancellationToken token) => SmartDownloadChatGptImageAsync(token);

    // 1. Polls every 500ms until the page has more than targetImageIndex
    //    <img> elements (chat avatars/icons plus the generated image push
    //    the count up as the reply streams in), then reads that <img>'s src.
    // 2. From that same chat page (NOT by navigating to the raw image URL -
    //    that endpoint serves its own lockdown CSP, e.g. default-src 'none',
    //    which spams console errors and isn't reliable to run script
    //    against), clicks a synthetic <a download> pointed at the src. That
    //    triggers a real browser download - the same mechanism as pressing
    //    Ctrl+S - which WebView2's DownloadStarting event intercepts and
    //    redirects straight into AgentPaths.JobsDir instead of a Save dialog.
    private async Task<string?> SmartDownloadChatGptImageAsync(CancellationToken token)
    {
        const int pollIntervalMs = 100;
        const int maxAttempts = 100000000;
        const int targetImageIndex = 3; // 4th image, 0-based

        string jsFindSrc = @"
(function() {
    try {
        let imgs = document.querySelectorAll('img');
        if (imgs.length < " + (targetImageIndex + 1) + @") return JSON.stringify({ status: 'waiting_count' });

        const img = imgs[" + targetImageIndex + @"];
        const src = img.src;
        if (!src) return JSON.stringify({ status: 'waiting_src' });

        return JSON.stringify({ status: 'ok', src: src });
    } catch (e) {
        return JSON.stringify({ status: 'error', message: e.message });
    }
})();";

        return await PollAndDownloadImageAsync(jsFindSrc, pollIntervalMs, maxAttempts, token);
    }

    // Shared poll-for-src-then-download loop. jsFindSrc
    // must be a script that returns JSON of shape:
    //   { status: 'ok', src: '...' } | { status: 'waiting_*' } | { status: 'error', message: '...' }
    private async Task<string?> PollAndDownloadImageAsync(string jsFindSrc, int pollIntervalMs, int maxAttempts, CancellationToken token)
    {
        const int minSizeBytes = 100 * 1024; // 100 KB

        string? imageSrc = null;
        for (int i = 0; i < maxAttempts; i++)
        {
            await Task.Delay(pollIntervalMs, token);

            string raw = await WebView.CoreWebView2.ExecuteScriptAsync(jsFindSrc);
            string jsonStr = JsonSerializer.Deserialize<string>(raw) ?? "";

            using JsonDocument doc = JsonDocument.Parse(jsonStr);
            string status = doc.RootElement.GetProperty("status").GetString() ?? "";

            if (status == "error")
            {
                SetStatus("Error: find image - " + doc.RootElement.GetProperty("message").GetString());
                return null;
            }

            if (status != "ok")
            {
                continue;
            }

            imageSrc = doc.RootElement.GetProperty("src").GetString();
            break;
        }

        if (string.IsNullOrEmpty(imageSrc))
        {
            SetStatus("Timeout: no final image detected");
            return null;
        }

        // Trigger the browser's own download flow, from the chat page itself,
        // pointed at the image src - the same mechanism as pressing Ctrl+S.
        // Confirmed manually in devtools against a live ChatGPT chat page
        // that a plain synthetic <a download> click works fine even though
        // the image src is cross-origin - no fetch/blob detour needed.
        //
        // This script deliberately isn't an async function / doesn't return
        // a Promise: an earlier version awaited a fetch() inline and
        // returned that Promise as the script's completion value, but the
        // real browser download that a.click() triggers partway through
        // could disrupt WebView2's await of it, so ExecuteScriptAsync
        // sometimes came back with the JSON of a still-pending Promise
        // object ("{}") instead of a resolved string, which
        // JsonSerializer.Deserialize<string> can't parse and throws on.
        // Keeping this script plain and synchronous avoids that entirely.
        SetStatus("Downloading image");
        _downloadTcs = new TaskCompletionSource<string?>();

        string jsTriggerDownload = @"
(function() {
    try {
        const a = document.createElement('a');
        a.href = " + JsonSerializer.Serialize(imageSrc) + @";
        a.download = 'reptigo-image.png';
        document.body.appendChild(a);
        a.click();
        a.remove();
        return 'ok';
    } catch (e) {
        return 'error: ' + e.message;
    }
})();";

        string triggerRaw = await WebView.CoreWebView2.ExecuteScriptAsync(jsTriggerDownload);
        string triggerResult = JsonSerializer.Deserialize<string>(triggerRaw) ?? "";
        if (!triggerResult.StartsWith("ok"))
        {
            SetStatus("Error: trigger download - " + triggerResult);
            _downloadTcs = null;
            return null;
        }

        var downloadTask = _downloadTcs.Task;
        var finished = await Task.WhenAny(downloadTask, Task.Delay(TimeSpan.FromSeconds(30), token));
        string? savePath = finished == downloadTask ? await downloadTask : null;
        _downloadTcs = null;

        if (savePath is null)
        {
            SetStatus("Error: download did not complete");
            return null;
        }

        var savedFile = new FileInfo(savePath);
        if (!savedFile.Exists || savedFile.Length <= minSizeBytes)
        {
            SetStatus("Error: downloaded image too small");
            return null;
        }

        return savePath;
    }

    /// Resets the conversation so the next job starts from a clean chat.
    /// Called by the caller only once the generated photo has actually
    /// been uploaded to the server, so a job that failed to upload can
    /// still be retried against the same chat.
    ///
    /// By the time this runs, the WebView2 is sitting on the raw image URL
    /// SmartDownloadImageAsync navigated to (not the chat UI), so there is
    /// no "New chat" button to click - navigating straight back to the
    /// site's home URL is what actually re-opens it with a blank chat.
    public async Task StartNewChatAsync()
    {
        try
        {
            await NavigateAsync(SiteUrl);
            // give the fresh conversation a moment to load before the next job pastes into it
            await Task.Delay(1500);
        }
        catch
        {
            // best-effort - a failure here doesn't invalidate the photo already generated
        }
    }
}
