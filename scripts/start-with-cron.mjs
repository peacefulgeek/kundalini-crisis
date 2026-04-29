/**
 * Production Entry Point — Server + Cron Wrapper
 *
 * Cron Schedule (per ADDENDUMSCOPENOCLAUDE.md Section 5 & 7):
 *
 * Cron #1 — Article Publisher (Phase-aware):
 *   Phase 1 (published < 60): 5x/day every day at 07:00, 10:00, 13:00, 16:00, 19:00 UTC
 *   Phase 2 (published >= 60): 1x/weekday Mon-Fri at 08:00 UTC
 *   Logic: checks queue first, publishes oldest queued article, or generates new one
 *
 * Cron #2 — Product Spotlight: Saturdays 08:00 UTC
 * Cron #3 — Monthly Refresh: 1st of month 03:00 UTC
 * Cron #4 — Quarterly Refresh: 1st of Jan/Apr/Jul/Oct 04:00 UTC
 * Cron #5 — ASIN Health Check: Sundays 05:00 UTC
 */
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

// ─── Phase-aware article publisher ────────────────────────────
async function runPhaseAwarePublisher() {
  try {
    const { countArticles } = await import('../src/lib/article-store.mjs');
    const counts = await countArticles();
    const publishedCount = counts.published;

    // Phase 2 check: if published >= 60 and it's not a weekday, skip
    if (publishedCount >= 60) {
      const day = new Date().getUTCDay(); // 0=Sun, 6=Sat
      if (day === 0 || day === 6) {
        console.log(`[cron-1] Phase 2 active (${publishedCount} published) — weekend, skipping`);
        return;
      }
    }

    console.log(`[cron-1] Phase ${publishedCount < 60 ? '1' : '2'} — ${publishedCount} published articles`);
    const { runArticlePublisher } = await import('../src/cron/generate-article.mjs');
    await runArticlePublisher();
  } catch (err) {
    console.error('[cron-1] Error:', err.message);
  }
}

// ─── Only register crons if AUTO_GEN_ENABLED=true ─────────────
if (process.env.AUTO_GEN_ENABLED !== 'true') {
  console.log('[cron-wrapper] AUTO_GEN_ENABLED is not true — crons disabled');
} else {
  console.log('[cron-wrapper] Registering 5 cron jobs (Phase 1/Phase 2 aware)');

  // Cron #1 — Article Publisher
  // Phase 1 (< 60 published): 5x/day every day at 07:00, 10:00, 13:00, 16:00, 19:00 UTC
  // Phase 2 (>= 60 published): fires every day at these times but skips weekends internally
  cron.schedule('0 7 * * *', () => {
    console.log('[cron-1] 07:00 UTC fire');
    runPhaseAwarePublisher();
  });

  cron.schedule('0 10 * * *', () => {
    console.log('[cron-1] 10:00 UTC fire');
    runPhaseAwarePublisher();
  });

  cron.schedule('0 13 * * *', () => {
    console.log('[cron-1] 13:00 UTC fire');
    runPhaseAwarePublisher();
  });

  cron.schedule('0 16 * * *', () => {
    console.log('[cron-1] 16:00 UTC fire');
    runPhaseAwarePublisher();
  });

  cron.schedule('0 19 * * *', () => {
    console.log('[cron-1] 19:00 UTC fire');
    runPhaseAwarePublisher();
  });

  // Cron #2 — Product spotlight Saturdays 08:00 UTC
  cron.schedule('0 8 * * 6', async () => {
    console.log('[cron-2] Product spotlight fire');
    try {
      const { runProductSpotlight } = await import('../src/cron/product-spotlight.mjs');
      await runProductSpotlight();
    } catch (err) {
      console.error('[cron-2] Error:', err.message);
    }
  });

  // Cron #3 — Monthly refresh 1st of month 03:00 UTC
  cron.schedule('0 3 1 * *', async () => {
    console.log('[cron-3] Monthly refresh fire');
    try {
      const { runMonthlyRefresh } = await import('../src/cron/refresh-monthly.mjs');
      await runMonthlyRefresh();
    } catch (err) {
      console.error('[cron-3] Error:', err.message);
    }
  });

  // Cron #4 — Quarterly refresh Jan/Apr/Jul/Oct 1st 04:00 UTC
  cron.schedule('0 4 1 1,4,7,10 *', async () => {
    console.log('[cron-4] Quarterly refresh fire');
    try {
      const { runQuarterlyRefresh } = await import('../src/cron/refresh-quarterly.mjs');
      await runQuarterlyRefresh();
    } catch (err) {
      console.error('[cron-4] Error:', err.message);
    }
  });

  // Cron #5 — ASIN health check Sundays 05:00 UTC
  cron.schedule('0 5 * * 0', async () => {
    console.log('[cron-5] ASIN health check fire');
    try {
      const { runAsinHealthCheck } = await import('../src/cron/asin-health-check.mjs');
      await runAsinHealthCheck();
    } catch (err) {
      console.error('[cron-5] Error:', err.message);
    }
  });

  console.log('[cron-wrapper] All 5 cron jobs registered');
  console.log('[cron-wrapper] Phase 1 (< 60 published): 5x/day every day');
  console.log('[cron-wrapper] Phase 2 (>= 60 published): 1x/weekday Mon-Fri');
}
