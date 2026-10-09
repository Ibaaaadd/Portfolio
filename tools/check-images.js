const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const files = [
  'Img/ibad-400.webp',
  'Img/ibad-800.webp',
  'Img/-ibad-800.webp',
  '_originals/Img/ibad.jpeg',
  'Img/tools/ibad-400-cutout.webp',
  'Img/tools/ibad-800-cutout.webp',
  'Img/tools/ibad-cutout-trim.webp'
];

(async () => {
  console.log('=== IMAGE DIMENSION ANALYSIS ===\n');
  
  for (const f of files) {
    try {
      if (!fs.existsSync(f)) {
        console.log(`${f}: FILE NOT FOUND\n`);
        continue;
      }
      
      const meta = await sharp(f).metadata();
      const stat = fs.statSync(f);
      
      console.log(`${f}:`);
      console.log(`  Dimensions: ${meta.width}x${meta.height} px`);
      console.log(`  Aspect Ratio: ${(meta.width/meta.height).toFixed(3)} (width/height)`);
      console.log(`  Format: ${meta.format}`);
      console.log(`  HasAlpha: ${meta.hasAlpha}`);
      console.log(`  Size: ${(stat.size/1024).toFixed(2)} KB`);
      console.log('');
    } catch(e) {
      console.log(`${f}: ERROR - ${e.message}\n`);
    }
  }
  
  console.log('=== RETINA REQUIREMENTS ===');
  console.log('Desktop display: ~420 CSS px wide');
  console.log('  2x retina needs: 840 px wide minimum');
  console.log('  3x retina needs: 1260 px wide minimum');
  console.log('');
  console.log('Mobile display: ~340 CSS px wide');
  console.log('  2x retina needs: 680 px wide minimum');
  console.log('  3x retina needs: 1020 px wide minimum');
})();
