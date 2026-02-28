import { describe, it, expect } from 'vitest';
import { renderMarkdown, sanitizeHtml, markdownToPlainText, generateExcerpt } from '@/utils/markdown';

describe('markdown utils', () => {
  describe('renderMarkdown', () => {
    it('should convert markdown to HTML', () => {
      const markdown = '# Hello World\n\nThis is **bold** text.';
      const html = renderMarkdown(markdown);
      expect(html).toContain('<h1');
      expect(html).toContain('Hello World');
      expect(html).toContain('<strong>bold</strong>');
    });

    it('should convert links correctly', () => {
      const markdown = '[GitHub](https://github.com)';
      const html = renderMarkdown(markdown);
      expect(html).toContain('<a');
      expect(html).toContain('href="https://github.com"');
      expect(html).toContain('GitHub');
    });

    it('should handle code blocks', () => {
      const markdown = '```javascript\nconst x = 1;\n```';
      const html = renderMarkdown(markdown);
      expect(html).toContain('<code');
      expect(html).toContain('const x = 1');
    });

    it('should handle inline code', () => {
      const markdown = 'This is `inline code` here.';
      const html = renderMarkdown(markdown);
      expect(html).toContain('<code>inline code</code>');
    });
  });

  describe('sanitizeHtml', () => {
    it('should remove dangerous script tags', () => {
      const dangerous = '<script>alert("xss")</script><p>Safe content</p>';
      const safe = sanitizeHtml(dangerous);
      expect(safe).not.toContain('script');
      expect(safe).not.toContain('alert');
      expect(safe).toContain('Safe content');
    });

    it('should remove event handlers', () => {
      const dangerous = '<div onclick="alert(\'xss\')">Click me</div>';
      const safe = sanitizeHtml(dangerous);
      expect(safe).not.toContain('onclick');
      expect(safe).toContain('Click me');
    });

    it('should allow safe HTML tags', () => {
      const safe = '<p>Paragraph</p><strong>Bold</strong><em>Italic</em>';
      const sanitized = sanitizeHtml(safe);
      expect(sanitized).toContain('<p>');
      expect(sanitized).toContain('<strong>');
      expect(sanitized).toContain('<em>');
    });
  });

  describe('markdownToPlainText', () => {
    it('should strip all markdown formatting', () => {
      const markdown = '# Title\n\nThis is **bold** and *italic* text.';
      const plain = markdownToPlainText(markdown);
      expect(plain).not.toContain('#');
      expect(plain).not.toContain('**');
      expect(plain).not.toContain('*');
      expect(plain).toContain('Title');
      expect(plain).toContain('bold');
      expect(plain).toContain('italic');
    });

    it('should remove links but keep text', () => {
      const markdown = 'Visit [GitHub](https://github.com) now!';
      const plain = markdownToPlainText(markdown);
      expect(plain).toContain('GitHub');
      expect(plain).not.toContain('](');
      expect(plain).not.toContain('https://');
    });
  });

  describe('generateExcerpt', () => {
    it('should generate excerpt from markdown', () => {
      const markdown = '# Title\n\nThis is a long article about testing. ' +
        'It has multiple sentences and paragraphs. We want to extract just the beginning.';
      const excerpt = generateExcerpt(markdown, 50);
      expect(excerpt.length).toBeLessThanOrEqual(53); // 50 + '...'
      expect(excerpt).toContain('This is a long article');
      expect(excerpt.endsWith('...')).toBe(true);
    });

    it('should not add ellipsis for short content', () => {
      const markdown = 'Short text.';
      const excerpt = generateExcerpt(markdown, 100);
      expect(excerpt).toBe('Short text.');
      expect(excerpt).not.toContain('...');
    });

    it('should strip HTML tags from excerpt', () => {
      const markdown = '**Bold** text with *formatting*.';
      const excerpt = generateExcerpt(markdown, 100);
      expect(excerpt).not.toContain('**');
      expect(excerpt).not.toContain('*');
      expect(excerpt).toContain('Bold text with formatting');
    });
  });
});
