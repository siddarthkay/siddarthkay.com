import { readFileSync, writeFileSync } from 'fs';

const API_KEY = process.env.STEAM_API_KEY;
const STEAM_ID = '76561199089424506';
const API_BASE = 'https://api.steampowered.com';

async function main() {
  if (!API_KEY) {
    throw new Error('STEAM_API_KEY environment variable is required');
  }

  console.log('Fetching recently played games...');
  const res = await fetch(
    `${API_BASE}/IPlayerService/GetRecentlyPlayedGames/v1/?key=${API_KEY}&steamid=${STEAM_ID}&format=json`
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Steam API failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  const games = data.response?.games ?? [];

  console.log(`Found ${games.length} recently played games`);

  // Also fetch full owned games for total playtime (GetRecentlyPlayedGames only gives 2-week playtime)
  console.log('Fetching owned games for total playtime...');
  const ownedRes = await fetch(
    `${API_BASE}/IPlayerService/GetOwnedGames/v1/?key=${API_KEY}&steamid=${STEAM_ID}&include_appinfo=1&format=json`
  );

  let ownedMap = {};
  if (ownedRes.ok) {
    const ownedData = await ownedRes.json();
    for (const g of ownedData.response?.games ?? []) {
      ownedMap[g.appid] = g;
    }
  }

  const output = {
    updated_at: new Date().toISOString(),
    games: games.map((g) => {
      const owned = ownedMap[g.appid];
      const totalMinutes = owned?.playtime_forever ?? g.playtime_forever ?? 0;
      const totalHours = Math.round(totalMinutes / 60);

      return {
        appid: g.appid,
        name: g.name,
        hours: totalHours + 'h total',
        playtime_2weeks_hours: Math.round((g.playtime_2weeks ?? 0) / 60),
      };
    }),
  };

  // Validate before overwriting — don't corrupt existing data with empty responses
  const dataPath = 'src/data/steam-data.json';

  if (output.games.length === 0) {
    console.warn('Steam API returned no games. Keeping existing data.');
    process.exit(0);
  }

  try {
    const existing = JSON.parse(readFileSync(dataPath, 'utf-8'));
    if (existing.games?.length > 0 && output.games.length === 0) {
      console.warn('New data has zero games but existing data has some. Keeping existing data.');
      process.exit(0);
    }
  } catch {
    // No existing file — safe to write
  }

  writeFileSync(dataPath, JSON.stringify(output, null, 2));
  console.log('Wrote src/data/steam-data.json');
  for (const g of output.games) {
    console.log(`  ${g.name}: ${g.hours}`);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
