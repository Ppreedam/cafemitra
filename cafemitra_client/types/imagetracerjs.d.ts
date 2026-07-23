declare module "imagetracerjs" {
  export type ImageTracerOptions = Record<string, number | string | boolean>;

  interface ImageTracerStatic {
    imagedataToSVG(imagedata: ImageData, options?: ImageTracerOptions | string): string;
  }

  const ImageTracer: ImageTracerStatic;
  export default ImageTracer;
}
