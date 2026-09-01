import { readFile } from "node:fs/promises";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const html = await readFile(new URL("index.html", root), "utf8");
const source = await readFile(new URL("auction-draft-board.jsx", root), "utf8");
const entry = await readFile(new URL("entry.jsx", root), "utf8");
const news = JSON.parse(await readFile(new URL("player-news.json", root), "utf8"));
const bannerGif = await readFile(new URL("assets/banner/football-snap.gif", root));
const bannerStatic = await readFile(new URL("assets/banner/football-contact-frame.png", root));
const failures = [];
const requireText = (text, label) => { if (!html.includes(text)) failures.push(`missing ${label}`); };

requireText("<title>Load's Draft-o-matic</title>", "tab title");
requireText("<div id='root'></div>", "React root");
requireText("Automatic recovery backups", "automatic backups");
requireText("Add to Targets", "Targets watchlist");
requireText("Personal note", "personal notes");
requireText("LATEST NEWS", "player news card");
requireText("Current roster", "laptop roster sidebar");
requireText("Recent picks ticker", "recent-picks setting");
requireText("Brought to you by: TheFireSays", "TheFireSays credit");
requireText("background:#E8ECE6", "clean page background");
requireText("window.storage", "storage shim");

if (!source.includes('import playerNewsSnapshot from "./player-news.json"')) failures.push("source does not import the news snapshot");
if (!source.includes("<h1 style") || !source.includes("Load's Draft-o-matic")) failures.push("source is missing the laptop banner title");
if (!source.includes('./assets/banner/football-snap.gif')) failures.push("source is missing the animated football banner");
if (!source.includes('./assets/banner/football-contact-frame.png')) failures.push("source is missing the reduced-motion banner fallback");
if (!source.includes('(prefers-reduced-motion: reduce)')) failures.push("source does not honor reduced-motion mode");
if (!source.includes('const BANNER_COLLISION_PASSES = 4')) failures.push("football banner is not capped at four collision passes");
if (!source.includes('bannerAnimationFinished')) failures.push("football banner does not switch to its final still");
if (!source.includes('targetDifference') || !source.includes('POSITION_ORDER')) failures.push("Targets are not promoted within position lists");
if (!source.includes('sanitizeBidAmount') || !source.includes('pattern="[0-9]*"')) failures.push("player bids are not constrained to non-negative whole dollars");
if (!entry.includes("localStorage")) failures.push("entry.jsx does not shim storage onto localStorage");
if (source.includes("MatrixRain") || html.includes("Matrix rain background")) failures.push("digital-rain background is still present");
if ((news.matchedPlayers || 0) !== Object.keys(news.players || {}).length) failures.push("news match count does not match its data");
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
  console.log(`Build verification passed: ${news.matchedPlayers}/${news.checkedPlayers} players have audited news.`);
}
