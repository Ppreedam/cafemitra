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

export type PrinterPreset = {
  printer: string;
  paperSize: string;
  colorMode: string;
};

export type PrinterPresetsResult = {
  presets?: PrinterPreset[];
  printers?: string[];
  paperSizes?: string[];
  colorModes?: string[];
};

export const fallbackPrinters = ["Microsoft Print to PDF", "Fax"];
export const fallbackPaperSizes = ["A4", "A5", "Letter"];
export const fallbackColorModes = ["Color", "Grayscale"];

const agentStatusEndpoints = ["http://127.0.0.1:8765/status"];
const agentSettingsEndpoints = ["http://127.0.0.1:8765/settings"];
const agentTestPrintEndpoints = ["http://127.0.0.1:8765/test-print"];
const agentPosterPrintEndpoints = ["http://127.0.0.1:8765/poster-print"];
const agentPrinterPresetsEndpoints = ["http://127.0.0.1:8765/printer-presets"];
const agentDeletePrinterPresetEndpoints = ["http://127.0.0.1:8765/printer-presets/delete"];
const agentRequestTimeoutMs = 700;

export async function fetchAgentHealth() {
  try {
    return await fetchAgentEndpoint<AgentHealth>(agentStatusEndpoints);
  } catch {
    return {
      status: "stopped",
      printers: fallbackPrinters,
      lastCheckAt: new Date().toISOString(),
    } satisfies AgentHealth;
  }
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

export async function fetchAgentPrinterPresets() {
  return fetchAgentEndpoint<PrinterPresetsResult>(agentPrinterPresetsEndpoints);
}

export async function saveAgentPrinterPreset(preset: PrinterPreset, original?: PrinterPreset) {
  return fetchAgentEndpoint<PrinterPresetsResult>(agentPrinterPresetsEndpoints, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...preset, original }),
  });
}

export async function deleteAgentPrinterPreset(preset: PrinterPreset) {
  return fetchAgentEndpoint<PrinterPresetsResult>(agentDeletePrinterPresetEndpoints, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(preset),
  });
}

async function fetchAgentEndpoint<T>(endpoints: string[], init?: RequestInit) {
  let lastError: unknown;

  for (const endpoint of endpoints) {
    const controller = new AbortController();
    let timeout = 0;
    try {
      timeout = window.setTimeout(() => controller.abort(), agentRequestTimeoutMs);
      const response = await fetch(endpoint, {
        ...init,
        cache: "no-store",
        signal: init?.signal ?? controller.signal,
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(getAgentErrorMessage(result, getAgentFallbackMessage(init, endpoint)));
      }
      return result as T;
    } catch (error) {
      lastError = error;
    } finally {
      if (timeout) window.clearTimeout(timeout);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("PrintPilot Agent request failed.");
}

function getAgentFallbackMessage(init: RequestInit | undefined, endpoint: string) {
  if (init?.method !== "POST") {
    return endpoint.includes("printer-presets") ? "Could not load printer settings." : "Agent health check failed.";
  }
  if (endpoint.includes("poster-print")) return "Could not print QR poster.";
  if (endpoint.includes("test-print")) return "Could not run test print.";
  if (endpoint.includes("printer-presets/delete")) return "Could not delete printer setting.";
  if (endpoint.includes("printer-presets")) return "Could not save printer setting.";
  return "Could not save printer.";
}

function getAgentErrorMessage(result: unknown, fallback: string) {
  if (result && typeof result === "object" && "message" in result) {
    const message = (result as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }

  return fallback;
}
