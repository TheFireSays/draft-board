import { readFile } from "node:fs/promises";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const html = await readFile(new URL("index.html", root), "utf8");
const source = await readFile(new URL("auction-draft-board.jsx", root), "utf8");
const entry = await readFile(new URL("entry.jsx", root), "utf8");
const news = JSON.parse(await readFile(new URL("player-news.json", root), "utf8"));
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
if (!entry.includes("localStorage")) failures.push("entry.jsx does not shim storage onto localStorage");
if (source.includes("MatrixRain") || html.includes("Matrix rain background")) failures.push("digital-rain background is still present");
if ((news.matchedPlayers || 0) !== Object.keys(news.players || {}).length) failures.push("news match count does not match its data");

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
