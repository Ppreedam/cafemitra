"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { useTemplatePrices } from "./useTemplatePrices";
import TemplatePreviewButton from "./TemplatePreviewButton";
import { TemplatePreviewImage } from "./TemplatePreviewImage";
import type { TemplateMeta } from "./TemplatePicker";

// Generic template gallery landing page (a grid of Link cards, each with a
// real captured preview + price + "preview as PDF" button). Shared by every
// document builder's `/<tool>` gallery route.
export default function TemplateGalleryGrid<TId extends string, TData extends { template: TId }>({
  templates,
  sampleData,
  renderPreview,
  buildPdf,
  cacheNamespace,
  toolPrefix,
  basePath,
}: {
  templates: TemplateMeta<TId>[];
  sampleData: TData;
  renderPreview: (data: TData) => ReactNode;
  buildPdf: (data: TData) => Promise<Blob>;
  cacheNamespace: string;
  toolPrefix: string;
  basePath: string;
}) {
  const prices = useTemplatePrices<TId>(toolPrefix);

  return (
    <div className="resbuild-gallery-grid">
      {templates.map((tpl) => {
        const price = prices?.[tpl.id] || 0;
        return (
          <div className="resbuild-gallery-card-wrap" key={tpl.id}>
            <Link href={`${basePath}/build?template=${tpl.id}`} className="resbuild-gallery-card">
              <div className="resbuild-gallery-mock">
                <div className="resbuild-gallery-mock-frame">
                  <TemplatePreviewImage template={tpl.id} sampleData={sampleData} renderPreview={renderPreview} cacheNamespace={cacheNamespace} />
                </div>
              </div>
              <div className="resbuild-gallery-card-copy">
                <div className="resbuild-gallery-card-title-row">
                  <strong>{tpl.label}</strong>
                  {prices ? <span className={`resbuild-price-badge ${price ? "" : "free"}`}>{price ? `₹${price}` : "Free"}</span> : null}
                </div>
                <p>{tpl.description}</p>
              </div>
              <span className="resbuild-gallery-card-cta">
                <Check size={14} /> Use this template
              </span>
            </Link>
            <TemplatePreviewButton label={tpl.label} buildPdf={() => buildPdf({ ...sampleData, template: tpl.id })} />
          </div>
        );
      })}
    </div>
  );
}
