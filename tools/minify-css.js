import fs from 'fs';
import { transform } from 'esbuild';

const inputFile = 'styles.css';
const outputFile = 'styles.min.css';

async function minifyCSS() {
  console.log('Reading', inputFile);
  const css = fs.readFileSync(inputFile, 'utf-8');
  
  console.log('Minifying...');
  const result = await transform(css, {
    loader: 'css',
    minify: true,
  });
  
  console.log('Writing', outputFile);
  fs.writeFileSync(outputFile, result.code);
  
  const originalSize = (fs.statSync(inputFile).size / 1024).toFixed(2);
  const minifiedSize = (fs.statSync(outputFile).size / 1024).toFixed(2);
  const savings = ((1 - minifiedSize / originalSize) * 100).toFixed(1);
  
  console.log('✓ Done!');
  console.log(`  Original:  ${originalSize} KB`);
  console.log(`  Minified:  ${minifiedSize} KB`);
  console.log(`  Savings:   ${savings}%`);
}

minifyCSS().catch(console.error);
