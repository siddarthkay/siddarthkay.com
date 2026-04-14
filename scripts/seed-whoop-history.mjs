/**
 * One-off script: backfill whoop-history.json from git history.
 * Run once, then delete this file.
 *
 * Usage: node scripts/seed-whoop-history.mjs
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

const FILE = 'src/data/whoop-data.json';
const OUT = 'src/data/whoop-history.json';

// Get all commit hashes that touched the file (oldest first)
const commits = execSync(`git log --reverse --format="%H" -- ${FILE}`, { encoding: 'utf-8' })
  .trim()
  .split('\n')
  .filter(Boolean);

console.log(`Found ${commits.length} commits to process...`);

const history = {};
let processed = 0;

for (const hash of commits) {
  try {
    const raw = execSync(`git show ${hash}:${FILE}`, { encoding: 'utf-8' });
    const data = JSON.parse(raw);
    const date = data.updated_at?.split('T')[0];
    if (!date) continue;

    // Use latest snapshot for that date (later commits overwrite earlier ones)
    const L = data.latest;
    if (!L) continue;

    history[date] = {
      recovery_score: L.recovery_score ?? null,
      hrv_rmssd_milli: L.hrv_rmssd_milli ? +L.hrv_rmssd_milli.toFixed(1) : null,
      resting_heart_rate: L.resting_heart_rate ?? null,
      spo2_percentage: L.spo2_percentage ? +L.spo2_percentage.toFixed(1) : null,
      skin_temp_celsius: L.skin_temp_celsius ? +L.skin_temp_celsius.toFixed(3) : null,
      sleep_performance_percentage: L.sleep_performance_percentage ?? null,
      sleep_efficiency_percentage: L.sleep_efficiency_percentage ? +L.sleep_efficiency_percentage.toFixed(1) : null,
      total_sleep_hours: L.total_sleep_hours ?? null,
      respiratory_rate: L.respiratory_rate ?? null,
      day_strain: L.day_strain ?? null,
      day_avg_hr: L.day_avg_hr ?? null,
      day_max_hr: L.day_max_hr ?? null,
      day_kilojoules: L.day_kilojoules ?? null,
    };

    // Also pull any trend data to fill in days we might not have a direct snapshot for
    if (data.trends?.recovery) {
      for (const r of data.trends.recovery) {
        if (!r.date) continue;
        if (!history[r.date]) history[r.date] = {};
        if (r.score != null) history[r.date].recovery_score = r.score;
        if (r.hrv != null) history[r.date].hrv_rmssd_milli = +r.hrv.toFixed?.(1) ?? r.hrv;
        if (r.rhr != null) history[r.date].resting_heart_rate = r.rhr;
      }
    }

    if (data.trends?.strain) {
      for (const c of data.trends.strain) {
        if (!c.date) continue;
        if (!history[c.date]) history[c.date] = {};
        if (c.strain != null) history[c.date].day_strain = c.strain;
      }
    }

    if (data.trends?.sleep) {
      for (const s of data.trends.sleep) {
        if (!s.date) continue;
        if (!history[s.date]) history[s.date] = {};
        if (s.performance != null) history[s.date].sleep_performance_percentage = s.performance;
        if (s.hours != null) history[s.date].total_sleep_hours = s.hours;
      }
    }
  } catch {
    // skip commits where the file can't be parsed
  }

  processed++;
  if (processed % 50 === 0) {
    console.log(`  processed ${processed}/${commits.length}...`);
  }
}

// Sort by date
const sorted = Object.keys(history).sort().reduce((acc, key) => {
  acc[key] = history[key];
  return acc;
}, {});

writeFileSync(OUT, JSON.stringify(sorted, null, 2));
console.log(`Done. Wrote ${Object.keys(sorted).length} days to ${OUT}`);
