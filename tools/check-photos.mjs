import sharp from 'sharp';
import { statSync } from 'fs';

const files = [
  'Img/ibad-800.webp',
  'Img/ibad-400.webp',
  'Img/-ibad-400.webp'
];

console.log('📸 Checking photo files:\n');

for (const file of files) {
  try {
    const stat = statSync(file);
    const metadata = await sharp(file).metadata();
    console.log(`${file}:`);
    console.log(`  Exists: YES`);
    console.log(`  Size: ${(stat.size / 1024).toFixed(2)} KB`);
    console.log(`  Dimensions: ${metadata.width}x${metadata.height}`);
    console.log(`  Format: ${metadata.format}`);
    console.log(`  Has Alpha: ${metadata.hasAlpha}`);
    console.log(`  Channels: ${metadata.channels}\n`);
  } catch (err) {
    console.log(`${file}:`);
    console.log(`  Exists: NO - ${err.message}\n`);
  }
}
