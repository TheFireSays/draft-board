import { readFile, writeFile } from "node:fs/promises";

const SOURCE_FILE = new URL("../auction-draft-board.jsx", import.meta.url);
const OUTPUT_FILE = new URL("../player-projections.json", import.meta.url);
const ESPN_PAGE_URL = "https://fantasy.espn.com/football/players/projections";
const ESPN_CHEATSHEET_URL = "https://g.espncdn.com/s/ffldraftkit/26/NFL26_CS_PPR300.pdf?adddata=2026CS_PPR300";
const ESPN_DST_URL = "https://www.espn.com/fantasy/football/story/_/page/FFPreseasonRank26DST/nfl-fantasy-football-draft-rankings-2026-dst-defense";
const FANTASYPROS_URL = "https://www.fantasypros.com/nfl/rankings/consensus-cheatsheets.php";
const YAHOO_URL = "https://sports.yahoo.com/fantasy/article/fantasy-football-rankings-consensus-top-300-drafts-160643679.html";
const ESPN_API_URL = "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2026/segments/0/leaguedefaults/3?view=kona_player_info";
const ESPN_TEAMS_API_URL = "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2026?view=proTeamSchedules_wl";
const ESPN_HEADSHOT_ROOT = "https://a.espncdn.com/i/headshots/nfl/players/full";
const ESPN_TEAM_LOGO_ROOT = "https://a.espncdn.com/i/teamlogos/nfl/500";
const SEASON = 2026;
const POSITION_BY_ESPN_ID = { 1: "QB", 2: "RB", 3: "WR", 4: "TE", 5: "K", 16: "DEF" };
const POSITION_ORDER = { QB: 0, RB: 1, WR: 2, TE: 3, K: 4, DEF: 5 };
const REFERENCE_PLAYER_TEAMS = new Map([
  ["James Conner", "ARI"],
  ["Jaydon Blue", "PHI"],
  ["Adam Randall", "BAL"],
  ["Devin Singletary", "NYG"],
  ["Devin Neal", "NO"],
]);

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
const espnById = new Map(espnPlayers.map(player => [String(player.id), player]));
const teamsById = new Map(proTeams.map(team => [team.id, team]));
const projections = {};
let matchedPlayers = 0;
let projectedPlayers = 0;

let previousSnapshot = {};
try {
  previousSnapshot = JSON.parse(await readFile(OUTPUT_FILE, "utf8"));
} catch { /* first snapshot */ }

const seasonProjectionFor = player => player?.stats?.find(stat =>
  stat.seasonId === SEASON &&
  stat.statSourceId === 1 &&
  stat.statSplitTypeId === 0
);
const projectedPointsFor = player => Number(seasonProjectionFor(player)?.appliedTotal || 0);
const boardNames = new Set(boardPlayers.map(player => {
  const normalized = normalizeName(player.name);
  return NAME_ALIASES.get(normalized) || normalized;
}));
const currentSupplementalPlayers = espnPlayers
  .filter(player => POSITION_BY_ESPN_ID[player.defaultPositionId])
  .filter(player => projectedPointsFor(player) > 0 || REFERENCE_PLAYER_TEAMS.has(player.fullName))
  .filter(player => !boardNames.has(normalizeName(player.fullName)))
  .map(player => {
    const pos = POSITION_BY_ESPN_ID[player.defaultPositionId];
    const proTeam = teamsById.get(player.proTeamId);
    const name = pos === "DEF" ? player.fullName.replace(/\s+D\/ST$/i, "") : player.fullName;
    const referenceTeam = REFERENCE_PLAYER_TEAMS.get(player.fullName);
    return {
      id: `E-${player.id}`,
      espnPlayerId: player.id,
      name,
      team: referenceTeam || proTeam?.abbrev || "FA",
      pos,
      rank: Number(player.draftRanksByRankType?.PPR?.rank || 0) || 9999,
      ...(referenceTeam ? { referenceSource: "2026 consensus top 300" } : {}),
    };
  });
const supplementalById = new Map(currentSupplementalPlayers.map(player => [player.id, player]));
for (const previousPlayer of previousSnapshot.supplementalPlayers || []) {
  if (!supplementalById.has(previousPlayer.id) && !boardNames.has(normalizeName(previousPlayer.name))) {
    supplementalById.set(previousPlayer.id, previousPlayer);
  }
}
const supplementalPlayers = [...supplementalById.values()].sort((a, b) =>
  POSITION_ORDER[a.pos] - POSITION_ORDER[b.pos] || a.rank - b.rank || a.name.localeCompare(b.name)
);

function projectionFor(boardPlayer, espnPlayer) {
  if (!espnPlayer) return { hasProjection: false, teamAbbrev: boardPlayer.team };
  const proTeam = teamsById.get(espnPlayer.proTeamId);
  const teamAbbrev = boardPlayer.referenceSource ? boardPlayer.team : proTeam?.abbrev || boardPlayer.team;
  const teamName = boardPlayer.referenceSource ? teamAbbrev : proTeam ? `${proTeam.location} ${proTeam.name}`.trim() : teamAbbrev;
  const projectedPoints = projectedPointsFor(espnPlayer);
  const hasProjection = projectedPoints > 0;
  const rawPprRank = Number(espnPlayer.draftRanksByRankType?.PPR?.rank || 0);
  return {
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

for (const boardPlayer of boardPlayers) {
  const normalized = normalizeName(boardPlayer.name);
  const espnPlayer = espnByName.get(NAME_ALIASES.get(normalized) || normalized);
  if (!espnPlayer) {
    projections[boardPlayer.id] = { hasProjection: false, teamAbbrev: boardPlayer.team };
    continue;
  }

  matchedPlayers += 1;
  projections[boardPlayer.id] = projectionFor(boardPlayer, espnPlayer);
  if (projections[boardPlayer.id].hasProjection) projectedPlayers += 1;
}

for (const player of supplementalPlayers) {
  const espnPlayer = espnById.get(String(player.espnPlayerId));
  if (espnPlayer) {
    matchedPlayers += 1;
    projections[player.id] = projectionFor(player, espnPlayer);
  } else {
    projections[player.id] = previousSnapshot.players?.[player.id] || { hasProjection: false, teamAbbrev: player.team };
  }
  if (projections[player.id].hasProjection) projectedPlayers += 1;
}

const checkedPlayers = boardPlayers.length + supplementalPlayers.length;
const coverage = matchedPlayers / checkedPlayers;
if (coverage < 0.95 || projectedPlayers < 175) {
  throw new Error(`ESPN coverage was unexpectedly low (${matchedPlayers}/${checkedPlayers} matched, ${projectedPlayers} projected); existing snapshot was left unchanged`);
}

const snapshot = {
  updatedAt: new Date().toISOString(),
  provider: "ESPN",
  mediaProvider: "ESPN CDN",
  season: SEASON,
  scoringFormat: "PPR",
  sourceUrl: ESPN_PAGE_URL,
  referenceSources: [ESPN_CHEATSHEET_URL, ESPN_DST_URL, FANTASYPROS_URL, YAHOO_URL],
  checkedPlayers,
  matchedPlayers,
  projectedPlayers,
  supplementalPlayers,
  players: projections,
};

await writeFile(OUTPUT_FILE, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
console.log(`Saved ESPN projections for ${projectedPlayers}/${checkedPlayers} players (${matchedPlayers} ESPN matches; ${supplementalPlayers.length} supplemental players)`);
