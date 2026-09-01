import { readFile } from "node:fs/promises";
import { classifyHeadline, normalizeNewsText } from "./news-relevance.mjs";

const source = await readFile(new URL("../auction-draft-board.jsx", import.meta.url), "utf8");
const snapshot = JSON.parse(await readFile(new URL("../player-news.json", import.meta.url), "utf8"));
const draftDay = process.env.DRAFT_DAY || "2026-09-05";
const draftDeadline = new Date(`${draftDay}T23:59:59-07:00`);
const maxAgeOnDraftDayDays = 21;
const players = new Map();
const raw = source.match(/const RAW = \{([\s\S]*?)\n\};/)?.[1];
if (!raw) throw new Error("Could not find the RAW player list");
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
const categories = {};
const coverage = {};
for (const player of players.values()) coverage[player.pos] = { total: (coverage[player.pos]?.total || 0) + 1, matched: coverage[player.pos]?.matched || 0 };

for (const [id, item] of Object.entries(snapshot.players || {})) {
  const player = players.get(id);
  if (!player) { errors.push(`${id}: unknown player id`); continue; }
  coverage[player.pos].matched += 1;
  if (!item.headline || !item.publisher || !item.publishedAt || !/^https:\/\//.test(item.url || "")) {
    errors.push(`${id} ${player.name}: incomplete headline metadata`);
    continue;
  }
  if (!normalizeNewsText(item.headline).includes(normalizeNewsText(player.name))) {
    errors.push(`${id} ${player.name}: headline does not name the player`);
  }
  const relevance = classifyHeadline(item.headline);
  if (!relevance.relevant) errors.push(`${id} ${player.name}: not draft relevant: ${item.headline}`);
  else categories[relevance.category] = (categories[relevance.category] || 0) + 1;
  const published = new Date(item.publishedAt);
  const ageDays = (draftDeadline - published) / 86400000;
  if (!Number.isFinite(ageDays) || ageDays < 0 || ageDays > maxAgeOnDraftDayDays) {
    errors.push(`${id} ${player.name}: headline is ${ageDays.toFixed(1)} days old on ${draftDay}`);
  }
}

const snapshotAgeHours = (draftDeadline - new Date(snapshot.updatedAt)) / 3600000;
console.log(`Draft day: ${draftDay}`);
console.log(`Snapshot: ${snapshot.updatedAt} (${snapshotAgeHours.toFixed(1)} hours before the end of draft day)`);
console.log(`Relevant coverage: ${Object.keys(snapshot.players || {}).length}/${players.size}`);
console.log("Coverage by position:", coverage);
console.log("Headline categories:", categories);
if (snapshotAgeHours > 24) console.warn("REFRESH REQUIRED: run the updater again within 24 hours of the draft.");
if (errors.length) {
  console.error(`Audit failed with ${errors.length} issue(s):`);
  errors.slice(0, 50).forEach(error => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log("Content audit passed: every included headline is named, sourced, fresh, and draft relevant.");
}
