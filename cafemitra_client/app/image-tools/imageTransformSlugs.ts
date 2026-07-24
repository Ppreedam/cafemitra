export type ImageTransformSlug = "image-converter" | "resize-image" | "crop-image" | "convert-from-jpg" | "html-to-image";

const SLUGS: readonly ImageTransformSlug[] = ["image-converter", "resize-image", "crop-image", "convert-from-jpg", "html-to-image"];

export function isImageTransformSlug(value: string): value is ImageTransformSlug {
  return (SLUGS as readonly string[]).includes(value);
}
