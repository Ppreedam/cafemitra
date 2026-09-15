// Runs entirely off the main thread: OpenCV.js (WASM) is loaded and executed
// here only, so heavy pixel work never blocks button clicks / scrolling on
// the page. See cleanScanEngine.ts for the pool that talks to this file.

type ProcessRequest = {
  type: "process";
  id: number;
  width: number;
  height: number;
  buffer: ArrayBuffer;
};

type WorkerRequest = ProcessRequest;

// self.postMessage/onmessage/importScripts have different (or missing) type
// signatures between the Window and DedicatedWorkerGlobalScope lib
// definitions, and this project's tsconfig only includes "dom" (not
// "webworker"). Narrow the shape we actually use instead of pulling in the
// worker lib project-wide.
const ctx = self as unknown as {
  postMessage: (message: unknown, transfer?: Transferable[]) => void;
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
  importScripts: (...urls: string[]) => void;
  cv: any;
};

let cvReadyPromise: Promise<{ instance: any }> | null = null;

// OpenCV.js is loaded from a plain static file via importScripts() instead of
// being bundled as an npm import: Turbopack splits this ~10MB module across
// several chunks when it's dynamic-import()'d from inside a worker, and its
// worker-side loader never finished reassembling it - the import() promise
// just hung forever, with no error, which is why "Clean Scan" used to hang.
// importScripts() only exists in a classic (non-"module") worker, so
// cleanScanEngine.ts must construct this Worker without { type: "module" }.
//
// The resolved cv object itself exposes a `.then` method (part of its own
// API surface, unrelated to Promises) - resolving a Promise directly with it
// makes the Promise machinery treat cv as a thenable and chain off that
// `.then` instead of fulfilling with the value, which never calls back and
// hangs forever with no error. Wrapping it in a plain object sidesteps that.
function loadOpenCv(): Promise<{ instance: any }> {
  if (!cvReadyPromise) {
    cvReadyPromise = new Promise((resolve, reject) => {
      ctx.postMessage({ type: "status", phase: "loading" });
      try {
        ctx.importScripts("/opencv/opencv.js");
      } catch (error) {
        reject(error);
        return;
      }
      const cv = ctx.cv;
      if (!cv) {
        reject(new Error("opencv.js loaded but did not define a global cv object"));
        return;
      }
      if (cv.Mat) {
        resolve({ instance: cv });
        return;
      }
      cv["onRuntimeInitialized"] = () => resolve({ instance: cv });
    });
  }
  return cvReadyPromise;
}

function oddify(value: number, min = 3) {
  const v = Math.max(min, Math.round(value));
  return v % 2 === 0 ? v + 1 : v;
}

// Cleans up a scan while keeping it recognizable: removes shadows/paper-tint
// and boosts local contrast, in color, then sharpens - the same family of
// result as CamScanner's "Enhance"/"Magic Color" mode. A full black & white
// threshold (the "Photocopy filter" look) was tried first, but it destroys
// photos, QR codes and colored ID cards - only fine for plain text pages, and
// this tool has to handle Aadhaar/PAN/ID-card scans too.
function cleanScan(cv: any, srcMat: any): any {
  const toDelete: any[] = [];
  const track = <T,>(mat: T): T => {
    toDelete.push(mat);
    return mat;
  };

  const rgbRaw = track(new cv.Mat());
  cv.cvtColor(srcMat, rgbRaw, cv.COLOR_RGBA2RGB);

  // Denoise first (edge-preserving, unlike a plain blur) - phone-camera/JPEG
  // grain in flat areas (paper, colored header bars) otherwise gets amplified
  // into visible speckle by the sharpening step further down.
  const rgb = track(new cv.Mat());
  cv.bilateralFilter(rgbRaw, rgb, 7, 50, 50, cv.BORDER_DEFAULT);

  const gray = track(new cv.Mat());
  cv.cvtColor(rgb, gray, cv.COLOR_RGB2GRAY);

  // Estimate uneven lighting/shadows via a large-kernel blur.
  const bg = track(new cv.Mat());
  const blurKernel = oddify(Math.min(gray.rows, gray.cols) / 12, 15);
  cv.GaussianBlur(gray, bg, new cv.Size(blurKernel, blurKernel), 0, 0, cv.BORDER_DEFAULT);
  const bgF = track(new cv.Mat());
  bg.convertTo(bgF, cv.CV_32F, 1, 1); // +1 avoids divide-by-zero on pure-black regions

  // Divide every color channel (not just grayscale) by the shadow map, so
  // shadows/tint are removed while hue and color survive.
  const srcChannels = track(new cv.MatVector());
  cv.split(rgb, srcChannels);
  const normalizedChannels = track(new cv.MatVector());
  for (let i = 0; i < 3; i += 1) {
    const channel = track(srcChannels.get(i));
    const channelF = track(new cv.Mat());
    channel.convertTo(channelF, cv.CV_32F);
    const normF = track(new cv.Mat());
    cv.divide(channelF, bgF, normF, 255);
    const norm8 = track(new cv.Mat());
    normF.convertTo(norm8, cv.CV_8U);
    normalizedChannels.push_back(norm8);
  }
  const normalizedRgb = track(new cv.Mat());
  cv.merge(normalizedChannels, normalizedRgb);

  // Local contrast boost on lightness only (Lab colorspace) so it doesn't
  // shift colors the way running CLAHE per RGB channel would.
  const lab = track(new cv.Mat());
  cv.cvtColor(normalizedRgb, lab, cv.COLOR_RGB2Lab);
  const labChannels = track(new cv.MatVector());
  cv.split(lab, labChannels);
  const lightness = track(labChannels.get(0));
  const lightnessEnhanced = track(new cv.Mat());
  // A gentler clip limit + bigger tiles than the usual CLAHE default (2.0,
  // 8x8) - stronger settings made colors look oversaturated/neon and created
  // blotchy halos around text on real (noisier) phone-camera scans.
  const clahe = track(new cv.CLAHE(1.2, new cv.Size(12, 12)));
  clahe.apply(lightness, lightnessEnhanced);
  labChannels.set(0, lightnessEnhanced);
  const enhancedLab = track(new cv.Mat());
  cv.merge(labChannels, enhancedLab);
  const enhancedRgb = track(new cv.Mat());
  cv.cvtColor(enhancedLab, enhancedRgb, cv.COLOR_Lab2RGB);

  // Mild unsharp-mask sharpen so text edges stay crisp - kept gentle since
  // the bilateral denoise above already did most of the noise cleanup, and
  // an aggressive sharpen re-amplifies whatever noise remains.
  const blurredForSharpen = track(new cv.Mat());
  cv.GaussianBlur(enhancedRgb, blurredForSharpen, new cv.Size(0, 0), 1.5);
  const sharpened = track(new cv.Mat());
  cv.addWeighted(enhancedRgb, 1.2, blurredForSharpen, -0.2, 0, sharpened);

  const outRgba = new cv.Mat();
  cv.cvtColor(sharpened, outRgba, cv.COLOR_RGB2RGBA);

  toDelete.forEach((mat) => mat.delete());

  return outRgba;
}

async function handleProcess(request: ProcessRequest) {
  const { id, width, height, buffer } = request;
  let srcMat: any = null;
  try {
    const { instance: cv } = await loadOpenCv();
    const srcData = new Uint8ClampedArray(buffer);
    srcMat = cv.matFromImageData(new ImageData(srcData, width, height));
    const outMat = cleanScan(cv, srcMat);
    const outBuffer = new Uint8ClampedArray(outMat.data).buffer;
    outMat.delete();
    ctx.postMessage({ type: "result", id, width, height, buffer: outBuffer }, [outBuffer]);
  } catch (error) {
    ctx.postMessage({ type: "error", id, message: error instanceof Error ? error.message : "Clean scan failed" });
  } finally {
    srcMat?.delete();
  }
}

ctx.onmessage = (event) => {
  const request = event.data;
  if (request?.type === "process") {
    handleProcess(request);
  }
};
