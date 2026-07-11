using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace PrintPilotAgent;

internal sealed class StoredCredentials
{
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
}

/// Saves the owner's email/password to the roaming profile so PrintPilot can
/// auto-login next time without asking again. The password is never written
/// in plain text - it goes through Windows DPAPI (ProtectedData) tied to the
/// current Windows user account, so the file is unreadable even if copied to
/// another machine or opened by another Windows user on the same PC.
internal static class CredentialStore
{
    // Ties the encrypted blob to this app specifically (extra entropy input for DPAPI).
    private static readonly byte[] Entropy = Encoding.UTF8.GetBytes("PrintPilotAgent.CafeMitra.v1");

    public static void Save(string email, string password)
    {
        try
        {
            Directory.CreateDirectory(AgentPaths.ConfigDir);
            var payload = JsonSerializer.Serialize(new StoredCredentials { Email = email, Password = password });
            var plainBytes = Encoding.UTF8.GetBytes(payload);
            var encrypted = ProtectedData.Protect(plainBytes, Entropy, DataProtectionScope.CurrentUser);
            File.WriteAllBytes(AgentPaths.CredentialsPath, encrypted);
        }
        catch
        {
            // Saving remembered login is a convenience, never fatal to the app.
        }
    }

    public static StoredCredentials? Load()
    {
        try
        {
            if (!File.Exists(AgentPaths.CredentialsPath))
            {
                return null;
            }

            var encrypted = File.ReadAllBytes(AgentPaths.CredentialsPath);
            var plainBytes = ProtectedData.Unprotect(encrypted, Entropy, DataProtectionScope.CurrentUser);
            var payload = Encoding.UTF8.GetString(plainBytes);
            return JsonSerializer.Deserialize<StoredCredentials>(payload);
        }
        catch
        {
            // Corrupt file, moved-machine, different Windows user, etc. Just
            // treat as "no saved login" rather than crashing startup.
            return null;
        }
    }

    public static void Clear()
    {
        try
        {
            if (File.Exists(AgentPaths.CredentialsPath))
            {
                File.Delete(AgentPaths.CredentialsPath);
            }
        }
        catch
        {
            // Ignore - worst case the stale file just gets overwritten next save.
        }
    }
}
