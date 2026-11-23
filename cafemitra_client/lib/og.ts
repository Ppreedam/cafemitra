// Page-specific social share (Open Graph / Twitter) images.
// Each page passes its own title, one-line subtitle, category and icon; the
// image itself is drawn by app/og/route.tsx. Use the same object in both
// `openGraph.images` and `twitter.images` - a page-level openGraph replaces the
// layout's, so pages that set openGraph must list their image explicitly.

export type OgIcon =
  | "merge"
  | "compress"
  | "split"
  | "convert"
  | "edit"
  | "lock"
  | "image"
  | "background"
  | "resize"
  | "passport"
  | "idcard"
  | "print"
  | "qr"
  | "resume"
  | "file";

export type OgImageOptions = {
  title: string; // short page name, e.g. "Merge PDF Online Free"
  subtitle?: string; // one true sentence about the tool
  category?: string; // pill text, e.g. "FREE PDF TOOL"
  icon?: OgIcon;
};

// Hand-made 1200x630 banner kept in public/og/ (used for the main money pages).
export function ogStaticImage(file: string, alt: string) {
  return { url: `/og/${file}`, width: 1200, height: 630, alt };
}

export function ogImage({ title, subtitle, category, icon }: OgImageOptions) {
  const params = new URLSearchParams({ t: title });
  if (subtitle) params.set("s", subtitle);
  if (category) params.set("c", category);
  if (icon) params.set("i", icon);
  return {
    url: `/og?${params.toString()}`, // made absolute by metadataBase in app/layout.tsx
    width: 1200,
    height: 630,
    alt: `${title} - RepetiGo`,
  };
}
