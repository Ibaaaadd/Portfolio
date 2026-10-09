import { chromium } from 'playwright';
import fs from 'fs';

const url = 'file://' + process.cwd().replace(/\\/g, '/') + '/index.html';

async function verify() {
  console.log('Launching browser...');
  const browser = await chromium.launch();
  
  const scenarios = [
    { name: 'desktop-1440-dark', width: 1440, height: 900, theme: 'dark' },
    { name: 'desktop-1440-light', width: 1440, height: 900, theme: 'light' },
    { name: 'mobile-390-dark', width: 390, height: 844, theme: 'dark' },
    { name: 'mobile-390-light', width: 390, height: 844, theme: 'light' },
  ];
  
  const results = [];
  
  for (const scenario of scenarios) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing: ${scenario.name}`);
    console.log('='.repeat(60));
    
    const page = await browser.newPage({
      viewport: { width: scenario.width, height: scenario.height },
      deviceScaleFactor: 2,
    });
    
    await page.goto(url, { waitUntil: 'networkidle' });
    
    if (scenario.theme === 'light') {
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'light');
      });
      await page.waitForTimeout(300);
    }
    
    await page.evaluate(() => {
      const preloader = document.getElementById('preloader');
      if (preloader) preloader.style.display = 'none';
    });
    
    await page.evaluate(() => {
      const aboutSection = document.getElementById('about');
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'instant', block: 'center' });
      }
    });
    await page.waitForTimeout(500);
    
    const imgData = await page.evaluate(() => {
      const img = document.querySelector('.about-photo-frame img');
      if (!img) return null;
      
      return {
        src: img.currentSrc || img.src,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        clientWidth: img.clientWidth,
        clientHeight: img.clientHeight,
        naturalRatio: (img.naturalWidth / img.naturalHeight).toFixed(4),
        renderedRatio: (img.clientWidth / img.clientHeight).toFixed(4),
      };
    });
    
    if (imgData) {
      const ratioDiff = Math.abs(parseFloat(imgData.naturalRatio) - parseFloat(imgData.renderedRatio));
      const ratioDiffPct = (ratioDiff / parseFloat(imgData.naturalRatio) * 100).toFixed(2);
      
      console.log('Current Src:', imgData.src.split('/').pop());
      console.log('Natural:', imgData.naturalWidth, 'x', imgData.naturalHeight, '→', imgData.naturalRatio);
      console.log('Rendered:', imgData.clientWidth, 'x', imgData.clientHeight, '→', imgData.renderedRatio);
      console.log('Ratio Diff:', ratioDiffPct + '%', ratioDiffPct < 1 ? '✓ PASS' : '✗ FAIL');
      
      results.push({
        scenario: scenario.name,
        currentSrc: imgData.src.split('/').pop(),
        naturalRatio: imgData.naturalRatio,
        renderedRatio: imgData.renderedRatio,
        ratioDiffPct: ratioDiffPct,
        pass: ratioDiffPct < 1,
      });
    }
    
    const screenshotPath = `verification-${scenario.name}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log('Screenshot:', screenshotPath);
    
    await page.close();
  }
  
  await browser.close();
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('VERIFICATION SUMMARY');
  console.log('='.repeat(60));
  
  const allPassed = results.every(r => r.pass);
  results.forEach(r => {
    const status = r.pass ? '✓' : '✗';
    console.log(`${status} ${r.scenario}: ${r.ratioDiffPct}% diff`);
  });
  
  console.log('\n' + (allPassed ? '✓ ALL TESTS PASSED' : '✗ SOME TESTS FAILED'));
  
  fs.writeFileSync('verification-results.json', JSON.stringify(results, null, 2));
}

verify().catch(console.error);
