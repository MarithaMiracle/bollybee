#!/usr/bin/env node
/**
 * Build a square 512×512 PNG for Gravatar / email avatar uploads.
 * Run: npm run brand:gravatar
 */
import sharp from "sharp";
import { join } from "node:path";

const SIZE = 512;
const PADDING = 0.13;
const BG = { r: 250, g: 248, b: 245, alpha: 1 }; // brand cream #faf8f5

const input = join(process.cwd(), "public/brand/bollybee-mark.png");
const output = join(process.cwd(), "public/brand/bollybee-gravatar.png");
const logoMax = Math.round(SIZE * (1 - PADDING * 2));

const logo = await sharp(input)
  .resize({ width: logoMax, height: logoMax, fit: "inside" })
  .toBuffer();

const meta = await sharp(logo).metadata();

await sharp({
  create: {
    width: SIZE,
    height: SIZE,
    channels: 4,
    background: BG,
  },
})
  .composite([
    {
      input: logo,
      left: Math.round((SIZE - meta.width) / 2),
      top: Math.round((SIZE - meta.height) / 2),
    },
  ])
  .png({ compressionLevel: 9 })
  .toFile(output);

console.log(`✅ ${output} (${SIZE}×${SIZE})`);
