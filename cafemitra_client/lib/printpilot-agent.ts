export type AgentHealth = {
  app?: string;
  status?: "running" | "stopped";
  account?: string;
  printer?: string;
  mockMode?: boolean;
  printers?: string[];
  apiBaseUrl?: string;
  lastCheckAt?: string;
  lastJob?: string;
  lastJobCount?: number;
  csharpAgent?: boolean;
};

export type SavePrinterResult = {
  message?: string;
  printer?: string;
  mockMode?: boolean;
  printers?: string[];
};

export type TestPrintRequest = {
  printer: string;
  shopName: string;
  shopCode: string;
  qrUrl: string;
  qrImage: string;
};

export type TestPrintResult = {
  message?: string;
  printer?: string;
  printedAt?: string;
  printers?: string[];
};

export const fallbackPrinters = ["Microsoft Print to PDF", "Fax"];

const agentStatusEndpoints = ["http://127.0.0.1:8765/status", "http://localhost:8765/status"];
const agentSettingsEndpoints = ["http://127.0.0.1:8765/settings", "http://localhost:8765/settings"];
const agentTestPrintEndpoints = ["http://127.0.0.1:8765/test-print", "http://localhost:8765/test-print"];
const agentPosterPrintEndpoints = ["http://127.0.0.1:8765/poster-print", "http://localhost:8765/poster-print"];

export async function fetchAgentHealth() {
  return fetchAgentEndpoint<AgentHealth>(agentStatusEndpoints);
}

export async function saveAgentPrinter(printerName: string) {
  return fetchAgentEndpoint<SavePrinterResult>(agentSettingsEndpoints, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ printer: printerName }),
  });
}

export async function runAgentTestPrint(request: TestPrintRequest) {
  return fetchAgentEndpoint<TestPrintResult>(agentTestPrintEndpoints, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
}

export async function runAgentPosterPrint(request: TestPrintRequest) {
  return fetchAgentEndpoint<TestPrintResult>(agentPosterPrintEndpoints, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
}

async function fetchAgentEndpoint<T>(endpoints: string[], init?: RequestInit) {
  let lastError: unknown;

  for (const endpoint of endpoints) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 2000);
    try {
      const response = await fetch(endpoint, {
        cache: "no-store",
        ...init,
        signal: controller.signal,
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(getAgentErrorMessage(result, getAgentFallbackMessage(init, endpoint)));
      }
      return result as T;
    } catch (error) {
      lastError = error;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("PrintPilot Agent request failed.");
}

function getAgentFallbackMessage(init: RequestInit | undefined, endpoint: string) {
  if (init?.method !== "POST") return "Agent health check failed.";
  if (endpoint.includes("poster-print")) return "Could not print QR poster.";
  if (endpoint.includes("test-print")) return "Could not run test print.";
  return "Could not save printer.";
}

function getAgentErrorMessage(result: unknown, fallback: string) {
  if (result && typeof result === "object" && "message" in result) {
    const message = (result as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }

  return fallback;
}
