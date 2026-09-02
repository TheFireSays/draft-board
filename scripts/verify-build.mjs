import { readFile } from "node:fs/promises";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const html = await readFile(new URL("index.html", root), "utf8");
const source = await readFile(new URL("auction-draft-board.jsx", root), "utf8");
const entry = await readFile(new URL("entry.jsx", root), "utf8");
const projections = JSON.parse(await readFile(new URL("player-projections.json", root), "utf8"));
const bannerGif = await readFile(new URL("assets/banner/football-snap.gif", root));
const bannerStatic = await readFile(new URL("assets/banner/football-contact-frame.png", root));
const failures = [];
const requireText = (text, label) => { if (!html.includes(text)) failures.push(`missing ${label}`); };

requireText("<title>Load's Draft-o-matic</title>", "tab title");
requireText("<div id='root'></div>", "React root");
requireText("Automatic recovery backups", "automatic backups");
requireText("Add to Targets", "Targets watchlist");
requireText("Personal note", "personal notes");
requireText("Remove manually added", "manual player removal");
requireText("ESPN 2026 PPR PROJECTION", "ESPN projection summary");
requireText("ESPN source", "ESPN projection attribution");
requireText("ESPN CDN", "ESPN media attribution");
requireText("Current roster", "laptop roster sidebar");
requireText("My pick", "My Team draft order accessibility label");
requireText("Brought to you by: TheFireSays", "TheFireSays credit");
requireText("background:#E8ECE6", "clean page background");
requireText("window.storage", "storage shim");

if (!source.includes('import playerProjectionsSnapshot from "./player-projections.json"')) failures.push("source does not import the ESPN projection snapshot");
if (!source.includes("function PlayerAvatar") || !source.includes("teamLogoUrl") || !source.includes("headshotUrl")) failures.push("source is missing player headshots or defense logo support");
if (!source.includes("<h1 style") || !source.includes("Load's Draft-o-matic")) failures.push("source is missing the laptop banner title");
if (!source.includes('./assets/banner/football-snap.gif')) failures.push("source is missing the animated football banner");
if (!source.includes('./assets/banner/football-contact-frame.png')) failures.push("source is missing the reduced-motion banner fallback");
if (!source.includes('(prefers-reduced-motion: reduce)')) failures.push("source does not honor reduced-motion mode");
if (!source.includes('const BANNER_COLLISION_PASSES = 4')) failures.push("football banner is not capped at four collision passes");
if (!source.includes('bannerAnimationFinished')) failures.push("football banner does not switch to its final still");
if (!source.includes('targetDifference') || !source.includes('POSITION_ORDER')) failures.push("Targets are not promoted within position lists");
if (!source.includes('IntersectionObserver') || !source.includes('Load more players')) failures.push("player lists do not progressively load every result");
if (source.includes('.slice(0, q ? 12 : 40)')) failures.push("player lists still have the old hard result limit");
if (!source.includes('supplementalPlayers') || !source.includes('BASE_PLAYERS.concat')) failures.push("ESPN supplemental players are not included in the board");
if (!source.includes('removeCustomPlayer') || !source.includes('delete next[playerId]')) failures.push("manual player removal does not clean up saved player data");
if (!source.includes('sanitizeBidAmount') || !source.includes('pattern="[0-9]*"')) failures.push("player bids are not constrained to non-negative whole dollars");
if (!source.includes('"My Pick Order"') || !source.includes('myPickIndex')) failures.push("My Team draft order is not tracked in the roster and CSV");
if (!entry.includes("localStorage")) failures.push("entry.jsx does not shim storage onto localStorage");
if (source.includes("MatrixRain") || html.includes("Matrix rain background")) failures.push("digital-rain background is still present");
if (source.includes("RecentPicksTicker") || source.includes("recent-picks-track") || html.includes("Recent picks ticker")) failures.push("recent-picks ticker is still present");
if (projections.provider !== "ESPN" || projections.mediaProvider !== "ESPN CDN" || projections.scoringFormat !== "PPR") failures.push("projection snapshot is missing ESPN PPR/media attribution");
if ((projections.projectedPlayers || 0) < 175) failures.push("projection snapshot coverage is unexpectedly low");
if (bannerGif.subarray(0, 6).toString("ascii") !== "GIF89a") failures.push("football banner is not a GIF89a asset");
if (bannerStatic.subarray(1, 4).toString("ascii") !== "PNG") failures.push("football banner fallback is not a PNG asset");
if (bannerGif.length > 2_000_000) failures.push("football banner GIF is unexpectedly large");
const loopMarker = bannerGif.indexOf(Buffer.from("NETSCAPE2.0"));
if (loopMarker < 0 || bannerGif.readUInt16LE(loopMarker + 13) !== 0) failures.push("football banner GIF must use a seamless internal loop");

const rootIndex = html.indexOf("<div id='root'></div>");
const scriptStart = html.indexOf("<script>", rootIndex) + "<script>".length;
const scriptEnd = html.lastIndexOf("</script>\n</body>");
if (scriptStart < "<script>".length || scriptEnd <= scriptStart) failures.push("outer bundle boundary is invalid");
else {
  try { new vm.Script(html.slice(scriptStart, scriptEnd)); }
  catch (error) { failures.push(`bundle syntax error: ${error.message}`); }
}

if (failures.length) {
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`Build verification passed: ${projections.projectedPlayers}/${projections.checkedPlayers} players have ESPN projections.`);
}
