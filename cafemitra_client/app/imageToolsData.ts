export type ImageTool = {
  category: "Optimize" | "Create" | "Modify" | "Convert" | "Security";
  name: string;
  description: string;
  badge: string;
  color: string;
  isNew?: boolean;
  href?: string;
};

export const imageTools: ImageTool[] = [
  { category: "Optimize", name: "Compress IMAGE", description: "Compress JPG, PNG, and WebP images while saving space and maintaining quality.", badge: "ZIP", color: "#83bd55", href: "/image-tools/compress-image" },
  { category: "Optimize", name: "Upscale", description: "Instantly enlarge images 2x or 4x, entirely in your browser.", badge: "UP", color: "#83bd55", isNew: true, href: "/image-tools/upscale-image" },
  { category: "Optimize", name: "AI Image Upscaler", description: "Enlarge blurry scans and old photos with real AI-added detail.", badge: "AI", color: "#83bd55", isNew: true, href: "/image-tools/ai-upscale-image" },
  { category: "Optimize", name: "Remove background", description: "Quickly remove image backgrounds and download a transparent PNG.", badge: "BG", color: "#83bd55", isNew: true, href: "/image-tools/background-remover" },
  { category: "Create", name: "Meme generator", description: "Create custom memes online with captions, meme images, or uploaded pictures.", badge: "MEME", color: "#b0649b", href: "/image-tools/meme-generator" },
  { category: "Create", name: "Photo editor", description: "Spice up pictures with text, effects, frames, or stickers using simple editing tools.", badge: "EDIT", color: "#b0649b", href: "/image-tools/photo-editor" },
  { category: "Modify", name: "Resize IMAGE", description: "Define dimensions by percent or pixel, and resize JPG, PNG, and WebP images.", badge: "SIZE", color: "#35b5df", href: "/image-tools/resize-image" },
  { category: "Modify", name: "Crop IMAGE", description: "Crop JPG, PNG, or WebP images with centered aspect-ratio controls.", badge: "CUT", color: "#35b5df", href: "/image-tools/crop-image" },
  { category: "Modify", name: "Rotate IMAGE", description: "Rotate to any angle, flip, and batch-process JPG, PNG, or WebP images.", badge: "ROT", color: "#35b5df", href: "/image-tools/rotate-image" },
  { category: "Convert", name: "Convert to JPG", description: "Convert PNG, WebP, GIF, BMP, SVG, or HEIC into JPG - one tool, every format.", badge: "JPG", color: "#efc91e", href: "/image-tools/convert-to-jpg" },
  { category: "Convert", name: "Convert from JPG", description: "Turn JPG images into PNG or WebP files.", badge: "JPG", color: "#efc91e", href: "/image-tools/convert-from-jpg" },
  { category: "Convert", name: "HTML to IMAGE", description: "Render readable HTML file content into a PNG image.", badge: "HTML", color: "#efc91e", href: "/image-tools/html-to-image" },
  { category: "Convert", name: "Website to Image", description: "Capture a complete public webpage as one full-page PNG or JPG image.", badge: "WEB", color: "#efc91e", href: "/image-tools/website-to-image" },
  { category: "Convert", name: "Image Converter", description: "Convert images into JPG, PNG, WebP, SVG, BMP, ICO, or PDF.", badge: "IMG", color: "#efc91e", href: "/image-tools/image-converter" },
  { category: "Convert", name: "HEIC to JPG", description: "Convert iPhone HEIC photos into widely supported JPG files - single or batch.", badge: "HEIC", color: "#efc91e", href: "/image-tools/heic-to-jpg" },
  { category: "Convert", name: "SVG Converter", description: "Convert SVG artwork into PNG or JPG at any size.", badge: "SVG", color: "#efc91e", href: "/image-tools/svg-converter" },
  { category: "Convert", name: "WebP to PNG", description: "Convert WebP images into lossless PNG files - transparency preserved.", badge: "PNG", color: "#efc91e", href: "/image-tools/webp-to-png" },
  { category: "Convert", name: "PNG Converter", description: "Convert PNG into JPG, WebP, GIF, BMP, ICO, or PDF - one tool, every format.", badge: "PNG", color: "#efc91e", href: "/image-tools/png-converter" },
  { category: "Convert", name: "WebP to JPG", description: "Convert WebP images into compatible JPG files - single or batch.", badge: "JPG", color: "#efc91e", href: "/image-tools/webp-to-jpg" },
  { category: "Convert", name: "JPG to WebP", description: "Convert JPG images into smaller WebP files for faster websites.", badge: "WEBP", color: "#efc91e", href: "/image-tools/jpg-to-webp" },
  { category: "Convert", name: "JPG Converter", description: "Convert JPG into PNG, WebP, GIF, BMP, ICO, PDF, or SVG - one tool, every format.", badge: "JPG", color: "#efc91e", href: "/image-tools/jpg-converter" },
  { category: "Convert", name: "PNG to JPG", description: "Convert transparent or lossless PNG files into JPG.", badge: "JPG", color: "#efc91e", href: "/image-tools/png-to-jpg" },
  { category: "Convert", name: "GIF Converter", description: "Convert GIF into JPG, PNG, WebP, BMP, ICO, PDF, or SVG - one tool, every format.", badge: "GIF", color: "#efc91e", href: "/image-tools/gif-converter" },
  { category: "Convert", name: "PNG to SVG", description: "Vectorize PNG logos and icons into scalable SVG files.", badge: "SVG", color: "#efc91e", href: "/image-tools/png-to-svg" },
  { category: "Security", name: "Watermark IMAGE", description: "Stamp an image or text over your images with typography, transparency, and position.", badge: "WM", color: "#4e82bd", href: "/image-tools/watermark-image" },
  { category: "Security", name: "Blur face", description: "Blur faces, license plates, and private objects in photos.", badge: "BLUR", color: "#4e82bd", isNew: true, href: "/image-tools/blur-face" },
];
