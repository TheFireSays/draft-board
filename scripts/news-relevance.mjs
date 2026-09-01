export const NEWS_RELEVANCE_GROUPS = [
  {
    category: "Injury / availability",
    weight: 8,
    terms: ["injur", "practice", "questionable", "doubtful", "ruled out", "inactive", "sidelined", "miss time", "healthy", "cleared", "return"],
  },
  {
    category: "Fantasy / draft",
    weight: 6,
    terms: ["fantasy", "draft", "adp", "ranking", "outlook", "preview", "projection", "sleeper", "bust", "auction"],
  },
  {
    category: "Role / depth chart",
    weight: 5,
    terms: ["depth chart", "starter", "starting", "role", "target share", "touches", "workload", "snap", "carries", "backup", "rotation", "kicking job", "trust in kicker"],
  },
  {
    category: "Transaction / discipline",
    weight: 5,
    terms: ["suspend", "trade", "traded", "sign", "waiv", "release", "cut", "acquire", "contract", "extension", "retire"],
  },
  {
    category: "Recent performance",
    weight: 3,
    terms: ["preseason", "exhibition", "catches", "receiving yards", "rushing yards", "touchdown", "carries", "attempts", "limited work", "quiet night", "makes all", "kicks"],
  },
];

const NOISE_TERMS = ["girlfriend", "wife", "wedding", "podcast", "got jokes", "dating", "top 100 players", "highest paid"];
const ROUNDUP_TERMS = [
  "who should i draft",
  "outlooks for",
  "players to draft",
  "players to avoid",
  "top sleepers",
  "deep sleepers",
  "breakouts busts",
  "rankings tiers",
  "and more",
  "and other",
  "target these",
];

export const normalizeNewsText = value => value
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

export function isPlayerFocusedHeadline(headline, player, rosterPlayers = []) {
  const text = normalizeNewsText(headline);
  const playerName = normalizeNewsText(player?.name || "");
  if (!playerName || !text.includes(playerName)) return false;
  if (ROUNDUP_TERMS.some(term => text.includes(term))) return false;
  if ((headline.match(/,/g) || []).length >= 2) return false;
  if (text.indexOf(playerName) > 45) return false;
  for (const separator of [":", ","]) {
    const separatorIndex = headline.indexOf(separator);
    if (separatorIndex >= 0 && !normalizeNewsText(headline.slice(0, separatorIndex)).includes(playerName)) return false;
  }

  const otherNamedPlayers = new Set(
    rosterPlayers
      .filter(candidate => candidate.id !== player.id && candidate.pos !== "DEF")
      .map(candidate => normalizeNewsText(candidate.name))
      .filter(name => name.length >= 6 && text.includes(name))
  );
  return otherNamedPlayers.size === 0;
}

export function classifyHeadline(headline) {
  const text = normalizeNewsText(headline);
  const matches = NEWS_RELEVANCE_GROUPS.map(group => ({
    category: group.category,
    score: group.terms.reduce((score, term) => score + (text.includes(term) ? group.weight : 0), 0),
  })).filter(match => match.score > 0).sort((a, b) => b.score - a.score);
  const noisePenalty = NOISE_TERMS.some(term => text.includes(term)) ? 8 : 0;
  const score = matches.reduce((sum, match) => sum + match.score, 0) - noisePenalty;
  return { relevant: score >= 3, score, category: matches[0]?.category || null };
}
