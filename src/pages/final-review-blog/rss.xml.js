import rss from '@astrojs/rss';
import { getLivePosts, postUrl } from '../../lib/blog';

export async function GET(context) {
  const posts = (await getLivePosts()).slice(0, 20);
  return rss({
    title: 'The Final Review | Burnham Nationwide',
    description: 'News, code updates and permitting insight from Burnham Nationwide.',
    site: context.site,
    trailingSlash: true,
    items: posts.map((post) => ({
      title: post.data.title,
      link: postUrl(post),
      description: post.data.description,
      ...(post.data.date && { pubDate: new Date(`${post.data.date}T00:00:00Z`) }),
    })),
  });
}
