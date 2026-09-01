import { readFile, writeFile } from "node:fs/promises";
import { build } from "esbuild";

const root = new URL("../", import.meta.url);
const indexFile = new URL("index.html", root);
const entryFile = new URL("entry.jsx", root);

const result = await build({
  entryPoints: [entryFile.pathname],
  bundle: true,
  minify: true,
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  write: false,
});
const bundle = result.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");
const html = await readFile(indexFile, "utf8");
const rootMarker = "<div id='root'></div>";
const rootIndex = html.indexOf(rootMarker);
const scriptStart = html.indexOf("<script>", rootIndex) + "<script>".length;
const scriptEnd = html.lastIndexOf("</script>\n</body>");
if (rootIndex < 0 || scriptStart < "<script>".length || scriptEnd <= scriptStart) {
  throw new Error("Could not find the outer app script in index.html");
}

const output = `${html.slice(0, scriptStart)}${bundle}${html.slice(scriptEnd)}`;
await writeFile(indexFile, output, "utf8");
console.log(`Built index.html (${output.length.toLocaleString()} bytes)`);
