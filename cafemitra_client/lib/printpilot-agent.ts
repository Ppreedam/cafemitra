import { apiFetch } from "./api";

// Mirrors VirtualPrinterMarkers/IsVirtualPrinter in the desktop Print Agent
// (Print Agent/Print Agent/Form1.cs) - these Windows "printers" always
// report as valid/online but never produce physical paper (they write a
// PDF, a fax queue entry, a OneNote page instead), so a shop that leaves
// one selected has jobs silently going nowhere.
const VIRTUAL_PRINTER_MARKERS = ["Print to PDF", "XPS Document Writer", "OneNote", "Fax"];

export function isVirtualPrinter(printerName: string) {
  const name = printerName.toLowerCase();
  return VIRTUAL_PRINTER_MARKERS.some((marker) => name.includes(marker.toLowerCase()));
}

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

export type PrintFileRequest = {
  printer: string;
  fileName: string;
  pdfBase64: string;
  paperSize?: string;
  colorMode?: string;
};

export type PrintFileResult = {
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

export type DuplexSettings = {
  printer?: string;
  mode?: "auto" | "manual";
  capable?: boolean;
  missing?: boolean;
  printers?: string[];
};

export const fallbackPrinters = ["Microsoft Print to PDF", "Fax"];
export const fallbackPaperSizes = ["A4", "A5", "A3", "A6", "B5", "Letter", "Legal", "Executive"];
export const fallbackColorModes = ["Color", "Grayscale"];

const agentStatusEndpoints = ["http://127.0.0.1:8765/status"];
const agentSettingsEndpoints = ["http://127.0.0.1:8765/settings"];
const agentTestPrintEndpoints = ["http://127.0.0.1:8765/test-print"];
const agentPosterPrintEndpoints = ["http://127.0.0.1:8765/poster-print"];
const agentPrintFileEndpoints = ["http://127.0.0.1:8765/print-file"];
const agentPrinterPresetsEndpoints = ["http://127.0.0.1:8765/printer-presets"];
const agentDuplexSettingsEndpoints = ["http://127.0.0.1:8765/duplex-settings"];
const agentDeletePrinterPresetEndpoints = ["http://127.0.0.1:8765/printer-presets/delete"];
const agentRequestTimeoutMs = 5000;
const agentPrintRequestTimeoutMs = 30000;

export type ServerAgentStatus = {
  connected: boolean;
  viaWebSocket: boolean;
  lastSeenAt: string | null;
};

// Unlike everything else in this file, this hits RepetiGo's own server, not
// the local agent - see api/views.py's agent_ws_status. It's the fallback
// for when the browser's own http://127.0.0.1:8765 request can't get
// through at all (Private Network Access, a firewall, antivirus, an
// outdated agent build...): the server already knows whether this shop's
// agent has a live WebSocket open or polled /agent/jobs/ recently, since
// that's the exact same connection that makes printing work.
export async function fetchServerAgentStatus(): Promise<ServerAgentStatus> {
  const response = await apiFetch("/api/agent/ws-status/");
  if (!response.ok) throw new Error("Could not reach RepetiGo to check the agent's status.");
  return response.json();
}

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
  }, agentPrintRequestTimeoutMs);
}

export async function runAgentPosterPrint(request: TestPrintRequest) {
  return fetchAgentEndpoint<TestPrintResult>(agentPosterPrintEndpoints, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  }, agentPrintRequestTimeoutMs);
}

/// Prints an arbitrary already-generated PDF (e.g. a Resume Builder download)
/// directly on the shop's configured printer via the local desktop agent -
/// no server-side PrintJob involved, unlike the QR-order queue.
export async function runAgentPrintFile(request: PrintFileRequest) {
  return fetchAgentEndpoint<PrintFileResult>(agentPrintFileEndpoints, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  }, agentPrintRequestTimeoutMs);
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

export async function fetchAgentDuplexSettings() {
  return fetchAgentEndpoint<DuplexSettings>(agentDuplexSettingsEndpoints);
}

export async function saveAgentDuplexSettings(settings: { printer: string; mode: "auto" | "manual" }) {
  return fetchAgentEndpoint<DuplexSettings>(agentDuplexSettingsEndpoints, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
}

async function fetchAgentEndpoint<T>(endpoints: string[], init?: RequestInit, timeoutMs = agentRequestTimeoutMs) {
  let lastError: unknown;

  for (const endpoint of endpoints) {
    try {
      const response = await withAgentTimeout(fetch(endpoint, { ...init, cache: "no-store" }), timeoutMs);
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(getAgentErrorMessage(result, getAgentFallbackMessage(init, endpoint)));
      }
      return result as T;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("PrintPilot Agent request failed.");
}

function withAgentTimeout(request: Promise<Response>, timeoutMs: number) {
  return new Promise<Response>((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error("PrintPilot Agent request timed out.")), timeoutMs);
    request.then(
      (response) => {
        window.clearTimeout(timeout);
        resolve(response);
      },
      (error) => {
        window.clearTimeout(timeout);
        reject(error);
      },
    );
  });
}

function getAgentFallbackMessage(init: RequestInit | undefined, endpoint: string) {
  if (init?.method !== "POST") {
    return endpoint.includes("duplex-settings") ? "Could not load duplex printer." : endpoint.includes("printer-presets") ? "Could not load printer settings." : "Agent health check failed.";
  }
  if (endpoint.includes("poster-print")) return "Could not print QR poster.";
  if (endpoint.includes("print-file")) return "Could not print via PrintPilot.";
  if (endpoint.includes("test-print")) return "Could not run test print.";
  if (endpoint.includes("printer-presets/delete")) return "Could not delete printer setting.";
  if (endpoint.includes("printer-presets")) return "Could not save printer setting.";
  if (endpoint.includes("duplex-settings")) return "Could not save duplex printer.";
  return "Could not save printer.";
}

function getAgentErrorMessage(result: unknown, fallback: string) {
  if (result && typeof result === "object" && "message" in result) {
    const message = (result as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }

  return fallback;
}
