/* global process */
/**
 * Writes public/resources.index.json for static mirrors / CDN consumers.
 * Search UI uses filesystem via getResourceIndex() at build/runtime.
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const contentDir = path.join(root, "content");
const outFile = path.join(root, "public", "resources.index.json");

function isReserved(name) {
  return name.startsWith("_") || name.startsWith(".");
}

async function main() {
  let entries = [];
  try {
    const dirs = await fs.readdir(contentDir, { withFileTypes: true });
    for (const d of dirs) {
      if (!d.isDirectory() || isReserved(d.name)) continue;
      const metaPath = path.join(contentDir, d.name, "meta.json");
      try {
        const raw = await fs.readFile(metaPath, "utf8");
        const meta = JSON.parse(raw);
        if (!meta.title || !meta.description) continue;
        entries.push({
          slug: d.name,
          title: meta.title,
          description: meta.description,
          keywords: meta.keywords ?? [],
          tags: meta.tags ?? [],
        });
      } catch {
        // skip incomplete
      }
    }
  } catch {
    entries = [];
  }

  entries.sort((a, b) => a.slug.localeCompare(b.slug));
  await fs.mkdir(path.dirname(outFile), { recursive: true });
  await fs.writeFile(outFile, JSON.stringify(entries, null, 2), "utf8");
  console.log(`Wrote ${outFile} (${entries.length} resources)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
