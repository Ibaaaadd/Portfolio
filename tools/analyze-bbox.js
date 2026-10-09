import sharp from 'sharp';
import fs from 'fs';

const sourceFile = 'Img/ibad-800.webp';

async function analyzeBoundingBox() {
  console.log('='.repeat(70));
  console.log('ANALISIS BOUNDING BOX: ' + sourceFile);
  console.log('='.repeat(70));
  
  if (!fs.existsSync(sourceFile)) {
    console.log('ERROR: File not found:', sourceFile);
    return;
  }
  
  const image = sharp(sourceFile);
  const metadata = await image.metadata();
  
  console.log('\nDIMENSI FILE ASLI:');
  console.log(`  Width:  ${metadata.width}px`);
  console.log(`  Height: ${metadata.height}px`);
  console.log(`  Ratio:  ${(metadata.width / metadata.height).toFixed(4)}`);
  console.log(`  Alpha:  ${metadata.hasAlpha}`);
  
  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  let minX = info.width;
  let maxX = 0;
  let minY = info.height;
  let maxY = 0;
  
  const alphaThreshold = 16;
  
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * info.channels;
      const alpha = data[idx + 3];
      
      if (alpha > alphaThreshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  
  const bboxWidth = maxX - minX + 1;
  const bboxHeight = maxY - minY + 1;
  const bboxRatio = (bboxWidth / bboxHeight).toFixed(4);
  
  const marginTop = minY;
  const marginBottom = info.height - maxY - 1;
  const marginLeft = minX;
  const marginRight = info.width - maxX - 1;
  
  const marginTopPct = ((marginTop / info.height) * 100).toFixed(1);
  const marginBottomPct = ((marginBottom / info.height) * 100).toFixed(1);
  const marginLeftPct = ((marginLeft / info.width) * 100).toFixed(1);
  const marginRightPct = ((marginRight / info.width) * 100).toFixed(1);
  
  console.log('\n' + '='.repeat(70));
  console.log('BOUNDING BOX SOSOK (alpha > ' + alphaThreshold + '):');
  console.log('='.repeat(70));
  console.log(`  Left:   ${minX}px`);
  console.log(`  Top:    ${minY}px`);
  console.log(`  Width:  ${bboxWidth}px`);
  console.log(`  Height: ${bboxHeight}px`);
  console.log(`  Ratio:  ${bboxRatio} (w/h)`);
  
  console.log('\nMARGIN TRANSPARAN:');
  console.log(`  Atas:  ${marginTop}px (${marginTopPct}%)`);
  console.log(`  Bawah: ${marginBottom}px (${marginBottomPct}%)`);
  console.log(`  Kiri:  ${marginLeft}px (${marginLeftPct}%)`);
  console.log(`  Kanan: ${marginRight}px (${marginRightPct}%)`);
  
  console.log('\nLEBAR & TINGGI SOSOK SEBENARNYA:');
  console.log(`  Lebar sosok:  ${bboxWidth}px`);
  console.log(`  Tinggi sosok: ${bboxHeight}px`);
  
  const paddingTop = Math.round(bboxHeight * 0.03);
  const paddingLeftRight = Math.round(bboxWidth * 0.02);
  
  const cropLeft = Math.max(0, minX - paddingLeftRight);
  const cropTop = Math.max(0, minY - paddingTop);
  const cropWidth = Math.min(info.width - cropLeft, bboxWidth + paddingLeftRight * 2);
  const cropHeight = Math.min(info.height - cropTop, maxY - cropTop + 1);
  
  console.log('\n' + '='.repeat(70));
  console.log('CROP PARAMETERS (dengan padding 3% atas, 2% kiri/kanan, 0% bawah):');
  console.log('='.repeat(70));
  console.log(`  Padding atas:       ${paddingTop}px (3% dari tinggi sosok)`);
  console.log(`  Padding kiri/kanan: ${paddingLeftRight}px (2% dari lebar sosok)`);
  console.log(`  Crop left:   ${cropLeft}px`);
  console.log(`  Crop top:    ${cropTop}px`);
  console.log(`  Crop width:  ${cropWidth}px`);
  console.log(`  Crop height: ${cropHeight}px`);
  console.log(`  Output ratio: ${(cropWidth / cropHeight).toFixed(4)}`);
  
  const results = {
    originalWidth: info.width,
    originalHeight: info.height,
    bboxLeft: minX,
    bboxTop: minY,
    bboxWidth,
    bboxHeight,
    bboxRatio,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    marginTopPct,
    marginBottomPct,
    marginLeftPct,
    marginRightPct,
    cropLeft,
    cropTop,
    cropWidth,
    cropHeight,
    paddingTop,
    paddingLeftRight
  };
  
  fs.writeFileSync('bbox-analysis.json', JSON.stringify(results, null, 2));
  console.log('\n✓ Results saved to: bbox-analysis.json');
  
  return results;
}

analyzeBoundingBox().catch(console.error);
