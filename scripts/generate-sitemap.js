import { writeFileSync } from 'fs';

const SITE_URL = 'https://slaapyhoofd.nl';
const API_URL = `${SITE_URL}/api`;
const OUTPUT_PATH = './dist/sitemap.xml';

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

function buildSitemap(posts) {
  const staticPages = [
    { loc: `${SITE_URL}/`, priority: '1.0', changefreq: 'daily' },
  ];

  const postPages = posts.map(post => ({
    loc: `${SITE_URL}/post/${post.slug}`,
    lastmod: toXmlDate(post.updated_at || post.published_at),
    priority: '0.8',
    changefreq: 'weekly',
  }));

  const allPages = [...staticPages, ...postPages];

  const urls = allPages
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

async function generate() {
  console.log('🗺️  Generating sitemap...');

  const posts = await fetchAllPosts();
  console.log(`   Found ${posts.length} published post(s)`);

  const xml = buildSitemap(posts);
  writeFileSync(OUTPUT_PATH, xml, 'utf-8');

  console.log(`✅ Sitemap written to ${OUTPUT_PATH}`);
}

generate().catch(err => {
  console.error('❌ Sitemap generation failed:', err.message);
  process.exit(1);
});
