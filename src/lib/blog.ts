import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;
export interface Topic {
  name: string;
  slug: string;
  url: string;
  count: number;
}

export const BLOG = '/final-review-blog/';
export const PER_PAGE = 12;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Every post, newest first (the live blog's listing order), moved posts included. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('blog');
  return posts.sort((a, b) => a.data.order - b.data.order);
}

/** Posts that still live on the blog (moved posts excluded). */
export async function getLivePosts(): Promise<Post[]> {
  return (await getPosts()).filter((p) => !p.data.redirect);
}

export async function getRecentPosts(n = 3): Promise<Post[]> {
  return (await getLivePosts()).slice(0, n);
}

/** Topics across all posts, largest first. */
export async function getTopics(): Promise<Topic[]> {
  const counts = new Map<string, Topic>();
  for (const p of await getPosts()) {
    for (const t of p.data.topics) {
      const topic = counts.get(t.slug) ?? { ...t, url: topicUrl(t.slug), count: 0 };
      topic.count++;
      counts.set(t.slug, topic);
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export const topicUrl = (slug: string) => `${BLOG}topic/${slug}/`;

/** Where a post's card should link: its page, or where it moved. */
export const postUrl = (post: Post) => post.data.redirect ?? `${BLOG}${post.id}/`;

/** The post's first topic, used for card labels, crumbs and related posts. */
export const primaryTopic = (post: Post) => post.data.topics[0];

/** "Oct 21, 2026" for exact dates, "Apr 2013" when only the month is known, else "". */
export function dateDisplay(post: Post): string {
  const { date, dateExact } = post.data;
  if (!date) return '';
  const [y, m, d] = date.split('-').map(Number);
  return dateExact ? `${MONTHS[m - 1]} ${d}, ${y}` : `${MONTHS[m - 1]} ${y}`;
}

export function excerpt(post: Post, limit = 170): string {
  const text = post.data.description.replace(/\s+/g, ' ').trim();
  if (text.length <= limit) return text;
  return text.slice(0, limit).replace(/\s+\S*$/, '').replace(/[,.;:]+$/, '') + '…';
}

export function readTime(post: Post): number {
  const text = (post.body ?? '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // images
    .replace(/\]\([^)]*\)/g, ' ') // link targets
    .replace(/<[^>]+>/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

/** Up to n live posts sharing the post's first topic, else the newest live posts. */
export async function getRelated(post: Post, n = 3): Promise<Post[]> {
  const live = (await getLivePosts()).filter((p) => p.id !== post.id);
  const slug = primaryTopic(post)?.slug;
  const same = slug ? live.filter((p) => primaryTopic(p)?.slug === slug) : [];
  return (same.length ? same : live).slice(0, n);
}

export interface PageLink {
  n?: number;
  url?: string;
  current?: boolean;
  gap?: boolean;
}

/** Numbered page links with gaps, as on the legacy blog. */
export function pagination(current: number, total: number, base: string) {
  const url = (n: number) => (n === 1 ? base : `${base}page/${n}/`);
  const shown = [...new Set([1, total, ...range(Math.max(1, current - 2), Math.min(total, current + 2))])].sort((a, b) => a - b);
  const items: PageLink[] = [];
  let prev = 0;
  for (const n of shown) {
    if (n - prev > 1) items.push({ gap: true });
    items.push({ n, url: url(n), current: n === current });
    prev = n;
  }
  return {
    items,
    prevUrl: current > 1 ? url(current - 1) : undefined,
    nextUrl: current < total ? url(current + 1) : undefined,
    multiple: total > 1,
  };
}

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

/**
 * Split a listing into pages. The main index leads with the newest post on page 1 and
 * pages through the rest; topic archives page through everything.
 */
export function paginate(posts: Post[], withLead: boolean) {
  const lead = withLead ? posts[0] : undefined;
  const rest = lead ? posts.slice(1) : posts;
  const total = Math.max(1, Math.ceil(rest.length / PER_PAGE));
  return Array.from({ length: total }, (_, i) => ({
    n: i + 1,
    total,
    featured: i === 0 ? lead : undefined,
    posts: rest.slice(i * PER_PAGE, (i + 1) * PER_PAGE),
  }));
}
