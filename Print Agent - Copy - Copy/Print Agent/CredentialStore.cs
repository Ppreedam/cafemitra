using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace Print_Agent;

internal sealed class StoredCredentials
{
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
}

/// Saves the owner's email/password so the agent can auto-login next time
/// without asking again. The password is DPAPI-encrypted (tied to the
/// current Windows user account), never written in plain text.
internal static class CredentialStore
{
    private static readonly byte[] Entropy = Encoding.UTF8.GetBytes("PrintAgent.CafeMitra.v1");

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
