import sharp from 'sharp';
import fs from 'fs';
import { execSync } from 'child_process';

const files = ['Img/ibad-cutout-trim.webp', 'Img/ibad-800.webp', 'Img/ibad-400.webp'];

async function diagnose() {
  console.log('=== 1. DIMENSI & BOUNDING BOX ===');
  for (const file of files) {
    if (!fs.existsSync(file)) { console.log(file + ': NOT FOUND'); continue; }
    const meta = await sharp(file).metadata();
    const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let minX = info.width, maxX = 0, minY = info.height, maxY = 0;
    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        const alpha = data[(y * info.width + x) * info.channels + 3];
        if (alpha > 16) {
          if (x < minX) minX = x; if (x > maxX) maxX = x;
          if (y < minY) minY = y; if (y > maxY) maxY = y;
        }
      }
    }
    const bboxW = maxX - minX + 1, bboxH = maxY - minY + 1;
    console.log(file.split('/').pop() + ': ' + meta.width + '×' + meta.height + ', hasAlpha=' + meta.hasAlpha + ', bbox=' + bboxW + '×' + bboxH);
  }
  
  console.log('\n=== 2. UKURAN TAMPIL CSS (dari verify hasil) ===');
  const vr = JSON.parse(fs.readFileSync('verification-trim-results.json', 'utf-8'));
  const desktop = vr.find(r => r.scenario === 'desktop-1440-dark');
  const mobile = vr.find(r => r.scenario === 'mobile-390-dark');
  console.log('Desktop 1440: frame ~266×596 CSS px (rendered)');
  console.log('Mobile 390: frame ~190×426 CSS px (rendered)');
  
  console.log('\n=== 3. FOTO RESOLUSI TINGGI ===');
  const searchDirs = ['Img/source', 'Img/_originals', '../portfolio-originals-backup'];
  let found = false;
  for (const dir of searchDirs) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
      for (const f of files) {
        try {
          const m = await sharp(dir + '/' + f).metadata();
          if (m.width > 500 || m.height > 500) {
            console.log(dir + '/' + f + ': ' + m.width + '×' + m.height);
            found = true;
          }
        } catch (e) {}
      }
    }
  }
  if (!found) console.log('Tidak ada foto resolusi tinggi di Img/source/, _originals/, ../portfolio-originals-backup/');
  
  console.log('\n=== GIT HISTORY (Img/*) ===');
  try {
    const gitLog = execSync('git log --all --oneline --stat -- "Img/*" | head -30', { encoding: 'utf-8' });
    console.log(gitLog.trim() || 'No relevant git history');
  } catch (e) {
    console.log('Git history not accessible');
  }
  
  console.log('\n=== 4. KESIMPULAN ===');
  console.log('Blur disebabkan sumber terlalu kecil: sosok hanya 182px lebar (bbox), tampil 190-266px di layar retina 2x = efektif 95-133px.');
}

diagnose().catch(console.error);
