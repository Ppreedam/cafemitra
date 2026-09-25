"use client";

// Photoshop-style manual colour controls for one side of a card: Brightness,
// Contrast, Black and the Red / Yellow / Blue inks, each a slider with a
// number box, plus Reset. Non-destructive - the photo stays as it is; the
// preview and the print both run the same pixel pass (applyTone), so what
// shows on screen is what prints.
import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";

export type Tone = { brightness: number; contrast: number; black: number; red: number; yellow: number; blue: number };

export const NEUTRAL_TONE: Tone = { brightness: 0, contrast: 0, black: 0, red: 0, yellow: 0, blue: 0 };

const KEYS = Object.keys(NEUTRAL_TONE) as (keyof Tone)[];

export function isNeutralTone(tone?: Partial<Tone>) {
  return !tone || KEYS.every((key) => !tone[key]);
}

// Output level (0..1) for input level v (0..1), per channel. Brightness bends
// the curve through its middle like dragging the midpoint in Curves, so black
// and white stay put; contrast steepens (or flattens) it around mid grey;
// Black deepens the dark tones (or lifts them to grey) and leaves white alone.
function toneAt(v: number, tone: Tone) {
  const gamma = Math.pow(2, -tone.brightness / 60);
  const slope = Math.pow(4, tone.contrast / 100);
  let out = Math.min(1, Math.max(0, 0.5 + (Math.pow(v, gamma) - 0.5) * slope));
  const k = tone.black / 100;
  const shadow = (1 - out) * (1 - out);
  out = k >= 0 ? out * (1 - 0.7 * k * shadow) : out + -k * 0.35 * shadow;
  return Math.min(1, Math.max(0, out));
}

function toneLut(tone: Tone) {
  const lut = new Uint8ClampedArray(256);
  for (let i = 0; i < 256; i++) lut[i] = Math.round(toneAt(i / 255, tone) * 255);
  return lut;
}

// How much a hue (degrees) belongs to a colour centred on `centre`: 1 at the
// centre, fading to 0 `width` degrees away.
function hueWeight(hue: number, centre: number, width: number) {
  let d = Math.abs(hue - centre) % 360;
  if (d > 180) d = 360 - d;
  if (d >= width) return 0;
  const t = d / width;
  return 1 - t * t * (3 - 2 * t);
}

// Red, yellow and blue: more (or less) of that ink - pixels of that colour get
// stronger (or fade towards grey); grey, black and white pixels are untouched.
function applyColours(d: Uint8ClampedArray, tone: Tone) {
  const r0 = tone.red / 100, y0 = tone.yellow / 100, b0 = tone.blue / 100;
  if (!r0 && !y0 && !b0) return;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    if (max - min < 6) continue;
    let hue: number;
    if (max === r) hue = ((g - b) / (max - min)) * 60;
    else if (max === g) hue = ((b - r) / (max - min)) * 60 + 120;
    else hue = ((r - g) / (max - min)) * 60 + 240;
    if (hue < 0) hue += 360;
    const amount = r0 * hueWeight(hue, 0, 40) + y0 * hueWeight(hue, 55, 35) + b0 * hueWeight(hue, 220, 50);
    if (!amount) continue;
    const scale = 1 + amount * (amount > 0 ? 1.2 : 1);
    const grey = 0.299 * r + 0.587 * g + 0.114 * b;
    d[i] = grey + (r - grey) * scale;
    d[i + 1] = grey + (g - grey) * scale;
    d[i + 2] = grey + (b - grey) * scale;
  }
}

function applyTone(d: Uint8ClampedArray, tone: Tone) {
  const lut = toneLut(tone);
  for (let i = 0; i < d.length; i += 4) {
    d[i] = lut[d[i]];
    d[i + 1] = lut[d[i + 1]];
    d[i + 2] = lut[d[i + 2]];
  }
  applyColours(d, tone);
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = url;
  });
}

// A copy of the image with the tone applied, as a blob URL. maxSide shrinks it
// first (for the on-screen preview); printing uses the full size.
export async function bakeTone(url: string, tone: Tone, maxSide = Infinity): Promise<string> {
  const image = await loadImage(url);
  const k = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.naturalWidth * k);
  canvas.height = Math.round(image.naturalHeight * k);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  applyTone(pixels.data, { ...NEUTRAL_TONE, ...tone });
  context.putImageData(pixels, 0, 0);
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not apply the colour settings"))), "image/jpeg", 0.92));
  return URL.createObjectURL(blob);
}

// The card photo with its tone applied. Re-rendered shortly after the sliders
// stop, on a screen-sized copy; the plain photo shows until then.
export function TonedImage({ url, tone, alt }: { url: string; tone?: Tone; alt: string }) {
  const [preview, setPreview] = useState<{ src: string; key: string } | null>(null);
  const key = tone && !isNeutralTone(tone) ? `${url}|${KEYS.map((k) => tone[k] ?? 0).join(",")}` : "";
  useEffect(() => {
    if (!key || !tone) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      bakeTone(url, tone, 1000)
        .then((src) => {
          if (cancelled) URL.revokeObjectURL(src);
          else setPreview({ src, key });
        })
        .catch(() => {});
    }, 60);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  // Drop a preview once it is replaced or no longer wanted.
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview.src);
  }, [preview]);
  // Keeps the last preview while a newer one renders, so dragging doesn't flicker.
  const src = key && preview && preview.key.startsWith(`${url}|`) ? preview.src : url;
  return <img src={src} alt={alt} />;
}

const SLIDERS: { key: keyof Tone; name: string; swatch?: string }[] = [
  { key: "brightness", name: "Brightness" },
  { key: "contrast", name: "Contrast" },
  { key: "black", name: "Black", swatch: "#111" },
  { key: "red", name: "Red", swatch: "#e0262b" },
  { key: "yellow", name: "Yellow", swatch: "#f2c200" },
  { key: "blue", name: "Blue", swatch: "#2563eb" },
];

type Props = {
  label: string;
  tone: Tone;
  disabled: boolean;
  onChange: (tone: Tone) => void;
};

export function ToneControl({ label, tone, disabled, onChange }: Props) {
  const set = (key: keyof Tone, value: number) => onChange({ ...NEUTRAL_TONE, ...tone, [key]: Math.max(-100, Math.min(100, Math.round(value) || 0)) });
  return (
    <div className={`idcard-tone-panel${disabled ? " disabled" : ""}`}>
      <div className="idcard-tone-head">
        <strong>{label}</strong>
        <button type="button" disabled={disabled || isNeutralTone(tone)} onClick={() => onChange(NEUTRAL_TONE)} title="Back to the photo as it is">
          <RotateCcw size={12} /> Reset
        </button>
      </div>
      {SLIDERS.map(({ key, name, swatch }) => (
        <label key={key} className="idcard-tone-slider">
          <span>
            <em>
              {swatch ? <i style={{ background: swatch }} /> : null}
              {name}
            </em>
            <input type="number" min={-100} max={100} value={tone[key] ?? 0} disabled={disabled} onChange={(event) => set(key, Number(event.target.value))} />
          </span>
          <input type="range" min={-100} max={100} value={tone[key] ?? 0} disabled={disabled} onChange={(event) => set(key, Number(event.target.value))} />
        </label>
      ))}
    </div>
  );
}
