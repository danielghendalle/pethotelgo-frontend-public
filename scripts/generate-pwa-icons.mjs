// Regenerates the PWA install icons from the app's favicon.
//
//   node scripts/generate-pwa-icons.mjs
//
// Source:  public/favicon.ico   (the canonical brand mark — keep this current)
// Outputs (into /public):
//   pwa-64x64.png, pwa-192x192.png, pwa-512x512.png,
//   maskable-512x512.png, apple-touch-icon.png
//
// The favicon shown in the browser tab is public/favicon.ico itself
// (referenced from index.html); this script only produces the larger PNGs the
// web app manifest and iOS need.
//
// Requires the dev dependency `sharp`, plus macOS `sips` to decode the .ico
// (sharp has no ICO decoder). Run on macOS, or convert favicon.ico -> a PNG
// yourself and point SOURCE_PNG at it.
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";

const publicDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../public",
);

// Warm-cream plate behind the mark, matching --background in src/index.css.
const BG = { r: 251, g: 247, b: 240, alpha: 1 };

// Decode favicon.ico -> PNG (sharp can't read ICO).
let SOURCE_PNG = process.env.SOURCE_PNG;
if (!SOURCE_PNG) {
  const tmp = path.join(mkdtempSync(path.join(tmpdir(), "pwaicons-")), "src.png");
  try {
    execFileSync("sips", [
      "-s",
      "format",
      "png",
      path.join(publicDir, "favicon.ico"),
      "--out",
      tmp,
    ]);
  } catch {
    console.error(
      "Could not run `sips` to decode favicon.ico.\n" +
        "Convert it to a PNG manually and re-run with SOURCE_PNG=/path/to.png",
    );
    process.exit(1);
  }
  SOURCE_PNG = tmp;
}

/** Square icon of `size`px: brand mark on the cream plate, with `inset`
 *  fractional transparent padding on each edge (maskable safe area). */
async function render(size, inset) {
  const inner = Math.round(size * (1 - inset * 2));
  const mark = await sharp(SOURCE_PNG)
    .resize(inner, inner, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();
  return sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  })
    .composite([{ input: mark, gravity: "centre" }])
    .png()
    .toBuffer();
}

const targets = [
  { file: "pwa-64x64.png", size: 64, inset: 0.06 },
  { file: "pwa-192x192.png", size: 192, inset: 0.08 },
  { file: "pwa-512x512.png", size: 512, inset: 0.08 },
  // Keep the mark well inside the ~80% safe circle launchers may crop to.
  { file: "maskable-512x512.png", size: 512, inset: 0.2 },
  { file: "apple-touch-icon.png", size: 180, inset: 0.08 },
];

for (const { file, size, inset } of targets) {
  await sharp(await render(size, inset)).toFile(path.join(publicDir, file));
  console.log("wrote", file);
}

console.log("done");
