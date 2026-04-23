import cron from 'node-cron';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// ─── Start web server as child process ────────────────────────
const server = spawn('node', ['dist/index.js'], {
  cwd: projectRoot,
  stdio: 'inherit',
  env: { ...process.env }
});

server.on('exit', (code) => {
  console.error(`[cron-wrapper] Server exited with code ${code}`);
  process.exit(code ?? 1);
});

process.on('SIGTERM', () => {
  console.log('[cron-wrapper] SIGTERM received — shutting down');
  server.kill('SIGTERM');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[cron-wrapper] SIGINT received — shutting down');
  server.kill('SIGINT');
  process.exit(0);
});

// ─── Only register crons if AUTO_GEN_ENABLED=true ─────────────
if (process.env.AUTO_GEN_ENABLED !== 'true') {
  console.log('[cron-wrapper] AUTO_GEN_ENABLED is not true — crons disabled');
} else {
  console.log('[cron-wrapper] Registering cron jobs');

  // Cron #1 — Generate new article Mon-Fri at 06:00 UTC
  cron.schedule('0 6 * * 1-5', async () => {
    console.log('[cron-1] Triggering article generation');
    try {
      const { generateNewArticle } = await import('../src/cron/generate-article.mjs');
      await generateNewArticle();
    } catch (err) {
      console.error('[cron-1] Error:', err.message);
    }
  });

  // Cron #2 — Product spotlight article Saturdays at 08:00 UTC
  cron.schedule('0 8 * * 6', async () => {
    console.log('[cron-2] Triggering product spotlight');
    try {
      const { runProductSpotlight } = await import('../src/cron/product-spotlight.mjs');
      await runProductSpotlight();
    } catch (err) {
      console.error('[cron-2] Error:', err.message);
    }
  });

  // Cron #3 — Monthly refresh 1st of month at 03:00 UTC
  cron.schedule('0 3 1 * *', async () => {
    console.log('[cron-3] Triggering monthly refresh');
    try {
      const { refreshMonthly } = await import('../src/cron/refresh-monthly.mjs');
      await refreshMonthly();
    } catch (err) {
      console.error('[cron-3] Error:', err.message);
    }
  });

  // Cron #4 — Quarterly refresh Jan/Apr/Jul/Oct 1st at 04:00 UTC
  cron.schedule('0 4 1 1,4,7,10 *', async () => {
    console.log('[cron-4] Triggering quarterly refresh');
    try {
      const { refreshQuarterly } = await import('../src/cron/refresh-quarterly.mjs');
      await refreshQuarterly();
    } catch (err) {
      console.error('[cron-4] Error:', err.message);
    }
  });

  // Cron #5 — ASIN health check Sundays at 05:00 UTC
  cron.schedule('0 5 * * 0', async () => {
    console.log('[cron-5] Triggering ASIN health check');
    try {
      const { runAsinHealthCheck } = await import('../src/cron/asin-health-check.mjs');
      await runAsinHealthCheck();
    } catch (err) {
      console.error('[cron-5] Error:', err.message);
    }
  });

  console.log('[cron-wrapper] All 5 cron jobs registered');
}
