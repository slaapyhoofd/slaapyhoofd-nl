import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useBlogPost } from './useBlogPost';
import * as postsService from '@/services/posts';

vi.mock('@/services/posts');

describe('useBlogPost hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useBlogPost('test-post'));

    expect(result.current.loading).toBe(true);
    expect(result.current.post).toBeNull();
    expect(result.current.error).toBe('');
  });

  it('should load post by slug', async () => {
    const mockPost = {
      id: 1,
      slug: 'test-post',
      title: 'Test Post',
      content: 'Test content',
      markdown_content: '# Test',
      status: 'published' as const,
    };

    vi.mocked(postsService.getPostBySlug).mockResolvedValue({
      success: true,
      data: mockPost,
    } as any);

    const { result } = renderHook(() => useBlogPost('test-post'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.post).toEqual(mockPost);
    expect(result.current.error).toBe('');
    expect(postsService.getPostBySlug).toHaveBeenCalledWith('test-post');
  });

  it('should handle post not found', async () => {
    vi.mocked(postsService.getPostBySlug).mockResolvedValue({
      success: false,
      error: 'Not found',
    } as any);

    const { result } = renderHook(() => useBlogPost('nonexistent'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.post).toBeNull();
    expect(result.current.error).toBe('Post not found');
  });

  it('should handle loading error', async () => {
    vi.mocked(postsService.getPostBySlug).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useBlogPost('test-post'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.post).toBeNull();
    expect(result.current.error).toBe('Failed to load post');
  });

  it('should reload post when slug changes', async () => {
    const mockPost1 = {
      id: 1,
      slug: 'post-1',
      title: 'Post 1',
    } as any;

    const mockPost2 = {
      id: 2,
      slug: 'post-2',
      title: 'Post 2',
    } as any;

    vi.mocked(postsService.getPostBySlug)
      .mockResolvedValueOnce({ success: true, data: mockPost1 } as any)
      .mockResolvedValueOnce({ success: true, data: mockPost2 } as any);

    const { result, rerender } = renderHook(({ slug }) => useBlogPost(slug), {
      initialProps: { slug: 'post-1' },
    });

    await waitFor(() => {
      expect(result.current.post?.id).toBe(1);
    });

    rerender({ slug: 'post-2' });

    await waitFor(() => {
      expect(result.current.post?.id).toBe(2);
    });

    expect(postsService.getPostBySlug).toHaveBeenCalledWith('post-1');
    expect(postsService.getPostBySlug).toHaveBeenCalledWith('post-2');
  });

  it('should not load post if slug is undefined', () => {
    const { result } = renderHook(() => useBlogPost(undefined));

    expect(result.current.loading).toBe(true);
    expect(result.current.post).toBeNull();
    expect(postsService.getPostBySlug).not.toHaveBeenCalled();
  });

  it('should handle empty slug gracefully', () => {
    const { result } = renderHook(() => useBlogPost(''));

    expect(result.current.loading).toBe(true);
    expect(postsService.getPostBySlug).not.toHaveBeenCalled();
  });

  it('should clear error on successful reload', async () => {
    vi.mocked(postsService.getPostBySlug)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        success: true,
        data: { id: 1, slug: 'test', title: 'Test' },
      } as any);

    const { result, rerender } = renderHook(({ slug }) => useBlogPost(slug), {
      initialProps: { slug: 'test' },
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Failed to load post');
    });

    // Change slug to trigger reload
    rerender({ slug: 'test-new' });

    await waitFor(() => {
      expect(result.current.error).toBe('');
      expect(result.current.post).toBeDefined();
    });
  });
});
