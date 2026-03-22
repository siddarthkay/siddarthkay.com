import { writeFileSync } from 'fs';

const CLIENT_ID = process.env.WHOOP_CLIENT_ID;
const CLIENT_SECRET = process.env.WHOOP_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.WHOOP_REFRESH_TOKEN;

const TOKEN_URL = 'https://api.prod.whoop.com/oauth/oauth2/token';
const API_BASE = 'https://api.prod.whoop.com/developer';

async function refreshAccessToken() {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: REFRESH_TOKEN,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token refresh failed (${res.status}): ${text}`);
  }

  const data = await res.json();

  // Whoop may rotate the refresh token — persist the new one
  if (data.refresh_token && data.refresh_token !== REFRESH_TOKEN) {
    writeFileSync('.whoop-refresh-token', data.refresh_token);
    console.log('Refresh token rotated — will update secret.');
  }

  return data.access_token;
}

async function whoopGet(token, path, params = {}) {
  const url = new URL(`${API_BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API call ${path} failed (${res.status}): ${text}`);
  }

  return res.json();
}

async function main() {
  console.log('Refreshing access token...');
  const token = await refreshAccessToken();

  // Fetch recent cycles (last 7 days for trend data)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  console.log('Fetching cycles...');
  const cycles = await whoopGet(token, '/v2/cycle', {
    start: sevenDaysAgo,
    limit: '7',
  });

  console.log('Fetching recovery...');
  const recovery = await whoopGet(token, '/v2/recovery', {
    start: sevenDaysAgo,
    limit: '7',
  });

  console.log('Fetching sleep...');
  const sleep = await whoopGet(token, '/v2/activity/sleep', {
    start: sevenDaysAgo,
    limit: '7',
  });

  console.log('Fetching workouts...');
  const workouts = await whoopGet(token, '/v2/activity/workout', {
    start: sevenDaysAgo,
    limit: '10',
  });

  // Build the output — only include what the frontend needs
  // No PII, no user IDs, just the scores
  const latestRecovery = recovery.records?.[0];
  const latestSleep = sleep.records?.[0];
  const latestCycle = cycles.records?.[0];

  const output = {
    updated_at: new Date().toISOString(),

    // Latest snapshot — what shows on the site
    latest: {
      recovery_score: latestRecovery?.score?.recovery_score ?? null,
      hrv_rmssd_milli: latestRecovery?.score?.hrv_rmssd_milli ?? null,
      resting_heart_rate: latestRecovery?.score?.resting_heart_rate ?? null,
      spo2_percentage: latestRecovery?.score?.spo2_percentage ?? null,
      skin_temp_celsius: latestRecovery?.score?.skin_temp_celsius ?? null,

      sleep_performance_percentage: latestSleep?.score?.sleep_performance_percentage ?? null,
      sleep_efficiency_percentage: latestSleep?.score?.sleep_efficiency_percentage ?? null,
      total_sleep_hours: latestSleep?.score?.stage_summary
        ? +(
            (latestSleep.score.stage_summary.total_in_bed_time_milli -
              latestSleep.score.stage_summary.total_awake_time_milli) /
            3600000
          ).toFixed(1)
        : null,
      respiratory_rate: latestSleep?.score?.respiratory_rate
        ? +latestSleep.score.respiratory_rate.toFixed(1)
        : null,

      day_strain: latestCycle?.score?.strain ? +latestCycle.score.strain.toFixed(1) : null,
      day_avg_hr: latestCycle?.score?.average_heart_rate ?? null,
      day_max_hr: latestCycle?.score?.max_heart_rate ?? null,
      day_kilojoules: latestCycle?.score?.kilojoule
        ? Math.round(latestCycle.score.kilojoule)
        : null,
    },

    // 7-day trend data — for a sparkline or mini chart
    trends: {
      recovery: recovery.records
        ?.filter((r) => r.score_state === 'SCORED')
        .map((r) => ({
          date: r.created_at?.split('T')[0],
          score: r.score?.recovery_score ?? null,
          hrv: r.score?.hrv_rmssd_milli ? +r.score.hrv_rmssd_milli.toFixed(1) : null,
          rhr: r.score?.resting_heart_rate ?? null,
        }))
        .reverse(),

      strain: cycles.records
        ?.filter((c) => c.score_state === 'SCORED')
        .map((c) => ({
          date: c.start?.split('T')[0],
          strain: c.score?.strain ? +c.score.strain.toFixed(1) : null,
        }))
        .reverse(),

      sleep: sleep.records
        ?.filter((s) => s.score_state === 'SCORED' && !s.nap)
        .map((s) => ({
          date: s.start?.split('T')[0],
          performance: s.score?.sleep_performance_percentage ?? null,
          hours: s.score?.stage_summary
            ? +(
                (s.score.stage_summary.total_in_bed_time_milli -
                  s.score.stage_summary.total_awake_time_milli) /
                3600000
              ).toFixed(1)
            : null,
        }))
        .reverse(),
    },

    // Recent workouts
    recent_workouts: workouts.records
      ?.filter((w) => w.score_state === 'SCORED')
      .slice(0, 5)
      .map((w) => ({
        date: w.start?.split('T')[0],
        sport: w.sport_name ?? 'unknown',
        strain: w.score?.strain ? +w.score.strain.toFixed(1) : null,
        calories_kcal: w.score?.kilojoule ? Math.round(w.score.kilojoule / 4.184) : null,
        avg_hr: w.score?.average_heart_rate ?? null,
        max_hr: w.score?.max_heart_rate ?? null,
        duration_min: w.start && w.end
          ? Math.round((new Date(w.end) - new Date(w.start)) / 60000)
          : null,
      })),
  };

  writeFileSync('src/data/whoop-data.json', JSON.stringify(output, null, 2));
  console.log('Wrote public/whoop-data.json');
  console.log(`Recovery: ${output.latest.recovery_score}% | HRV: ${output.latest.hrv_rmssd_milli}ms | Sleep: ${output.latest.total_sleep_hours}h`);
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
