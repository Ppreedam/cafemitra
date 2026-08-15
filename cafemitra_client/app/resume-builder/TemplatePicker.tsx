"use client";

import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { TemplatePreviewImage } from "./TemplatePreviewImage";

export type TemplatePriceLabel = { text: string; free: boolean };
export type TemplateMeta<TId extends string> = { id: TId; label: string; description: string };

// Generic template gallery: a card per template with a real (captured)
// preview image, an optional price badge, and a CTA. Shared by every
// document builder (resume, biodata, ...) rather than duplicated per tool.
export default function TemplatePicker<TId extends string, TData extends { template: TId }>({
  template,
  onSelect,
  priceLabelFor,
  ctaLabel = "Use this template",
  data,
  templates,
  sampleData,
  hasContent,
  renderPreview,
  cacheNamespace,
}: {
  template: TId;
  onSelect: (id: TId) => void;
  priceLabelFor?: (id: TId) => TemplatePriceLabel | null;
  ctaLabel?: string;
  // Once the customer has actually typed something in, template cards
  // preview their own details instead of the generic sample data.
  data?: TData;
  templates: TemplateMeta<TId>[];
  sampleData: TData;
  hasContent: (data: TData) => boolean;
  renderPreview: (data: TData) => ReactNode;
  cacheNamespace: string;
}) {
  const previewData = data && hasContent(data) ? data : undefined;
  return (
    <div className="resbuild-template-picker">
      {templates.map((tpl) => {
        const priceLabel = priceLabelFor?.(tpl.id) ?? null;
        const active = template === tpl.id;
        return (
          <div key={tpl.id} className={`resbuild-template-card ${active ? "active" : ""}`}>
            <div className="resbuild-template-card-preview">
              <TemplatePreviewImage template={tpl.id} data={previewData} sampleData={sampleData} renderPreview={renderPreview} cacheNamespace={cacheNamespace} />
              {priceLabel ? <span className={`resbuild-price-badge resbuild-template-card-badge ${priceLabel.free ? "free" : ""}`}>{priceLabel.text}</span> : null}
              {active ? (
                <span className="resbuild-template-card-check">
                  <Check size={13} />
                </span>
              ) : null}
            </div>
            <div className="resbuild-template-card-copy">
              <strong>{tpl.label}</strong>
              <small>{tpl.description}</small>
            </div>
            <button type="button" className="resbuild-template-card-cta" onClick={() => onSelect(tpl.id)}>
              {ctaLabel}
            </button>
          </div>
        );
      })}
    </div>
  );
}
