import sharp from 'sharp';

const files = [
  'Img/ibad-800.webp',
  'Img/ibad-400.webp'
];

for (const file of files) {
  try {
    const metadata = await sharp(file).metadata();
    console.log(`\n${file}:`);
    console.log(`  Dimensions: ${metadata.width}x${metadata.height}`);
    console.log(`  Format: ${metadata.format}`);
    console.log(`  Has Alpha: ${metadata.hasAlpha}`);
    console.log(`  Channels: ${metadata.channels}`);
    console.log(`  Space: ${metadata.space}`);
    console.log(`  Size: ${(await sharp(file).toBuffer()).length} bytes`);
  } catch (err) {
    console.error(`Error checking ${file}:`, err.message);
  }
}
