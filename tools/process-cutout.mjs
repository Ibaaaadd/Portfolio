import sharp from 'sharp';
import { readFileSync } from 'fs';

console.log('🖼️  Processing cutout images...\n');

const sourceFiles = [
  { src: 'Img/ibad-800.webp', out: 'Img/ibad-cutout-800.webp', width: 800 },
  { src: 'Img/ibad-400.webp', out: 'Img/ibad-cutout-400.webp', width: 400 }
];

for (const { src, out, width } of sourceFiles) {
  console.log(`📂 Processing: ${src}`);
  
  try {
    // Read original metadata
    const original = sharp(src);
    const metadata = await original.metadata();
    console.log(`   Original: ${metadata.width}x${metadata.height}, ${metadata.hasAlpha ? 'has alpha' : 'no alpha'}`);
    
    // Step 1: Trim transparent margins
    const trimmed = await original.trim({ threshold: 5 }).toBuffer();
    const trimmedMeta = await sharp(trimmed).metadata();
    console.log(`   After trim: ${trimmedMeta.width}x${trimmedMeta.height}`);
    
    // Step 2: Add 3% headroom at top (extend canvas)
    const headroom = Math.round(trimmedMeta.height * 0.03);
    const finalHeight = trimmedMeta.height + headroom;
    
    const withHeadroom = await sharp(trimmed)
      .extend({
        top: headroom,
        bottom: 0,
        left: 0,
        right: 0,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toBuffer();
    
    console.log(`   With headroom (+${headroom}px top): ${trimmedMeta.width}x${finalHeight}`);
    
    // Step 3: Resize to target width if needed, maintaining aspect ratio
    let processed = sharp(withHeadroom);
    const currentWidth = trimmedMeta.width;
    
    if (currentWidth !== width) {
      const targetHeight = Math.round(finalHeight * (width / currentWidth));
      processed = processed.resize(width, targetHeight, {
        fit: 'fill',
        kernel: 'lanczos3'
      });
      console.log(`   Resized to: ${width}x${targetHeight}`);
    }
    
    // Step 4: Check and fix halo (erode alpha slightly if needed)
    // We'll do a subtle alpha erosion to remove any white fringe
    processed = processed.modulate({ brightness: 1.0 });
    
    // Step 5: Save with optimized settings
    const result = await processed
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
