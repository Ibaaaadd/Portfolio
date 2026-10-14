import sharp from 'sharp';

console.log('🖼️  Processing new profile photo...\n');

const source = 'Img/ibad-nobg.png';

async function processPhoto() {
  // Step 1: Read source and get metadata
  const original = sharp(source);
  const metadata = await original.metadata();
  console.log(`📂 Source: ${metadata.width}x${metadata.height}, hasAlpha: ${metadata.hasAlpha}`);

  // Step 2: Trim transparent margins
  const trimmed = await original.trim({ threshold: 10 }).toBuffer();
  const trimmedMeta = await sharp(trimmed).metadata();
  console.log(`   After trim: ${trimmedMeta.width}x${trimmedMeta.height}`);

  // Step 3: Add small headroom at top (3%)
  const headroom = Math.round(trimmedMeta.height * 0.03);
  const withHeadroom = await sharp(trimmed)
    .extend({
      top: headroom,
      bottom: 0,
      left: 0,
      right: 0,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toBuffer();

  const headroomMeta = await sharp(withHeadroom).metadata();
  console.log(`   With headroom: ${headroomMeta.width}x${headroomMeta.height}`);

  // Step 4: Create properly sized versions
  // Target: 3:4 aspect ratio at 800px width = 800x1067
  const targetWidth = 800;
  const targetHeight = 1067; // 3:4 ratio matching original ibad-800.webp

  // Scale figure to fit within canvas
  const scale = Math.min(targetWidth / headroomMeta.width, targetHeight / headroomMeta.height);
  const scaledWidth = Math.round(headroomMeta.width * scale);
  const scaledHeight = Math.round(headroomMeta.height * scale);

  const resized = await sharp(withHeadroom)
    .resize(scaledWidth, scaledHeight, {
      fit: 'inside',
      kernel: 'lanczos3',
      withoutEnlargement: false
    })
    .toBuffer();

  console.log(`   Figure scaled: ${scaledWidth}x${scaledHeight}`);

  // Create canvas and center the figure horizontally, bottom-align vertically
  const leftOffset = Math.round((targetWidth - scaledWidth) / 2);
  const topOffset = targetHeight - scaledHeight; // bottom-aligned

  console.log(`   Canvas: ${targetWidth}x${targetHeight}, figure at (${leftOffset}, ${topOffset})`);

  // Create transparent canvas using PNG
  const canvas = await sharp({
    create: {
      width: targetWidth,
      height: targetHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .png()
    .toBuffer();

  // Composite figure onto canvas
  const composited = await sharp(canvas)
    .composite([{
      input: resized,
      top: topOffset,
      left: leftOffset
    }])
    .toBuffer();

  // Save 800px version as webp
  const result800 = await sharp(composited)
    .webp({
      quality: 85,
      alphaQuality: 100,
      effort: 6,
      smartSubsample: true
    })
    .toFile('Img/ibad-new-800.webp');

  console.log(`\n   ✅ ibad-new-800.webp: ${result800.width}x${result800.height}, ${(result800.size / 1024).toFixed(1)}KB`);

  // Also back up old file and replace ibad-800.webp
  const fs = await import('fs');
  if (fs.existsSync('Img/ibad-800-backup.webp')) {
    console.log('   Backup already exists, skipping...');
  } else {
    fs.copyFileSync('Img/ibad-800.webp', 'Img/ibad-800-backup.webp');
    console.log('   📦 Backed up old ibad-800.webp -> ibad-800-backup.webp');
  }

  // Copy new file over old
  fs.copyFileSync('Img/ibad-new-800.webp', 'Img/ibad-800.webp');
  console.log('   📦 Replaced ibad-800.webp with new photo');

  console.log('\n✨ Done!');
}

processPhoto().catch(console.error);
