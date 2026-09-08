"use client";

import { useEffect, useState } from "react";
import {
  fetchPassportAISettings,
  updatePassportAISettings,
  type PassportAIConfig,
  type PassportAIMode,
} from "@/lib/api";

function PassportPhotoOpenAISettings() {
  const [config, setConfig] = useState<PassportAIConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPassportAISettings()
      .then((res) => setConfig(res.config))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load passport AI settings."));
  }, []);

  async function save(mode: PassportAIMode) {
    if (!config) return;
    const previous = config;
    setConfig({ ...config, mode });
    setSaving(true);
    setError("");
    try {
      const res = await updatePassportAISettings(mode);
      setConfig(res.config);
    } catch (err) {
      setConfig(previous);
      setError(err instanceof Error ? err.message : "Failed to save passport AI settings.");
    } finally {
      setSaving(false);
    }
  }

  const selectedChoice = config?.modeChoices.find((choice) => choice.value === config.mode);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900 mb-1">AI Provider</h3>
      <p className="text-sm text-slate-500 mb-3">
        {selectedChoice ? (
          <>
            Requires <code className="bg-slate-100 px-1 rounded">{selectedChoice.requiredEnvVar}</code> to be set on
            the server - this only picks which provider/strategy is used, not whether the key exists.
          </>
        ) : (
          "Loading..."
        )}
      </p>

      {error && <div className="mb-3 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}

      <div className="space-y-2">
        {(config?.modeChoices || []).map((choice) => (
          <label key={choice.value} className="flex items-start gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="radio"
              name="passport-ai-mode"
              className="mt-1"
              checked={config?.mode === choice.value}
              disabled={!config || saving}
              onChange={() => save(choice.value)}
            />
            <span>{choice.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function ToolsConfigPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-1">Tools Config</h1>
      <p className="text-sm text-slate-500 mb-4">Per-tool settings that go beyond pricing - AI providers, generation modes, and similar switches.</p>

      <section className="mb-6">
        <h2 className="text-base font-semibold text-slate-900 mb-2">Passport Photo</h2>
        <PassportPhotoOpenAISettings />
      </section>
    </div>
  );
}
