import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCommentModeration, CommentModerationProvider } from './CommentModerationContext';
import * as commentsService from '@/services/comments';

vi.mock('@/services/comments');

describe('CommentModerationContext & useCommentModeration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw error when used outside provider', () => {
    expect(() => {
      renderHook(() => useCommentModeration());
    }).toThrow('useCommentModeration must be used within CommentModerationProvider');
  });

  it('should initialize with empty comments and all filter', () => {
    vi.mocked(commentsService.getAllComments).mockResolvedValue({
      success: true,
      data: { comments: [] },
    } as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CommentModerationProvider>{children}</CommentModerationProvider>
    );

    const { result } = renderHook(() => useCommentModeration(), { wrapper });

    expect(result.current.comments).toEqual([]);
    expect(result.current.filter).toBe('all');
    expect(result.current.stats).toEqual({
      pending: 0,
      approved: 0,
      spam: 0,
    });
  });

  it('should load comments on mount', async () => {
    const mockComments = [
      {
        id: 1,
        post_id: 1,
        author_name: 'John',
        content: 'Great post',
        status: 'pending',
      } as any,
    ];

    vi.mocked(commentsService.getAllComments).mockResolvedValue({
      success: true,
      data: { comments: mockComments },
    } as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CommentModerationProvider>{children}</CommentModerationProvider>
    );

    const { result } = renderHook(() => useCommentModeration(), { wrapper });

    await waitFor(() => {
      expect(result.current.comments).toHaveLength(1);
    });

    expect(commentsService.getAllComments).toHaveBeenCalled();
  });

  it('should calculate stats correctly', async () => {
    const mockComments = [
      { id: 1, status: 'pending' } as any,
      { id: 2, status: 'pending' } as any,
      { id: 3, status: 'approved' } as any,
      { id: 4, status: 'spam' } as any,
    ];

    vi.mocked(commentsService.getAllComments).mockResolvedValue({
      success: true,
      data: { comments: mockComments },
    } as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CommentModerationProvider>{children}</CommentModerationProvider>
    );

    const { result } = renderHook(() => useCommentModeration(), { wrapper });

    await waitFor(() => {
      expect(result.current.stats).toEqual({
        pending: 2,
        approved: 1,
        spam: 1,
      });
    });
  });

  it('should set filter and reload comments', async () => {
    vi.mocked(commentsService.getAllComments).mockResolvedValue({
      success: true,
      data: { comments: [] },
    } as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CommentModerationProvider>{children}</CommentModerationProvider>
    );

    const { result } = renderHook(() => useCommentModeration(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      result.current.setFilter('pending');
    });

    await waitFor(() => {
      expect(result.current.filter).toBe('pending');
    });

    expect(commentsService.getAllComments).toHaveBeenCalledWith(1, 50, 'pending');
  });

  it('should handle status change', async () => {
    const mockComments = [
      { id: 1, status: 'pending' } as any,
    ];

    vi.mocked(commentsService.getAllComments).mockResolvedValue({
      success: true,
      data: { comments: mockComments },
    } as any);

    vi.mocked(commentsService.updateCommentStatus).mockResolvedValue({
      success: true,
    } as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CommentModerationProvider>{children}</CommentModerationProvider>
    );

    const { result } = renderHook(() => useCommentModeration(), { wrapper });

    await waitFor(() => {
      expect(result.current.comments).toHaveLength(1);
    });

    await act(async () => {
      await result.current.handleStatusChange(1, 'approved');
    });

    expect(commentsService.updateCommentStatus).toHaveBeenCalledWith(1, 'approved');
  });

  it('should handle delete with confirmation', async () => {
    const mockComments = [
      { id: 1, status: 'spam' } as any,
    ];

    vi.mocked(commentsService.getAllComments).mockResolvedValue({
      success: true,
      data: { comments: mockComments },
    } as any);

    vi.mocked(commentsService.deleteComment).mockResolvedValue({
      success: true,
    } as any);

    // Mock confirm dialog
    global.confirm = vi.fn(() => true);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CommentModerationProvider>{children}</CommentModerationProvider>
    );

    const { result } = renderHook(() => useCommentModeration(), { wrapper });

    await waitFor(() => {
      expect(result.current.comments).toHaveLength(1);
    });

    await act(async () => {
      await result.current.handleDelete(1);
    });

    expect(global.confirm).toHaveBeenCalled();
    expect(commentsService.deleteComment).toHaveBeenCalledWith(1);
  });

  it('should not delete comment when user cancels', async () => {
    const mockComments = [
      { id: 1, status: 'spam' } as any,
    ];

    vi.mocked(commentsService.getAllComments).mockResolvedValue({
      success: true,
      data: { comments: mockComments },
    } as any);

    global.confirm = vi.fn(() => false);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CommentModerationProvider>{children}</CommentModerationProvider>
    );

    const { result } = renderHook(() => useCommentModeration(), { wrapper });

    await waitFor(() => {
      expect(result.current.comments).toHaveLength(1);
    });

    await act(async () => {
      await result.current.handleDelete(1);
    });

    expect(commentsService.deleteComment).not.toHaveBeenCalled();
  });

  it('should handle loading state', async () => {
    vi.mocked(commentsService.getAllComments).mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(
            () =>
              resolve({
                success: true,
                data: { comments: [] },
              } as any),
            100
          )
        )
    );

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CommentModerationProvider>{children}</CommentModerationProvider>
    );

    const { result } = renderHook(() => useCommentModeration(), { wrapper });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });
});
