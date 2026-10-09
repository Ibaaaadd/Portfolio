import sharp from 'sharp';
import { statSync } from 'fs';

const files = [
  'Img/ibad-800.webp',
  'Img/ibad-400.webp', 
  'Img/-ibad-400.webp',
  'Img/ibad-cutout-640.webp',
  'Img/ibad-cutout-800.webp',
  'Img/ibad-cutout-960.webp',
  'Img/ibad-cutout-1280.webp',
  'Img/ibad-cutout-400.webp'
];

console.log('📸 Checking current image files:\n');

for (const file of files) {
  try {
    const stat = statSync(file);
    const metadata = await sharp(file).metadata();
    console.log(`${file}:`);
    console.log(`  Dimensions: ${metadata.width}x${metadata.height}`);
    console.log(`  Format: ${metadata.format}`);
    console.log(`  HasAlpha: ${metadata.hasAlpha}`);
    console.log(`  Size: ${(stat.size / 1024).toFixed(2)} KB\n`);
  } catch (err) {
    console.log(`${file}: NOT FOUND\n`);
  }
}
