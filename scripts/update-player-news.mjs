import { readFile, writeFile } from "node:fs/promises";
import { classifyHeadline, isPlayerFocusedHeadline, normalizeNewsText } from "./news-relevance.mjs";

const SOURCE_FILE = new URL("../auction-draft-board.jsx", import.meta.url);
const OUTPUT_FILE = new URL("../player-news.json", import.meta.url);
const LOOKBACK_DAYS = 21;
const CONCURRENCY = 6;
const DRAFT_DAY = process.env.DRAFT_DAY || "2026-09-05";
const DRAFT_DEADLINE = new Date(`${DRAFT_DAY}T23:59:59-07:00`);
const MAX_AGE_ON_DRAFT_DAY_DAYS = 21;

const decodeXml = (value = "") => value
  .replace(/^<!\[CDATA\[|\]\]>$/g, "")
  .replace(/&amp;/g, "&")
  .replace(/&quot;/g, '"')
  .replace(/&#39;|&apos;/g, "'")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">");

const xmlValue = (xml, tag) => {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return decodeXml(match?.[1]?.trim() || "");
};

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

async function latestHeadline(player, rosterPlayers) {
  const phrase = player.pos === "DEF"
    ? `"${player.name}" NFL defense when:${LOOKBACK_DAYS}d`
    : `"${player.name}" NFL fantasy when:${LOOKBACK_DAYS}d`;
  const url = new URL("https://news.google.com/rss/search");
  url.searchParams.set("q", phrase);
  url.searchParams.set("hl", "en-US");
  url.searchParams.set("gl", "US");
  url.searchParams.set("ceid", "US:en");

  const response = await fetch(url, {
    headers: { "user-agent": "Load's Draft-o-matic personal news snapshot/1.0" },
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const xml = await response.text();
  const playerName = normalizeNewsText(player.name);
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)]
    .map(match => {
      const item = match[1];
      const publisher = xmlValue(item, "source");
      let headline = xmlValue(item, "title");
      if (publisher && headline.endsWith(` - ${publisher}`)) {
        headline = headline.slice(0, -(publisher.length + 3));
      }
      const published = new Date(xmlValue(item, "pubDate"));
      return {
        headline,
        publisher,
        publishedAt: Number.isNaN(published.valueOf()) ? "" : published.toISOString(),
        url: xmlValue(item, "link"),
        ...classifyHeadline(headline),
      };
    })
    .filter(item => {
      if (!item.headline || !item.url || !item.publishedAt || !item.relevant) return false;
      if (!normalizeNewsText(item.headline).includes(playerName)) return false;
      if (!isPlayerFocusedHeadline(item.headline, player, rosterPlayers)) return false;
      const ageOnDraftDay = (DRAFT_DEADLINE - new Date(item.publishedAt)) / 86400000;
      return ageOnDraftDay >= 0 && ageOnDraftDay <= MAX_AGE_ON_DRAFT_DAY_DAYS;
    })
    .sort((a, b) => b.score - a.score || b.publishedAt.localeCompare(a.publishedAt));
  if (!items[0]) return null;
  const { relevant, score, ...latest } = items[0];
  return latest;
}

const source = await readFile(SOURCE_FILE, "utf8");
const allPlayers = readPlayers(source);
const limit = Number.parseInt(process.env.NEWS_LIMIT || "", 10);
const players = Number.isFinite(limit) ? allPlayers.slice(0, limit) : allPlayers;
const news = {};
let cursor = 0;
let failures = 0;

async function worker() {
  while (cursor < players.length) {
    const player = players[cursor++];
    try {
      const item = await latestHeadline(player, allPlayers);
      if (item) news[player.id] = item;
    } catch (error) {
      failures += 1;
      console.warn(`No update for ${player.name}: ${error.message}`);
    }
    if (cursor % 25 === 0 || cursor === players.length) {
      console.log(`Checked ${Math.min(cursor, players.length)}/${players.length} players; matched ${Object.keys(news).length}`);
    }
    await new Promise(resolve => setTimeout(resolve, 120));
  }
}

await Promise.all(Array.from({ length: Math.min(CONCURRENCY, players.length) }, worker));
if (players.length && failures === players.length) throw new Error("Every news request failed; existing snapshot was left unchanged");

const snapshot = {
  updatedAt: new Date().toISOString(),
  provider: "Google News RSS",
  lookbackDays: LOOKBACK_DAYS,
  draftDay: DRAFT_DAY,
  maxAgeOnDraftDayDays: MAX_AGE_ON_DRAFT_DAY_DAYS,
  focusPolicy: "single-player headline",
  checkedPlayers: players.length,
  matchedPlayers: Object.keys(news).length,
  players: news,
};
await writeFile(OUTPUT_FILE, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
console.log(`Saved ${snapshot.matchedPlayers} matched headlines to player-news.json (${failures} request failures)`);
