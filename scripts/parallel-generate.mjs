import fs from 'fs';
import { spawn } from 'child_process';
import os from 'os';

const inputs = JSON.parse(fs.readFileSync('/tmp/map-inputs.json', 'utf8'));
const concurrency = os.cpus().length * 2; // e.g., 8 or 16
let active = 0;
let index = 0;
let completed = 0;
let failed = 0;

console.log(`Starting parallel generation of ${inputs.length} articles with concurrency ${concurrency}...`);

function next() {
  if (index >= inputs.length) {
    if (active === 0) {
      console.log(`\nDONE. Completed: ${completed}, Failed: ${failed}`);
      process.exit(0);
    }
    return;
  }

  const input = inputs[index++];
  active++;
  
  const slug = input.split('|||')[1];
  console.log(`[${index}/${inputs.length}] Starting: ${slug}`);

  const child = spawn('node', ['scripts/generate-single-article.mjs', input], {
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let output = '';
  child.stdout.on('data', d => output += d.toString());
  child.stderr.on('data', d => output += d.toString());

  child.on('close', code => {
    active--;
    if (code === 0 && output.includes('OK:')) {
      completed++;
      console.log(`[OK] ${slug}`);
    } else {
      failed++;
      console.log(`[FAIL] ${slug} - Code ${code}`);
      const lines = output.trim().split('\n');
      console.log(`  > ${lines[lines.length - 1]}`);
    }
    next();
  });
}

for (let i = 0; i < concurrency; i++) {
  next();
}
