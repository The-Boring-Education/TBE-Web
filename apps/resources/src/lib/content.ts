import fs from "fs/promises";
import path from "path";

import type { ResourceIndexEntry, ResourceMeta, ResourceQuiz } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content");

function isReservedDir(name: string): boolean {
  return name.startsWith("_") || name.startsWith(".");
}

export async function listResourceSlugs(): Promise<string[]> {
  try {
    const entries = await fs.readdir(CONTENT_DIR, { withFileTypes: true });
    const slugs: string[] = [];
    for (const e of entries) {
      if (!e.isDirectory() || isReservedDir(e.name)) continue;
      const metaPath = path.join(CONTENT_DIR, e.name, "meta.json");
      const htmlPath = path.join(CONTENT_DIR, e.name, "index.html");
      try {
        await fs.access(metaPath);
        await fs.access(htmlPath);
        slugs.push(e.name);
      } catch {
        // skip incomplete folders
      }
    }
    return slugs.sort();
  } catch {
    return [];
  }
}

export async function readResourceMeta(
  slug: string,
): Promise<ResourceMeta | null> {
  const metaPath = path.join(CONTENT_DIR, slug, "meta.json");
  try {
    const raw = await fs.readFile(metaPath, "utf8");
    const data = JSON.parse(raw) as ResourceMeta;
    if (!data.title || !data.description) return null;
    return {
      title: data.title,
      description: data.description,
      keywords: data.keywords ?? [],
      ogImage: data.ogImage,
      tags: data.tags ?? [],
    };
  } catch {
    return null;
  }
}

export async function readResourceHtml(slug: string): Promise<string | null> {
  const htmlPath = path.join(CONTENT_DIR, slug, "index.html");
  try {
    return await fs.readFile(htmlPath, "utf8");
  } catch {
    return null;
  }
}

export async function readResourceQuiz(
  slug: string,
): Promise<ResourceQuiz | null> {
  const quizPath = path.join(CONTENT_DIR, slug, "quiz.json");
  try {
    const raw = await fs.readFile(quizPath, "utf8");
    const data = JSON.parse(raw) as ResourceQuiz;
    if (
      !data.questions ||
      !Array.isArray(data.questions) ||
      data.questions.length === 0
    ) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export async function getResourceIndex(): Promise<ResourceIndexEntry[]> {
  const slugs = await listResourceSlugs();
  const entries: ResourceIndexEntry[] = [];
  for (const slug of slugs) {
    const meta = await readResourceMeta(slug);
    if (!meta) continue;
    entries.push({
      slug,
      title: meta.title,
      description: meta.description,
      keywords: meta.keywords ?? [],
      tags: meta.tags ?? [],
    });
  }
  return entries;
}

/** Latest mtime of meta.json and index.html for a resource folder. */
export async function getResourceLastModified(
  slug: string,
): Promise<Date | null> {
  const metaPath = path.join(CONTENT_DIR, slug, "meta.json");
  const htmlPath = path.join(CONTENT_DIR, slug, "index.html");
  try {
    const [metaStat, htmlStat] = await Promise.all([
      fs.stat(metaPath),
      fs.stat(htmlPath),
    ]);
    return new Date(Math.max(metaStat.mtimeMs, htmlStat.mtimeMs));
  } catch {
    return null;
  }
}

/** Latest change across all resource folders; falls back to now if empty. */
export async function getSiteContentLastModified(): Promise<Date> {
  const slugs = await listResourceSlugs();
  let maxMs = 0;
  for (const slug of slugs) {
    const d = await getResourceLastModified(slug);
    if (d) maxMs = Math.max(maxMs, d.getTime());
  }
  return maxMs > 0 ? new Date(maxMs) : new Date();
}
