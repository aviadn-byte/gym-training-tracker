import { mkdir, readFile } from 'node:fs/promises';
import sharp from 'sharp';

await mkdir('public', { recursive: true });

const svg = await readFile('public/favicon.svg');

await Promise.all([
  sharp(svg).resize(192, 192).png().toFile('public/pwa-192x192.png'),
  sharp(svg).resize(512, 512).png().toFile('public/pwa-512x512.png'),
  sharp(svg).resize(180, 180).png().toFile('public/apple-touch-icon.png')
]);
