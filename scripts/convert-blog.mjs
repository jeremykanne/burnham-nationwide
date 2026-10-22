// One-off migration: legacy HTML blog posts -> Markdown content collection.
//
//   node scripts/convert-blog.mjs
//
// Reads legacy/src/content/blog/*.html (front-matter comment + cleaned body HTML) and
// writes src/content/blog/*.md with YAML front matter. Images move to
// src/content/blog/images/ and are referenced relatively so Astro optimizes them; an
// image left inside raw HTML (which Astro doesn't process) is copied to
// public/assets/blog/ and keeps its old absolute path instead.
import fs from 'node:fs';
import path from 'node:path';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const root = path.resolve(import.meta.dirname, '..');
const legacyPosts = path.join(root, 'legacy/src/content/blog');
const legacyImages = path.join(root, 'legacy/src/assets/blog');
const outDir = path.join(root, 'src/content/blog');
const imageDir = path.join(outDir, 'images');
const publicDir = path.join(root, 'public/assets/blog');

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
});
turndown.use(gfm);
turndown.keep(['sup', 'sub', 'iframe', 'figure']);

// Markdown only parses ** / * reliably when the emphasized text starts and ends with a
// letter or digit (e.g. `<strong>2.</strong>When` would render literal asterisks), so
// anything else keeps the inline HTML tag.
const safeEdges = (text) => /^[\p{L}\p{N}]/u.test(text) && /[\p{L}\p{N}]$/u.test(text);
for (const [name, tags, mark] of [['strong', ['strong', 'b'], '**'], ['emphasis', ['em', 'i'], '*']]) {
  turndown.addRule(name, {
    filter: tags,
    replacement: (content, node) => {
      if (!content.trim()) return content;
      const tag = tags[0];
      const lead = content.match(/^\s*/)[0];
      const trail = content.match(/\s*$/)[0];
      const inner = content.trim();
      return lead + (safeEdges(inner) ? `${mark}${inner}${mark}` : `<${tag}>${inner}</${tag}>`) + trail;
    },
  });
}

function parseLegacy(text) {
  const m = text.match(/^\s*<!--\n([\s\S]*?)\n-->\n?/);
  const meta = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: text.slice(m[0].length) };
}

const yaml = (v) => JSON.stringify(v); // JSON strings are valid YAML scalars
const list = (s) => (s || '').split(',').map((t) => t.trim()).filter(Boolean);

fs.mkdirSync(imageDir, { recursive: true });
const stats = { posts: 0, images: new Set(), rawHtmlImages: new Set(), rawHtmlPosts: [] };

function useImage(src) {
  const name = path.basename(src);
  fs.copyFileSync(path.join(legacyImages, name), path.join(imageDir, name));
  stats.images.add(name);
  return `./images/${name}`;
}

for (const file of fs.readdirSync(legacyPosts).filter((f) => f.endsWith('.html'))) {
  const { meta, body } = parseLegacy(fs.readFileSync(path.join(legacyPosts, file), 'utf8'));

  const relBody = body.replace(/src="\/assets\/blog\/([^"]+)"/g, (_, name) => `src="${useImage(name)}"`);
  let md = turndown.turndown(relBody).trim();

  // Images Turndown left inside raw HTML can't be resolved relatively: serve from public/
  md = md.replace(/(<[^>]*\bsrc=")\.\/images\/([^"]+)"/g, (_, pre, name) => {
    fs.mkdirSync(publicDir, { recursive: true });
    fs.copyFileSync(path.join(legacyImages, name), path.join(publicDir, name));
    stats.rawHtmlImages.add(name);
    stats.rawHtmlPosts.push(file);
    return `${pre}/assets/blog/${name}"`;
  });
  if (/<table/i.test(md)) stats.rawHtmlPosts.push(`${file} (table kept as HTML)`);

  const names = list(meta.topics);
  const slugs = list(meta.topic_slugs);
  const fm = ['---', `title: ${yaml(meta.title)}`];
  if (meta.date) fm.push(`date: ${yaml(meta.date)}`);
  fm.push(`dateExact: ${meta.date_exact === 'yes'}`);
  fm.push(`order: ${Number(meta.order)}`);
  fm.push(`author: ${yaml(meta.author || 'Burnham Nationwide')}`);
  if (names.length) {
    fm.push('topics:');
    names.forEach((name, i) => fm.push(`  - name: ${yaml(name)}`, `    slug: ${yaml(slugs[i])}`));
  } else {
    fm.push('topics: []');
  }
  fm.push(`description: ${yaml(meta.description || '')}`);
  if (meta.image) {
    fm.push(`image: ${yaml(useImage(meta.image))}`);
    fm.push(`imageAlt: ${yaml(meta.image_alt || '')}`);
  }
  if (meta.redirect) fm.push(`redirect: ${yaml(meta.redirect)}`);
  fm.push('---', '');

  fs.writeFileSync(path.join(outDir, file.replace(/\.html$/, '.md')), fm.join('\n') + md + '\n');
  stats.posts++;
}

console.log(`${stats.posts} posts, ${stats.images.size} images in src/content/blog/images/`);
console.log(`${stats.rawHtmlImages.size} images kept in public/ for raw HTML`);
for (const p of new Set(stats.rawHtmlPosts)) console.log('  raw HTML:', p);
