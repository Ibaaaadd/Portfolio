import sharp from 'sharp';

const files = ['Img/ibad-cutout-800.webp', 'Img/ibad-cutout-400.webp'];

for (const f of files) {
  const m = await sharp(f).metadata();
  console.log(`${f.split('/').pop()}: ${m.width}x${m.height}`);
}
