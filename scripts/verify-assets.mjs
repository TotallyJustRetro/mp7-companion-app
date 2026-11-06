import { readdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const assetsDirectory = fileURLToPath(new URL('../dist/assets/', import.meta.url));
const requiredAssets = [
  'logo.png',
  'face-mario.png',
  'ship.png',
  'coin.png',
  'star.png',
  'toadsworth-portrait.png',
  'icon-bowser-time.png',
  'board-pagoda-peak.png',
  'panel-minigame-4p.png',
];

let files;
try {
  files = await readdir(assetsDirectory);
} catch (error) {
  throw new Error(
    `The Vite build did not create dist/assets. Check that public/assets is committed and included in the checkout. ${error.message}`,
  );
}

const missing = [];
for (const file of requiredAssets) {
  try {
    await access(path.join(assetsDirectory, file));
  } catch {
    missing.push(file);
  }
}

if (missing.length > 0) {
  throw new Error(`Required artwork files are missing from dist/assets: ${missing.join(', ')}`);
}

console.log(`Verified ${files.length} artwork files in dist/assets before Windows packaging.`);
