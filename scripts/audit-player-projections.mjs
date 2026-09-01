import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../auction-draft-board.jsx", import.meta.url), "utf8");
const snapshot = JSON.parse(await readFile(new URL("../player-projections.json", import.meta.url), "utf8"));
const raw = source.match(/const RAW = \{([\s\S]*?)\n\};/)?.[1];
if (!raw) throw new Error("Could not find the RAW player list");

const players = new Map();
for (const line of raw.split("\n")) {
  const match = line.match(/^\s*(QB|RB|WR|TE|K|DEF):\s*"([^"]*)"/);
  if (!match) continue;
  const [, pos, list] = match;
  list.split(",").forEach((entry, index) => {
    const [name] = entry.split("|");
    players.set(`${pos}-${index}`, { name, pos });
  });
}

const errors = [];
if (snapshot.provider !== "ESPN") errors.push("provider is not ESPN");
if (snapshot.mediaProvider !== "ESPN CDN") errors.push("media provider is not ESPN CDN");
if (snapshot.season !== 2026) errors.push("projection season is not 2026");
if (snapshot.scoringFormat !== "PPR") errors.push("projection scoring format is not PPR");
if (snapshot.sourceUrl !== "https://fantasy.espn.com/football/players/projections") errors.push("unexpected ESPN source URL");
if (snapshot.checkedPlayers !== players.size) errors.push(`checkedPlayers ${snapshot.checkedPlayers} does not match board size ${players.size}`);
if (snapshot.matchedPlayers < Math.ceil(players.size * 0.95)) errors.push(`name coverage is too low: ${snapshot.matchedPlayers}/${players.size}`);
if (snapshot.projectedPlayers < 175) errors.push(`projection coverage is too low: ${snapshot.projectedPlayers}/${players.size}`);

for (const [id, projection] of Object.entries(snapshot.players || {})) {
  if (!players.has(id)) { errors.push(`${id}: unknown player id`); continue; }
  if (typeof projection.hasProjection !== "boolean") errors.push(`${id}: hasProjection is not boolean`);
  if (!projection.teamAbbrev) errors.push(`${id}: missing team abbreviation`);
  if (projection.espnPlayerId) {
    if (!projection.teamName) errors.push(`${id}: missing ESPN team name`);
    if (players.get(id).pos === "DEF") {
      if (!/^https:\/\/a\.espncdn\.com\/i\/teamlogos\/nfl\/500\/[a-z]+\.png$/.test(projection.teamLogoUrl || "")) errors.push(`${id}: invalid ESPN defense logo URL`);
    } else if (projection.headshotUrl !== `https://a.espncdn.com/i/headshots/nfl/players/full/${projection.espnPlayerId}.png`) {
      errors.push(`${id}: invalid ESPN headshot URL`);
    }
  }
  if (!projection.hasProjection) continue;
  if (!(projection.projectedPoints > 0 && projection.projectedPoints < 1000)) errors.push(`${id}: invalid projected points`);
  if (projection.pprRank !== null && !(projection.pprRank > 0 && projection.pprRank < 1000)) errors.push(`${id}: invalid PPR rank`);
  if (!(projection.adp > 0 && projection.adp <= 500)) errors.push(`${id}: invalid ADP`);
}

for (const id of players.keys()) {
  if (!snapshot.players?.[id]) errors.push(`${id}: missing projection status`);
}

for (const id of ["QB-0", "RB-1", "WR-0", "TE-0", "K-0", "DEF-0"]) {
  if (!snapshot.players?.[id]?.hasProjection) errors.push(`${id}: expected marquee projection is missing`);
}

console.log(`ESPN projection coverage: ${snapshot.projectedPlayers}/${players.size}; name matches: ${snapshot.matchedPlayers}/${players.size}`);
if (errors.length) {
  console.error(`Projection audit failed with ${errors.length} issue(s):`);
  errors.slice(0, 50).forEach(error => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log("Projection audit passed: snapshot is sourced, complete, and numerically valid.");
}
