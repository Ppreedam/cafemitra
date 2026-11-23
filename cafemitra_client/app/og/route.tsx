import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import {
  CreditCard,
  Eraser,
  FileStack,
  FileText,
  Image as ImageIcon,
  Lock,
  Minimize2,
  PenLine,
  Printer,
  QrCode,
  RefreshCw,
  Scaling,
  Scissors,
  User,
} from "lucide-react";
import type { OgIcon } from "@/lib/og";

// Page-specific 1200x630 share image: /og?t=Title&s=Subtitle&c=CATEGORY&i=icon
// Built with lib/og.ts `ogImage()`. Fonts: Liberation Sans (SIL OFL, see LICENSE_LIBERATION.txt).

const ICONS: Record<OgIcon, typeof FileText> = {
  merge: FileStack,
  compress: Minimize2,
  split: Scissors,
  convert: RefreshCw,
  edit: PenLine,
  lock: Lock,
  image: ImageIcon,
  background: Eraser,
  resize: Scaling,
  passport: User,
  idcard: CreditCard,
  print: Printer,
  qr: QrCode,
  resume: FileText,
  file: FileText,
};

const NAVY = "#0d1748";
const MUTED = "#59658c";
const BLUE = "#2563eb";

const fontDir = path.join(process.cwd(), "app", "og");
let fonts: Promise<[Buffer, Buffer]> | null = null;
function loadFonts() {
  fonts ??= Promise.all([
    readFile(path.join(fontDir, "LiberationSans-Bold.ttf")),
    readFile(path.join(fontDir, "LiberationSans-Regular.ttf")),
  ]);
  return fonts;
}

function clip(value: string | null, max: number) {
  const text = (value ?? "").trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = clip(searchParams.get("t"), 70) || "RepetiGo";
  const subtitle = clip(searchParams.get("s"), 140);
  const category = clip(searchParams.get("c"), 32).toUpperCase();
  const iconKey = (searchParams.get("i") ?? "file") as OgIcon;
  const Icon = ICONS[iconKey] ?? FileText;
  const titleSize = title.length > 34 ? 56 : title.length > 22 ? 64 : 72;
  const [bold, regular] = await loadFonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#f8f9fe",
          backgroundImage:
            "radial-gradient(circle at 88% 12%, rgba(37,99,235,0.16), transparent 42%), radial-gradient(circle at 6% 96%, rgba(20,184,166,0.14), transparent 40%)",
          fontFamily: "Liberation",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", padding: "56px 0 52px 68px", width: 720, height: "100%" }}>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>
            <span style={{ color: NAVY }}>Repeti</span>
            <span style={{ color: BLUE }}>Go</span>
          </div>
          {category ? (
            <div style={{ display: "flex", marginTop: 34 }}>
              <div
                style={{
                  display: "flex",
                  padding: "9px 20px",
                  borderRadius: 999,
                  backgroundColor: "#eff6ff",
                  border: "2px solid #bfd3fb",
                  color: BLUE,
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: 1,
                }}
              >
                {category}
              </div>
            </div>
          ) : null}
          <div
            style={{
              display: "flex",
              marginTop: 26,
              fontSize: titleSize,
              fontWeight: 700,
              color: NAVY,
              lineHeight: 1.08,
              letterSpacing: -1.5,
              maxWidth: 640,
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div style={{ display: "flex", marginTop: 22, fontSize: 28, color: MUTED, lineHeight: 1.35, maxWidth: 620 }}>
              {subtitle}
            </div>
          ) : null}
          <div style={{ display: "flex", marginTop: "auto", alignItems: "center", fontSize: 24, fontWeight: 700, color: BLUE }}>
            repetigo.com
            <span style={{ marginLeft: 16, color: MUTED, fontWeight: 400 }}>· for cyber cafes & print shops</span>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            right: 70,
            top: 118,
            width: 380,
            height: 380,
            borderRadius: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundImage: "linear-gradient(135deg, #2563eb 0%, #1d9bf0 50%, #14b8a6 100%)",
            boxShadow: "0 30px 60px rgba(13,23,72,0.25)",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: -26,
              top: -26,
              width: 110,
              height: 110,
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.18)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 28,
              bottom: 28,
              width: 64,
              height: 64,
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.14)",
            }}
          />
          <Icon size={210} color="#ffffff" strokeWidth={1.6} />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Liberation", data: bold, weight: 700, style: "normal" },
        { name: "Liberation", data: regular, weight: 400, style: "normal" },
      ],
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800" },
    },
  );
}
