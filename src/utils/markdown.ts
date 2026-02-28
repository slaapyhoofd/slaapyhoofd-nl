import { marked } from 'marked';

/**
 * Renders markdown string to HTML
 * @param markdown - Raw markdown content
 * @returns HTML string
 */
export function renderMarkdown(markdown: string): string {
  try {
    return marked(markdown) as string;
  } catch (error) {
    console.error('Error rendering markdown:', error);
    return '<p>Error rendering markdown</p>';
  }
}

/**
 * Sanitizes HTML to prevent XSS attacks
 * Removes script tags and event handlers
 * @param html - Raw HTML string
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers (onclick, onerror, onload, etc.)
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove script: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  return sanitized;
}

/**
 * Extracts plain text from markdown (removes formatting)
 * @param markdown - Raw markdown content
 * @returns Plain text string
 */
export function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/#{1,6}\s/g, '') // Remove headers
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.+?)\*/g, '$1') // Remove italic
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links
    .replace(/`(.+?)`/g, '$1') // Remove inline code
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .trim();
}

/**
 * Generates excerpt from markdown content
 * @param markdown - Raw markdown content
 * @param maxLength - Maximum length of excerpt (default: 160)
 * @returns Excerpt string
 */
export function generateExcerpt(markdown: string, maxLength = 160): string {
  const plainText = markdownToPlainText(markdown);
  
  if (plainText.length <= maxLength) {
    return plainText;
  }
  
  return plainText.substring(0, maxLength).trim() + '...';
}
