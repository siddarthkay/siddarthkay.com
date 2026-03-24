import { readFileSync, writeFileSync } from 'fs';

const CLIENT_ID = process.env.WHOOP_CLIENT_ID;
const CLIENT_SECRET = process.env.WHOOP_CLIENT_SECRET;
let currentRefreshToken = process.env.WHOOP_REFRESH_TOKEN;

const TOKEN_URL = 'https://api.prod.whoop.com/oauth/oauth2/token';
const API_BASE = 'https://api.prod.whoop.com/developer';

async function refreshAccessToken() {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: currentRefreshToken,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: 'offline',
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token refresh failed (${res.status}): ${text}`);
  }

  const data = await res.json();

  // CRITICAL: persist the new refresh token IMMEDIATELY before doing anything else.
  // Whoop invalidates the old token the moment it issues a new one.
  // If we crash after this point but before saving, the token is lost forever.
  if (data.refresh_token && data.refresh_token !== currentRefreshToken) {
    currentRefreshToken = data.refresh_token;
    writeFileSync('.whoop-refresh-token', data.refresh_token);
    console.log('Refresh token rotated - saved to .whoop-refresh-token');
  }

  return data.access_token;
}

async function respectRateLimit(res) {
  const remaining = res.headers.get('X-RateLimit-Remaining');
  const reset = res.headers.get('X-RateLimit-Reset');

  if (remaining !== null) {
    const remainingNum = parseInt(remaining, 10);
    if (remainingNum <= 5 && reset) {
      const waitSeconds = parseInt(reset, 10);
      if (waitSeconds > 0 && waitSeconds <= 120) {
        console.log(`Rate limit nearly exhausted (${remainingNum} remaining). Waiting ${waitSeconds}s...`);
        await new Promise((resolve) => setTimeout(resolve, waitSeconds * 1000));
      }
    }
  }
}

let accessToken = null;

async function whoopGet(path, params = {}) {
  const url = new URL(`${API_BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  let res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  // If we get a 401, try refreshing the token once and retry
  if (res.status === 401) {
    console.log(`Got 401 on ${path}, refreshing token and retrying...`);
    accessToken = await refreshAccessToken();
    res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API call ${path} failed (${res.status}): ${text}`);
  }

  await respectRateLimit(res);

  return res.json();
}

async function whoopGetAll(path, params = {}) {
  let allRecords = [];
  let nextToken = null;

  do {
    const queryParams = { ...params };
    if (nextToken) {
      queryParams.nextToken = nextToken;
    }

    const data = await whoopGet(path, queryParams);
    if (data.records) {
      allRecords = allRecords.concat(data.records);
    }
    nextToken = data.next_token || null;
  } while (nextToken);

  return { records: allRecords };
}

async function main() {
  console.log('Refreshing access token...');
  accessToken = await refreshAccessToken();

  // Fetch recent cycles (last 7 days for trend data)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  console.log('Fetching cycles...');
  const cycles = await whoopGetAll('/v2/cycle', {
    start: sevenDaysAgo,
  });

  console.log('Fetching recovery...');
  const recovery = await whoopGetAll('/v2/recovery', {
    start: sevenDaysAgo,
  });

  console.log('Fetching sleep...');
  const sleep = await whoopGetAll('/v2/activity/sleep', {
    start: sevenDaysAgo,
  });

  console.log('Fetching workouts...');
  const workouts = await whoopGetAll('/v2/activity/workout', {
    start: sevenDaysAgo,
  });

  // Build the output — only include what the frontend needs
  // No PII, no user IDs, just the scores
  const latestRecovery = recovery.records?.[0];
  // Filter out naps — only use main sleep for the latest snapshot
  const latestSleep = sleep.records?.find((s) => !s.nap && s.score_state === 'SCORED');
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

  // Validate before overwriting — don't corrupt existing data with empty responses
  const hasRecovery = output.trends.recovery?.length > 0;
  const hasSleep = output.trends.sleep?.length > 0;
  const hasStrain = output.trends.strain?.length > 0;

  if (!hasRecovery && !hasSleep && !hasStrain) {
    console.warn('Whoop API returned no scored data across all categories. Keeping existing data.');
    process.exit(0);
  }

  const dataPath = 'src/data/whoop-data.json';
  try {
    const existing = JSON.parse(readFileSync(dataPath, 'utf-8'));
    const existingTrendCount = (existing.trends?.recovery?.length ?? 0)
      + (existing.trends?.sleep?.length ?? 0)
      + (existing.trends?.strain?.length ?? 0);
    const newTrendCount = (output.trends.recovery?.length ?? 0)
      + (output.trends.sleep?.length ?? 0)
      + (output.trends.strain?.length ?? 0);

    if (existingTrendCount > 0 && newTrendCount === 0) {
      console.warn('New data has zero trends but existing data has some. Keeping existing data.');
      process.exit(0);
    }
  } catch {
    // No existing file — safe to write
  }

  writeFileSync(dataPath, JSON.stringify(output, null, 2));
  console.log('Wrote src/data/whoop-data.json');
  console.log(`Recovery: ${output.latest.recovery_score}% | HRV: ${output.latest.hrv_rmssd_milli}ms | Sleep: ${output.latest.total_sleep_hours}h`);
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
