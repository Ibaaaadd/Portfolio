import sharp from 'sharp';
import fs from 'fs';

const sourceFile = 'Img/ibad-800.webp';
const outputFile = 'Img/ibad-cutout-trim.webp';
const bboxData = JSON.parse(fs.readFileSync('bbox-analysis.json', 'utf-8'));

async function createTrimmedCutout() {
  console.log('='.repeat(70));
  console.log('CREATING TRIMMED CUTOUT');
  console.log('='.repeat(70));
  
  console.log('\nSource:', sourceFile);
  console.log('Output:', outputFile);
  
  console.log('\nCrop parameters:');
  console.log(`  Left:   ${bboxData.cropLeft}px`);
  console.log(`  Top:    ${bboxData.cropTop}px`);
  console.log(`  Width:  ${bboxData.cropWidth}px`);
  console.log(`  Height: ${bboxData.cropHeight}px`);
  
  await sharp(sourceFile)
    .extract({
      left: bboxData.cropLeft,
      top: bboxData.cropTop,
      width: bboxData.cropWidth,
      height: bboxData.cropHeight
    })
    .webp({
      quality: 90,
      alphaQuality: 100,
      effort: 6
    })
    .toFile(outputFile);
  
  const outputMeta = await sharp(outputFile).metadata();
  const outputStats = fs.statSync(outputFile);
  const outputRatio = (outputMeta.width / outputMeta.height).toFixed(4);
  
  console.log('\n' + '='.repeat(70));
  console.log('OUTPUT FILE CREATED:');
  console.log('='.repeat(70));
  console.log(`  Width:      ${outputMeta.width}px`);
  console.log(`  Height:     ${outputMeta.height}px`);
  console.log(`  Ratio:      ${outputRatio} (w/h)`);
  console.log(`  hasAlpha:   ${outputMeta.hasAlpha}`);
  console.log(`  File size:  ${(outputStats.size / 1024).toFixed(2)} KB`);
  
  console.log('\n' + '='.repeat(70));
  console.log('FIGURE ANALYSIS:');
  console.log('='.repeat(70));
  console.log(`  Lebar sosok sebenarnya: ${bboxData.bboxWidth}px`);
  console.log(`  Tinggi sosok sebenarnya: ${bboxData.bboxHeight}px`);
  console.log(`  Lebar file output: ${outputMeta.width}px`);
  
  if (outputMeta.width < 500) {
    console.log('\n⚠️  WARNING: LOW RESOLUTION');
    console.log(`  Figure width (${outputMeta.width}px) is < 500px`);
    console.log('  This will appear soft/blurry on retina displays.');
    console.log('  This is a SOURCE LIMITATION, not a CSS bug.');
    console.log('  To fix: need high-resolution original photo (>1200px) for re-cutout.');
  }
  
  console.log('\n✓ Trimmed cutout created successfully!');
  console.log('  File:', outputFile);
  
  return {
    width: outputMeta.width,
    height: outputMeta.height,
    ratio: outputRatio,
    fileSize: (outputStats.size / 1024).toFixed(2)
  };
}

createTrimmedCutout().catch(console.error);
