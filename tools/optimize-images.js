import sharp from 'sharp';
import { readdir, mkdir, copyFile, stat } from 'fs/promises';
import { join, basename, extname, dirname } from 'path';
import { existsSync } from 'fs';

const sizeBefore = {};
const sizeAfter = {};

async function ensureDir(dir) {
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

async function getFileSize(filePath) {
  const stats = await stat(filePath);
  return (stats.size / 1024).toFixed(2);
}

async function optimizeIbad() {
  console.log('\n=== Optimizing ibad.jpeg ===');
  const input = 'Img/ibad.jpeg';
  const output400 = 'Img/ibad-400.webp';
  const output800 = 'Img/ibad-800.webp';
  
  sizeBefore['ibad.jpeg'] = await getFileSize(input);
  
  await sharp(input)
    .resize(400, null, { withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(output400);
  
  await sharp(input)
    .resize(800, null, { withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(output800);
  
  sizeAfter['ibad-400.webp'] = await getFileSize(output400);
  sizeAfter['ibad-800.webp'] = await getFileSize(output800);
  
  console.log(`  Original: ${sizeBefore['ibad.jpeg']} KB`);
  console.log(`  400w: ${sizeAfter['ibad-400.webp']} KB`);
  console.log(`  800w: ${sizeAfter['ibad-800.webp']} KB`);
}

async function optimizeProjectImages() {
  console.log('\n=== Optimizing Project Thumbnails ===');
  const projectDir = 'Img/project';
  const files = await readdir(projectDir);
  
  for (const file of files) {
    const ext = extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;
    
    const inputPath = join(projectDir, file);
    const outputPath = join(projectDir, basename(file, ext) + '.webp');
    
    if (existsSync(outputPath)) {
      console.log(`  Skipping ${file} (WebP exists)`);
      continue;
    }
    
    sizeBefore[file] = await getFileSize(inputPath);
    
    await sharp(inputPath)
      .resize(1200, null, { withoutEnlargement: true, fit: 'inside' })
      .webp({ quality: 78 })
      .toFile(outputPath);
    
    sizeAfter[basename(file, ext) + '.webp'] = await getFileSize(outputPath);
    
    console.log(`  ${file}: ${sizeBefore[file]} KB → ${sizeAfter[basename(file, ext) + '.webp']} KB`);
  }
}

async function optimizeCertificates() {
  console.log('\n=== Optimizing Certificates ===');
  const certDir = 'Img/sertifikat';
  const files = await readdir(certDir);
  
  for (const file of files) {
    const ext = extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;
    
    const inputPath = join(certDir, file);
    const outputPath = join(certDir, basename(file, ext) + '.webp');
    
    if (existsSync(outputPath)) {
      console.log(`  Skipping ${file} (WebP exists)`);
      continue;
    }
    
    sizeBefore[file] = await getFileSize(inputPath);
    
    await sharp(inputPath)
      .resize(1000, null, { withoutEnlargement: true, fit: 'inside' })
      .webp({ quality: 80 })
      .toFile(outputPath);
    
    sizeAfter[basename(file, ext) + '.webp'] = await getFileSize(outputPath);
    
    console.log(`  ${file}: ${sizeBefore[file]} KB → ${sizeAfter[basename(file, ext) + '.webp']} KB`);
  }
}

async function moveToOriginals() {
  console.log('\n=== Moving Originals ===');
  await ensureDir('_originals/Img/project');
  await ensureDir('_originals/Img/sertifikat');
  await ensureDir('_originals/Img/tech');
  
  const filesToMove = [
    { src: 'Img/ibad.jpeg', dest: '_originals/Img/ibad.jpeg' },
  ];
  
  const projectFiles = await readdir('Img/project');
  for (const file of projectFiles) {
    const ext = extname(file).toLowerCase();
    if (['.jpg', '.jpeg', '.png'].includes(ext) && !file.endsWith('.webp')) {
      filesToMove.push({
        src: join('Img/project', file),
        dest: join('_originals/Img/project', file)
      });
    }
  }
  
  const certFiles = await readdir('Img/sertifikat');
  for (const file of certFiles) {
    const ext = extname(file).toLowerCase();
    if (['.jpg', '.jpeg', '.png'].includes(ext) && !file.endsWith('.webp')) {
      filesToMove.push({
        src: join('Img/sertifikat', file),
        dest: join('_originals/Img/sertifikat', file)
      });
    }
  }
  
  for (const { src, dest } of filesToMove) {
    if (existsSync(src)) {
      await ensureDir(dirname(dest));
      await copyFile(src, dest);
      console.log(`  Moved: ${src} → ${dest}`);
    }
  }
}

async function main() {
  try {
    console.log('🖼️  Image Optimization Started\n');
    
    await optimizeIbad();
    await optimizeProjectImages();
    await optimizeCertificates();
    
    console.log('\n=== Summary ===');
    let totalBefore = 0;
    let totalAfter = 0;
    
    Object.values(sizeBefore).forEach(size => totalBefore += parseFloat(size));
    Object.values(sizeAfter).forEach(size => totalAfter += parseFloat(size));
    
    console.log(`Total Before: ${totalBefore.toFixed(2)} KB`);
    console.log(`Total After: ${totalAfter.toFixed(2)} KB`);
    console.log(`Saved: ${(totalBefore - totalAfter).toFixed(2)} KB (${((1 - totalAfter/totalBefore) * 100).toFixed(1)}%)`);
    
    await moveToOriginals();
    
    console.log('\n✅ Optimization Complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
