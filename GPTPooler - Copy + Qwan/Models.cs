namespace GeminiPool;

// ── Passport Photo Maker (dashboard tool) DTOs ──────────────────────────
// Image + prompt jobs polled from the owner's "/passport-photo" dashboard
// page - each one is a single image-in / image-out Gemini job.

internal sealed class PassportJobListResponse
{
    public List<PassportJob> Jobs { get; set; } = [];
    public PoolerInfo? Pooler { get; set; }
}

/// This pooler's entry in the server's priority table (PoolerNode) as of
/// the latest poll. CanPull is false while a higher-priority pooler is
/// online with a free worker - this one is then on standby.
internal sealed class PoolerInfo
{
    public string Email { get; set; } = "";
    public int Priority { get; set; }
    public bool IsEnabled { get; set; }
    public bool CanPull { get; set; }
}

internal sealed class PassportJob
{
    public int Id { get; set; }
    public string Prompt { get; set; } = "";
    public string Status { get; set; } = "";
    public string FinalImageUrl { get; set; } = "";
    public string ErrorMessage { get; set; } = "";
    public string CreatedAt { get; set; } = "";
    public string OriginalImageUrl { get; set; } = "";
}

// ── Login ────────────────────────────────────────────────────────────

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

/// Thrown when the server explicitly rejects credentials (bad email/password).
/// Distinguished from connectivity failures so the caller knows whether to
/// keep silently retrying (offline) or stop and ask the user to log in again.
internal sealed class AuthenticationFailedException(string message) : Exception(message);
