# CafeMitra PrintPilot Agent C#

Minimal C# Windows UI agent for testing auto-print flow.

Current scope:

- Login UI saves access/refresh token automatically
- Scans installed Windows printers
- Saves selected printer in `%APPDATA%\CafeMitra\PrintPilotAgentCSharp\config.json`
- Polls `GET /api/agent/jobs/`
- Downloads `downloadUrl`
- Sends PDF/file to selected Windows printer using the `printto` shell verb
- Updates status using `POST /api/agent/jobs/{order_id}/status/`
- Refreshes access token with `POST /api/auth/refresh/` when possible

## Run

```powershell
cd printpilot_agent_csharp
dotnet run
```

Then:

1. Enter API Base URL, email, password.
2. Click `Login`.
3. Click `Scan Printers`.
4. Select printer.
5. Click `Save Printer`.
6. Click `Start Agent`.

## Build EXE

```powershell
dotnet publish -c Release -r win-x64 --self-contained false
```

Output:

```text
bin\Release\net8.0\win-x64\publish\PrintPilotAgent.CSharp.exe
```

PDF printing depends on the installed Windows PDF app supporting shell `printto`.
