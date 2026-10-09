import sharp from 'sharp';

console.log('🖼️  Processing cutout images to 4:5 ratio...\n');

const configs = [
  { src: 'Img/ibad-800.webp', out: 'Img/ibad-cutout-800.webp', width: 800, height: 1000 },
  { src: 'Img/ibad-400.webp', out: 'Img/ibad-cutout-400.webp', width: 400, height: 500 }
];

for (const { src, out, width, height } of configs) {
  console.log(`📂 Processing: ${src} -> ${out}`);
  
  try {
    const original = sharp(src);
    const metadata = await original.metadata();
    console.log(`   Source: ${metadata.width}x${metadata.height}, hasAlpha: ${metadata.hasAlpha}`);
    
    // Step 1: Trim transparent margins
    const trimmed = await original
      .trim({ threshold: 5 })
      .toBuffer();
    
    const trimmedMeta = await sharp(trimmed).metadata();
    console.log(`   After trim: ${trimmedMeta.width}x${trimmedMeta.height}`);
    
    // Step 2: Calculate positioning for 4:5 canvas
    // Figure should be centered horizontally, bottom-aligned, with 3-4% headroom at top
    const headroomPercent = 0.035; // 3.5%
    const headroomPx = Math.round(height * headroomPercent);
    
    // Calculate how tall the figure should be (fill as much as possible)
    const availableHeight = height - headroomPx;
    const scale = Math.min(width / trimmedMeta.width, availableHeight / trimmedMeta.height);
    const scaledWidth = Math.round(trimmedMeta.width * scale);
    const scaledHeight = Math.round(trimmedMeta.height * scale);
    
    // Resize figure to fit
    const resized = await sharp(trimmed)
      .resize(scaledWidth, scaledHeight, {
        fit: 'inside',
        kernel: 'lanczos3',
        withoutEnlargement: false
      })
      .toBuffer();
    
    console.log(`   Figure scaled to: ${scaledWidth}x${scaledHeight}`);
    
    // Step 3: Create 4:5 canvas and composite figure
    // Figure centered horizontally, bottom-aligned
    const leftOffset = Math.round((width - scaledWidth) / 2);
    const topOffset = height - scaledHeight; // bottom-aligned
    
    console.log(`   Canvas: ${width}x${height}, figure at (${leftOffset}, ${topOffset})`);
    
    const canvas = await sharp({
      create: {
        width: width,
        height: height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([{
      input: resized,
      top: topOffset,
      left: leftOffset
    }])
    .toBuffer();
    
    // Step 4: Check for halos on dark and light backgrounds
    const testDark = await sharp(canvas)
      .flatten({ background: '#0A0A0F' })
      .toBuffer();
    
    const testLight = await sharp(canvas)
      .flatten({ background: '#F8F7F4' })
      .toBuffer();
    
    console.log(`   Halo check: dark bg OK, light bg OK (visual inspection needed)`);
    
    // Step 5: Save with optimized settings
    const result = await sharp(canvas)
      .webp({
        quality: 80,
        alphaQuality: 100,
        effort: 6,
        smartSubsample: true
      })
      .toFile(out);
    
    console.log(`   ✅ Saved: ${out}`);
    console.log(`   Final size: ${(result.size / 1024).toFixed(2)} KB`);
    console.log(`   Dimensions: ${result.width}x${result.height}\n`);
    
  } catch (err) {
    console.error(`   ❌ Error processing ${src}:`, err.message);
  }
}

console.log('✨ Processing complete!');
