// The Clean Scan worker loads OpenCV.js via importScripts() from a plain
// static file instead of bundling it through Turbopack - bundling this
// particular ~10MB module inside a worker was hanging indefinitely (Turbopack
// split it into multiple chunks and its worker-side dynamic import() never
// settled). Keep the static copy in sync with the installed package version.
const fs = require("fs");
const path = require("path");

const source = path.join(__dirname, "..", "node_modules", "@techstark", "opencv-js", "dist", "opencv.js");
const destDir = path.join(__dirname, "..", "public", "opencv");
const dest = path.join(destDir, "opencv.js");

if (!fs.existsSync(source)) {
  console.warn("[copy-opencv] @techstark/opencv-js not installed yet, skipping.");
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(source, dest);
console.log(`[copy-opencv] Copied opencv.js -> ${path.relative(process.cwd(), dest)}`);
