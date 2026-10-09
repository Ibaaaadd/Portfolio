import { chromium } from 'playwright';
import fs from 'fs';

const url = 'file://' + process.cwd().replace(/\\/g, '/') + '/index.html';

async function verifyTrimmedPhoto() {
  console.log('='.repeat(70));
  console.log('VERIFICATION: TRIMMED PHOTO ABOUT SECTION');
  console.log('='.repeat(70));
  
  const browser = await chromium.launch();
  
  const scenarios = [
    { name: 'desktop-1440-dark', width: 1440, height: 900, theme: 'dark' },
    { name: 'desktop-1440-light', width: 1440, height: 900, theme: 'light' },
    { name: 'mobile-375-dark', width: 375, height: 667, theme: 'dark' },
    { name: 'mobile-375-light', width: 375, height: 667, theme: 'light' },
    { name: 'mobile-390-dark', width: 390, height: 844, theme: 'dark' },
    { name: 'mobile-390-light', width: 390, height: 844, theme: 'light' },
  ];
  
  const results = [];
  
  for (const scenario of scenarios) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`Testing: ${scenario.name} (${scenario.width}×${scenario.height})`);
    console.log('='.repeat(70));
    
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
    
    const photoData = await page.evaluate(() => {
      const img = document.querySelector('.about-photo-frame img');
      const frame = document.querySelector('.about-photo-frame');
      
      if (!img || !frame) return null;
      
      const imgRect = img.getBoundingClientRect();
      const frameRect = frame.getBoundingClientRect();
      
      const headPositionPct = ((imgRect.top - frameRect.top) / frameRect.height * 100).toFixed(2);
      
      const naturalRatio = (img.naturalWidth / img.naturalHeight).toFixed(4);
      const renderedRatio = (img.clientWidth / img.clientHeight).toFixed(4);
      const ratioDiff = Math.abs(parseFloat(naturalRatio) - parseFloat(renderedRatio));
      const ratioDiffPct = (ratioDiff / parseFloat(naturalRatio) * 100).toFixed(2);
      
      const computedStyle = window.getComputedStyle(img);
      const hasBoxShadow = computedStyle.boxShadow !== 'none';
      const hasBorder = computedStyle.border !== '0px none rgb(250, 250, 250)' && 
                        computedStyle.border !== '0px none rgb(10, 10, 15)';
      
      return {
        src: img.currentSrc || img.src,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        clientWidth: img.clientWidth,
        clientHeight: img.clientHeight,
        naturalRatio,
        renderedRatio,
        ratioDiffPct: parseFloat(ratioDiffPct),
        headPositionPct: parseFloat(headPositionPct),
        hasBoxShadow,
        hasBorder,
        frameWidth: frameRect.width,
        frameHeight: frameRect.height,
      };
    });
    
    if (photoData) {
      console.log('\nImage Source:', photoData.src.split('/').pop());
      console.log('Natural:', photoData.naturalWidth, '×', photoData.naturalHeight, '→ ratio', photoData.naturalRatio);
      console.log('Rendered:', photoData.clientWidth, '×', photoData.clientHeight, '→ ratio', photoData.renderedRatio);
      console.log('Frame size:', Math.round(photoData.frameWidth), '×', Math.round(photoData.frameHeight));
      
      console.log('\n--- CHECKS ---');
      
      const headCheck = photoData.headPositionPct < 6;
      console.log(`Head position: ${photoData.headPositionPct}% from top`, headCheck ? '✓ PASS' : '✗ FAIL (must be <6%)');
      
      const ratioCheck = photoData.ratioDiffPct < 1;
      console.log(`Ratio diff: ${photoData.ratioDiffPct}%`, ratioCheck ? '✓ PASS' : '✗ FAIL (must be <1%)');
      
      const shadowCheck = !photoData.hasBoxShadow;
      console.log(`No box-shadow:`, shadowCheck ? '✓ PASS' : '✗ FAIL');
      
      const borderCheck = !photoData.hasBorder;
      console.log(`No border:`, borderCheck ? '✓ PASS' : '✗ FAIL');
      
      const allPassed = headCheck && ratioCheck && shadowCheck && borderCheck;
      
      results.push({
        scenario: scenario.name,
        currentSrc: photoData.src.split('/').pop(),
        headPositionPct: photoData.headPositionPct,
        ratioDiffPct: photoData.ratioDiffPct,
        headCheck,
        ratioCheck,
        shadowCheck,
        borderCheck,
        allPassed,
      });
    }
    
    const screenshotPath = `verification-trim-${scenario.name}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log('\nScreenshot:', screenshotPath);
    
    await page.close();
  }
  
  await browser.close();
  
  console.log(`\n${'='.repeat(70)}`);
  console.log('VERIFICATION SUMMARY');
  console.log('='.repeat(70));
  
  const allScenariosPassed = results.every(r => r.allPassed);
  
  results.forEach(r => {
    const status = r.allPassed ? '✓' : '✗';
    const issues = [];
    if (!r.headCheck) issues.push('head position');
    if (!r.ratioCheck) issues.push('ratio');
    if (!r.shadowCheck) issues.push('shadow');
    if (!r.borderCheck) issues.push('border');
    
    console.log(`${status} ${r.scenario}: ${r.allPassed ? 'ALL PASS' : 'FAIL: ' + issues.join(', ')}`);
  });
  
  console.log('\n' + (allScenariosPassed ? '✓ ALL SCENARIOS PASSED' : '✗ SOME SCENARIOS FAILED'));
  
  fs.writeFileSync('verification-trim-results.json', JSON.stringify(results, null, 2));
  console.log('\n✓ Results saved to: verification-trim-results.json');
}

verifyTrimmedPhoto().catch(console.error);
