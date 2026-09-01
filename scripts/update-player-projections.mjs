import { readFile, writeFile } from "node:fs/promises";

const SOURCE_FILE = new URL("../auction-draft-board.jsx", import.meta.url);
const OUTPUT_FILE = new URL("../player-projections.json", import.meta.url);
const ESPN_PAGE_URL = "https://fantasy.espn.com/football/players/projections";
const ESPN_API_URL = "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2026/segments/0/leaguedefaults/3?view=kona_player_info";
const ESPN_TEAMS_API_URL = "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2026?view=proTeamSchedules_wl";
const ESPN_HEADSHOT_ROOT = "https://a.espncdn.com/i/headshots/nfl/players/full";
const ESPN_TEAM_LOGO_ROOT = "https://a.espncdn.com/i/teamlogos/nfl/500";
const SEASON = 2026;

const NAME_ALIASES = new Map([
  ["marquisebrown", "hollywoodbrown"],
  ["chigoziemokonkwo", "chigokonkwo"],
]);

const normalizeName = (value = "") => value
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/\bd\s*\/\s*st\b/g, "")
  .replace(/\b(jr|sr|ii|iii|iv)\b/g, "")
  .replace(/[^a-z0-9]/g, "");

function readPlayers(source) {
  const raw = source.match(/const RAW = \{([\s\S]*?)\n\};/)?.[1];
  if (!raw) throw new Error("Could not find the RAW player list");
  const players = [];
  for (const line of raw.split("\n")) {
    const match = line.match(/^\s*(QB|RB|WR|TE|K|DEF):\s*"([^"]*)"/);
    if (!match) continue;
    const [, pos, list] = match;
    list.split(",").forEach((entry, index) => {
      const [name, team] = entry.split("|");
      players.push({ id: `${pos}-${index}`, name, team, pos });
    });
  }
  return players;
}

const fantasyFilter = {
  players: {
    filterStatsForExternalIds: { value: [String(SEASON)] },
    filterStatsForSourceIds: { value: [1] },
    sortDraftRanks: { sortPriority: 100, sortAsc: true, value: "PPR" },
    limit: 2000,
    offset: 0,
  },
};

const requestOptions = {
  headers: {
    accept: "application/json",
    "user-agent": "Load's Draft-o-matic personal projections snapshot/1.0",
    "x-fantasy-filter": JSON.stringify(fantasyFilter),
  },
  signal: AbortSignal.timeout(120000),
};
const [response, teamsResponse] = await Promise.all([
  fetch(ESPN_API_URL, requestOptions),
  fetch(ESPN_TEAMS_API_URL, {
    headers: { accept: "application/json", "user-agent": requestOptions.headers["user-agent"] },
    signal: AbortSignal.timeout(120000),
  }),
]);
if (!response.ok) throw new Error(`ESPN projection request failed: HTTP ${response.status}`);
if (!teamsResponse.ok) throw new Error(`ESPN team request failed: HTTP ${teamsResponse.status}`);

const [payload, teamsPayload] = await Promise.all([response.json(), teamsResponse.json()]);
if (!Array.isArray(payload.players) || payload.players.length < 500) {
  throw new Error(`ESPN returned only ${payload.players?.length || 0} players; existing snapshot was left unchanged`);
}
const proTeams = teamsPayload.settings?.proTeams;
if (!Array.isArray(proTeams) || proTeams.length < 32) {
  throw new Error(`ESPN returned only ${proTeams?.length || 0} pro teams; existing snapshot was left unchanged`);
}

const source = await readFile(SOURCE_FILE, "utf8");
const boardPlayers = readPlayers(source);
const espnPlayers = payload.players.map(entry => entry.player).filter(Boolean);
const espnByName = new Map(espnPlayers.map(player => [normalizeName(player.fullName), player]));
const teamsById = new Map(proTeams.map(team => [team.id, team]));
const projections = {};
let matchedPlayers = 0;
let projectedPlayers = 0;

for (const boardPlayer of boardPlayers) {
  const normalized = normalizeName(boardPlayer.name);
  const espnPlayer = espnByName.get(NAME_ALIASES.get(normalized) || normalized);
  if (!espnPlayer) {
    projections[boardPlayer.id] = { hasProjection: false, teamAbbrev: boardPlayer.team };
    continue;
  }

  matchedPlayers += 1;
  const proTeam = teamsById.get(espnPlayer.proTeamId);
  const teamAbbrev = proTeam?.abbrev || boardPlayer.team;
  const teamName = proTeam ? `${proTeam.location} ${proTeam.name}`.trim() : teamAbbrev;
  const seasonProjection = espnPlayer.stats?.find(stat =>
    stat.seasonId === SEASON &&
    stat.statSourceId === 1 &&
    stat.statSplitTypeId === 0
  );
  const projectedPoints = Number(seasonProjection?.appliedTotal || 0);
  const hasProjection = projectedPoints > 0;
  const rawPprRank = Number(espnPlayer.draftRanksByRankType?.PPR?.rank || 0);
  if (hasProjection) projectedPlayers += 1;

  projections[boardPlayer.id] = {
    espnPlayerId: espnPlayer.id,
    hasProjection,
    teamAbbrev,
    teamName,
    ...(boardPlayer.pos === "DEF"
      ? { teamLogoUrl: `${ESPN_TEAM_LOGO_ROOT}/${teamAbbrev.toLowerCase()}.png` }
      : { headshotUrl: `${ESPN_HEADSHOT_ROOT}/${espnPlayer.id}.png` }),
    ...(hasProjection ? {
      pprRank: rawPprRank > 0 && rawPprRank < 1000 ? rawPprRank : null,
      projectedPoints: Math.round(projectedPoints * 10) / 10,
      adp: Math.round(Number(espnPlayer.ownership?.averageDraftPosition || 0) * 10) / 10 || null,
    } : {}),
  };
}

const coverage = matchedPlayers / boardPlayers.length;
if (coverage < 0.95 || projectedPlayers < 175) {
  throw new Error(`ESPN coverage was unexpectedly low (${matchedPlayers}/${boardPlayers.length} matched, ${projectedPlayers} projected); existing snapshot was left unchanged`);
}

const snapshot = {
  updatedAt: new Date().toISOString(),
  provider: "ESPN",
  mediaProvider: "ESPN CDN",
  season: SEASON,
  scoringFormat: "PPR",
  sourceUrl: ESPN_PAGE_URL,
  checkedPlayers: boardPlayers.length,
  matchedPlayers,
  projectedPlayers,
  players: projections,
};

await writeFile(OUTPUT_FILE, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
console.log(`Saved ESPN projections for ${projectedPlayers}/${boardPlayers.length} players (${matchedPlayers} name matches)`);
