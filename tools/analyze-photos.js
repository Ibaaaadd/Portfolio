import sharp from 'sharp';
import fs from 'fs';

const files = [
  'Img/ibad-400.webp',
  'Img/ibad-800.webp',
  'Img/-ibad-400.webp',
  'Img/ibad-cutout-640.webp',
  'Img/ibad-cutout-960.webp',
  'Img/ibad-cutout-1280.webp'
];

async function analyze() {
  console.log('FILE ANALYSIS');
  console.log('='.repeat(80));
  
  for (const file of files) {
    if (!fs.existsSync(file)) {
      console.log(`\n${file}: FILE NOT FOUND\n`);
      continue;
    }
    
    const stats = fs.statSync(file);
    const metadata = await sharp(file).metadata();
    const ratio = (metadata.width / metadata.height).toFixed(4);
    
    console.log(`\n${file}:`);
    console.log(`  Width:     ${metadata.width}px`);
    console.log(`  Height:    ${metadata.height}px`);
    console.log(`  Ratio:     ${ratio} (w/h)`);
    console.log(`  hasAlpha:  ${metadata.hasAlpha}`);
    console.log(`  Size:      ${(stats.size / 1024).toFixed(2)} KB`);
  }
  
  if (fs.existsSync('Img/ibad-800.webp')) {
    console.log(`\n${'='.repeat(80)}`);
    console.log('FIGURE DIMENSIONS (after trim transparent areas):');
    const trimmed = await sharp('Img/ibad-800.webp').trim().metadata();
    console.log(`  Actual figure width:  ${trimmed.width}px`);
    console.log(`  Actual figure height: ${trimmed.height}px`);
    console.log(`  Trimmed ratio:        ${(trimmed.width / trimmed.height).toFixed(4)}`);
  }
}

analyze().catch(console.error);
