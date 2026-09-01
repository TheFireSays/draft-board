import { readFile, writeFile } from "node:fs/promises";
import gifenc from "gifenc";
import pngjs from "pngjs";

const { GIFEncoder, applyPalette, quantize } = gifenc;
const { PNG } = pngjs;

const root = new URL("../", import.meta.url);
const width = 1180;
const height = 180;
const frameDelayMs = 200;
const frameMixes = [0, 0.25, 0.5, 0.75, 1, 1, 0.75, 0.5, 0.25, 0];
const repeatCount = 0;

const readPng = async (path) => PNG.sync.read(await readFile(new URL(path, root)));
const snap = await readPng("assets/banner/football-snap-frame.png");
const contact = await readPng("assets/banner/football-contact-frame.png");

for (const [label, image] of [["snap", snap], ["contact", contact]]) {
  if (image.width !== width || image.height !== height) {
    throw new Error(`${label} frame must be ${width}x${height}; got ${image.width}x${image.height}`);
  }
}

const encoder = GIFEncoder();
for (const mix of frameMixes) {
  const rgba = new Uint8Array(snap.data.length);
  for (let i = 0; i < rgba.length; i += 1) {
    rgba[i] = Math.round(snap.data[i] * (1 - mix) + contact.data[i] * mix);
  }
  const palette = quantize(rgba, 128, { format: "rgba4444", oneBitAlpha: true });
  const indexed = applyPalette(rgba, palette, "rgba4444");
  encoder.writeFrame(indexed, width, height, {
    palette,
    delay: frameDelayMs,
    repeat: repeatCount,
  });
}
encoder.finish();

const output = encoder.bytes();
await writeFile(new URL("assets/banner/football-snap.gif", root), output);
const cycleSeconds = (frameMixes.length * frameDelayMs) / 1000;
console.log(`Built football-snap.gif (${output.length.toLocaleString()} bytes; seamless ${cycleSeconds}s cycle)`);
