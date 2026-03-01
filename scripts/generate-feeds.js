import { writeFileSync } from 'fs';

const SITE_URL = 'https://slaapyhoofd.nl';
const API_URL = `${SITE_URL}/api`;

async function fetchAllPosts() {
  const posts = [];
  let page = 1;

  while (true) {
    const res = await fetch(`${API_URL}/posts?page=${page}&per_page=100`);
    if (!res.ok) throw new Error(`API responded with ${res.status}`);

    const data = await res.json();
    if (!data.success || !data.data?.posts?.length) break;

    posts.push(...data.data.posts);

    if (posts.length >= data.data.total) break;
    page++;
  }

  return posts;
}

function toXmlDate(dateStr) {
  return new Date(dateStr).toISOString().split('T')[0];
}

function escapeXml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildSitemap(posts) {
  const staticPages = [{ loc: `${SITE_URL}/`, priority: '1.0', changefreq: 'daily' }];

  const postPages = posts.map(post => ({
    loc: `${SITE_URL}/post/${post.slug}`,
    lastmod: toXmlDate(post.updated_at || post.published_at),
    priority: '0.8',
    changefreq: 'weekly',
  }));

  const urls = [...staticPages, ...postPages]
    .map(page => {
      const lastmod = page.lastmod ? `\n    <lastmod>${page.lastmod}</lastmod>` : '';
      return `  <url>
    <loc>${page.loc}</loc>${lastmod}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

function buildRss(posts) {
  const buildDate = new Date().toUTCString();

  const items = posts
    .slice(0, 50)
    .map(post => {
      const pubDate = new Date(post.published_at).toUTCString();
      const link = `${SITE_URL}/post/${post.slug}`;
      const category = post.category ? `\n      <category>${escapeXml(post.category)}</category>` : '';
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(post.excerpt ?? '')}</description>${category}
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Slaapyhoofd</title>
    <link>${SITE_URL}</link>
    <description>Blog about programming, LEGO, traveling, DIY, Home Assistant, home lab, and green energy</description>
    <language>en-us</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;
}

async function generate() {
  console.log('🗺️  Fetching posts...');
  const posts = await fetchAllPosts();
  console.log(`   Found ${posts.length} published post(s)`);

  writeFileSync('./dist/sitemap.xml', buildSitemap(posts), 'utf-8');
  console.log('✅ Sitemap written to dist/sitemap.xml');

  writeFileSync('./dist/rss.xml', buildRss(posts), 'utf-8');
  console.log('✅ RSS feed written to dist/rss.xml');
}

generate().catch(err => {
  console.error('❌ Generation failed:', err.message);
  process.exit(1);
});
