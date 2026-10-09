import sharp from 'sharp';

console.log('🖼️  Creating 4:5 ratio cutouts (simplified approach)...\n');

const tasks = [
  { src: 'Img/ibad-800.webp', out: 'Img/ibad-cutout-800.webp', w: 800, h: 1000 },
  { src: 'Img/ibad-400.webp', out: 'Img/ibad-cutout-400.webp', w: 400, h: 500 }
];

for (const { src, out, w, h } of tasks) {
  console.log(`📂 ${src} -> ${out}`);
  
  try {
    // Step 1: Read and trim
    const trimmed = await sharp(src).trim({ threshold: 5 }).toBuffer();
    const meta = await sharp(trimmed).metadata();
    console.log(`   Trimmed: ${meta.width}x${meta.height}`);
    
    // Step 2: Calculate scale to fit in 4:5 canvas with headroom
    const headroom = Math.round(h * 0.035); // 3.5% top space
    const maxHeight = h - headroom;
    const scale = Math.min(w / meta.width, maxHeight / meta.height);
    const newW = Math.round(meta.width * scale);
    const newH = Math.round(meta.height * scale);
    
    console.log(`   Scaled: ${newW}x${newH}`);
    
    // Step 3: Resize figure
    const resized = await sharp(trimmed)
      .resize(newW, newH, { fit: 'inside', kernel: 'lanczos3' })
      .toBuffer();
    
    // Step 4: Add padding to make 4:5 ratio (centered horizontally, bottom-aligned)
    const leftPad = Math.round((w - newW) / 2);
    const topPad = h - newH;
    
    console.log(`   Padding: left ${leftPad}px, top ${topPad}px`);
    
    // Step 5: Extend to final size
    await sharp(resized)
      .extend({
        top: topPad,
        bottom: 0,
        left: leftPad,
        right: w - newW - leftPad,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .webp({ quality: 80, alphaQuality: 100, effort: 6 })
      .toFile(out);
    
    const final = await sharp(out).metadata();
    const size = (await sharp(out).toBuffer()).length;
    console.log(`   ✅ Saved: ${final.width}x${final.height}, ${(size/1024).toFixed(2)} KB\n`);
    
  } catch (err) {
    console.error(`   ❌ Error: ${err.message}\n`);
  }
}

console.log('✨ Done!');
