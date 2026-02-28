import { renderHook, act, waitFor } from '@testing-library/react';
import { CategoriesProvider } from '@/contexts/CategoriesContext';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useHome } from './useHome';
import * as postsService from '@/services/posts';

vi.mock('@/services/posts');

describe('useHome hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    vi.mocked(postsService.getPublishedPosts).mockResolvedValue({
      success: true,
      data: { posts: [] },
    } as any);

    const { result } = renderHook(() => useHome(), { wrapper: CategoriesProvider });

    expect(result.current.loading).toBe(true);
    expect(result.current.posts).toEqual([]);
    expect(result.current.error).toBe('');
  });

  it('should load published posts on mount', async () => {
    const mockPosts = [
      {
        id: 1,
        slug: 'post-1',
        title: 'Post 1',
        category: 'Programming',
        status: 'published',
      } as any,
      {
        id: 2,
        slug: 'post-2',
        title: 'Post 2',
        category: 'Travel',
        status: 'published',
      } as any,
    ];

    vi.mocked(postsService.getPublishedPosts).mockResolvedValue({
      success: true,
      data: { posts: mockPosts },
    } as any);

    const { result } = renderHook(() => useHome(), { wrapper: CategoriesProvider });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.posts).toEqual(mockPosts);
    expect(result.current.error).toBe('');
    expect(postsService.getPublishedPosts).toHaveBeenCalledWith(1, 50);
  });

  it('should extract unique categories from posts', async () => {
    const mockPosts = [
      { id: 1, category: 'Programming' } as any,
      { id: 2, category: 'Travel' } as any,
      { id: 3, category: 'Programming' } as any,
      { id: 4, category: null } as any,
    ];

    vi.mocked(postsService.getPublishedPosts).mockResolvedValue({
      success: true,
      data: { posts: mockPosts },
    } as any);

    const { result } = renderHook(() => useHome(), { wrapper: CategoriesProvider });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.categories).toContain('all');
    expect(result.current.categories).toContain('Programming');
    expect(result.current.categories).toContain('Travel');
    expect(result.current.categories.length).toBe(3);
  });

  it('should filter posts by category', async () => {
    const mockPosts = [
      { id: 1, title: 'Programming Post', category: 'Programming' } as any,
      { id: 2, title: 'Travel Post', category: 'Travel' } as any,
      { id: 3, title: 'Another Programming', category: 'Programming' } as any,
    ];

    vi.mocked(postsService.getPublishedPosts).mockResolvedValue({
      success: true,
      data: { posts: mockPosts },
    } as any);

    const { result } = renderHook(() => useHome(), { wrapper: CategoriesProvider });

    await waitFor(() => {
      expect(result.current.posts.length).toBe(3);
    });

    expect(result.current.filteredPosts.length).toBe(3);

    act(() => {
      result.current.setSelectedCategory('Programming');
    });

    expect(result.current.selectedCategory).toBe('Programming');
    expect(result.current.filteredPosts.length).toBe(2);
    expect(result.current.filteredPosts.every(p => p.category === 'Programming')).toBe(true);
  });

  it('should return all posts when category is "all"', async () => {
    const mockPosts = [
      { id: 1, category: 'Programming' } as any,
      { id: 2, category: 'Travel' } as any,
      { id: 3, category: 'DIY' } as any,
    ];

    vi.mocked(postsService.getPublishedPosts).mockResolvedValue({
      success: true,
      data: { posts: mockPosts },
    } as any);

    const { result } = renderHook(() => useHome(), { wrapper: CategoriesProvider });

    await waitFor(() => {
      expect(result.current.posts.length).toBe(3);
    });

    act(() => {
      result.current.setSelectedCategory('Programming');
    });

    expect(result.current.filteredPosts.length).toBe(1);

    act(() => {
      result.current.setSelectedCategory('all');
    });

    expect(result.current.filteredPosts.length).toBe(3);
  });

  it('should handle loading error', async () => {
    vi.mocked(postsService.getPublishedPosts).mockRejectedValue(
      new Error('Network error')
    );

    const { result } = renderHook(() => useHome(), { wrapper: CategoriesProvider });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to load posts. Please try again later.');
    expect(result.current.posts).toEqual([]);
  });

  it('should handle api failure response', async () => {
    vi.mocked(postsService.getPublishedPosts).mockResolvedValue({
      success: false,
      error: 'Server error',
    } as any);

    const { result } = renderHook(() => useHome(), { wrapper: CategoriesProvider });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to load posts');
    expect(result.current.posts).toEqual([]);
  });

  it('should reload posts', async () => {
    const mockPosts = [{ id: 1, title: 'Post 1' } as any];

    vi.mocked(postsService.getPublishedPosts).mockResolvedValue({
      success: true,
      data: { posts: mockPosts },
    } as any);

    const { result } = renderHook(() => useHome(), { wrapper: CategoriesProvider });

    await waitFor(() => {
      expect(result.current.posts.length).toBe(1);
    });

    const callCount = vi.mocked(postsService.getPublishedPosts).mock.calls.length;

    await act(async () => {
      await result.current.loadPosts();
    });

    expect(vi.mocked(postsService.getPublishedPosts).mock.calls.length).toBeGreaterThan(callCount);
  });

  it('should clear error on successful reload', async () => {
    vi.mocked(postsService.getPublishedPosts)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        success: true,
        data: { posts: [{ id: 1, title: 'Post 1' }] },
      } as any);

    const { result } = renderHook(() => useHome(), { wrapper: CategoriesProvider });

    await waitFor(() => {
      expect(result.current.error).toBe('Failed to load posts. Please try again later.');
    });

    await act(async () => {
      await result.current.loadPosts();
    });

    expect(result.current.error).toBe('');
    expect(result.current.posts.length).toBe(1);
  });

  it('should handle empty posts response', async () => {
    vi.mocked(postsService.getPublishedPosts).mockResolvedValue({
      success: true,
      data: { posts: [] },
    } as any);

    const { result } = renderHook(() => useHome(), { wrapper: CategoriesProvider });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.posts).toEqual([]);
    expect(result.current.filteredPosts).toEqual([]);
    expect(result.current.categories).toEqual(['all']);
  });

  it('should handle null posts in response', async () => {
    vi.mocked(postsService.getPublishedPosts).mockResolvedValue({
      success: true,
      data: { posts: null },
    } as any);

    const { result } = renderHook(() => useHome(), { wrapper: CategoriesProvider });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.posts).toEqual([]);
  });

  it('should update filtered posts when category changes', async () => {
    const mockPosts = [
      { id: 1, category: 'A' } as any,
      { id: 2, category: 'B' } as any,
      { id: 3, category: 'C' } as any,
    ];

    vi.mocked(postsService.getPublishedPosts).mockResolvedValue({
      success: true,
      data: { posts: mockPosts },
    } as any);

    const { result } = renderHook(() => useHome(), { wrapper: CategoriesProvider });

    await waitFor(() => {
      expect(result.current.posts.length).toBe(3);
    });

    act(() => {
      result.current.setSelectedCategory('A');
    });
    expect(result.current.filteredPosts.length).toBe(1);

    act(() => {
      result.current.setSelectedCategory('B');
    });
    expect(result.current.filteredPosts.length).toBe(1);

    act(() => {
      result.current.setSelectedCategory('C');
    });
    expect(result.current.filteredPosts.length).toBe(1);

    act(() => {
      result.current.setSelectedCategory('all');
    });
    expect(result.current.filteredPosts.length).toBe(3);
  });
});
