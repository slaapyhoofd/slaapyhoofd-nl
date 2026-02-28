import { describe, it, expect } from 'vitest';
import { slugify } from './slugify';

describe('slugify', () => {
  it('converts basic text to lowercase slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(slugify('Hello, World!')).toBe('hello-world');
  });

  it('replaces spaces with hyphens', () => {
    expect(slugify('my blog post title')).toBe('my-blog-post-title');
  });

  it('collapses multiple spaces into one hyphen', () => {
    expect(slugify('hello   world')).toBe('hello-world');
  });

  it('replaces underscores with hyphens', () => {
    expect(slugify('hello_world')).toBe('hello-world');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('  hello world  ')).toBe('hello-world');
  });

  it('handles numbers', () => {
    expect(slugify('Top 10 Tips')).toBe('top-10-tips');
  });

  it('handles already-slugified input', () => {
    expect(slugify('hello-world')).toBe('hello-world');
  });

  it('returns empty string for empty input', () => {
    expect(slugify('')).toBe('');
  });

  it('handles string with only special characters', () => {
    expect(slugify('!!!')).toBe('');
  });
});
