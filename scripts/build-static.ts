#!/usr/bin/env node
/**
 * Static Site Generator for slaapyhoofd.nl
 *
 * Fetches all published posts from the API and generates static HTML files
 * in dist/post/[slug]/index.html for SEO and fast initial page loads.
 *
 * Usage: npx tsx scripts/build-static.ts
 * Runs automatically as part of the build step via package.json.
 */

import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

config();

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:8080/api';
const DIST_DIR = join(process.cwd(), 'dist');
const TEMPLATE_PATH = join(DIST_DIR, 'index.html');

interface Post {
  id: number;
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  markdown_content: string;
  author: string;
  category?: string;
  tags?: string;
  featured_image?: string;
  published_at: string;
  views: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

async function fetchPosts(): Promise<Post[]> {
  const url = `${API_BASE_URL}/posts?per_page=100`;
  const response = await fetch(url);
  const json: ApiResponse<{ posts: Post[] }> = await response.json();

  if (!json.success) {
    throw new Error(`Failed to fetch posts: ${json.error}`);
  }
  return json.data.posts;
}

async function fetchPost(slug: string): Promise<Post> {
  const url = `${API_BASE_URL}/posts/${slug}`;
  const response = await fetch(url);
  const json: ApiResponse<Post> = await response.json();

  if (!json.success) {
    throw new Error(`Failed to fetch post "${slug}": ${json.error}`);
  }
  return json.data;
}

function generatePostHtml(template: string, post: Post): string {
  const description = post.excerpt || post.content.slice(0, 160).replace(/<[^>]+>/g, '');
  const image = post.featured_image || '';

  // Inject SEO meta tags before </head>
  const metaTags = `
    <title>${escapeHtml(post.title)} | Slaapyhoofd</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta property="og:title" content="${escapeHtml(post.title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    ${image ? `<meta property="og:image" content="${escapeHtml(image)}">` : ''}
    <meta property="og:type" content="article">
    <link rel="canonical" href="https://slaapyhoofd.nl/post/${post.slug}">
  `;

  return template.replace('</head>', `${metaTags}</head>`);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function buildStaticPages(): Promise<void> {
  if (!existsSync(DIST_DIR)) {
    console.error('❌ dist/ directory not found. Run `npm run build` first.');
    process.exit(1);
  }

  if (!existsSync(TEMPLATE_PATH)) {
    console.error('❌ dist/index.html not found. Run `npm run build` first.');
    process.exit(1);
  }

  const template = readFileSync(TEMPLATE_PATH, 'utf-8');

  console.log('📡 Fetching published posts...');
  let posts: Post[];
  try {
    posts = await fetchPosts();
  } catch (err) {
    console.warn(`⚠️  Could not fetch posts (API may be offline): ${err}`);
    console.log('✅ Skipping static page generation.');
    return;
  }

  console.log(`📝 Generating static pages for ${posts.length} posts...`);

  for (const postSummary of posts) {
    try {
      const post = await fetchPost(postSummary.slug);
      const postDir = join(DIST_DIR, 'post', post.slug);
      mkdirSync(postDir, { recursive: true });

      const html = generatePostHtml(template, post);
      writeFileSync(join(postDir, 'index.html'), html, 'utf-8');
      console.log(`  ✅ /post/${post.slug}`);
    } catch (err) {
      console.warn(`  ⚠️  Failed to generate /post/${postSummary.slug}: ${err}`);
    }
  }

  console.log('✅ Static site generation complete!');
}

buildStaticPages().catch((err) => {
  console.error('❌ Build-static failed:', err);
  process.exit(1);
});
