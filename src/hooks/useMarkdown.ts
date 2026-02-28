import { useMemo } from 'react';
import { renderMarkdown, sanitizeHtml } from '@/utils/markdown';

interface UseMarkdownResult {
  html: string;
}

function useMarkdown(content: string): UseMarkdownResult {
  // sanitizeHtml strips XSS vectors (script tags, event handlers) from rendered output
  const html = useMemo(() => sanitizeHtml(renderMarkdown(content)), [content]);
  return { html };
}

export { useMarkdown };