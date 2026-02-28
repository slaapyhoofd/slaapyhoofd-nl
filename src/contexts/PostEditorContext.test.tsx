import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostEditorProvider, usePostEditor } from './PostEditorContext';
import * as postsService from '@/services/posts';
import { useNavigate, useParams } from 'react-router-dom';

vi.mock('@/services/posts');
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  useParams: vi.fn(),
  BrowserRouter: ({ children }: any) => children,
}));

describe('PostEditorContext & usePostEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useParams).mockReturnValue({} as any);
    vi.mocked(useNavigate).mockReturnValue(vi.fn());
  });

  it('should throw error when used outside provider', () => {
    expect(() => {
      renderHook(() => usePostEditor());
    }).toThrow('usePostEditor must be used within PostEditorProvider');
  });

  it('should initialize with empty form state for new post', () => {
    const mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(useParams).mockReturnValue({} as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PostEditorProvider>{children}</PostEditorProvider>
    );

    const { result } = renderHook(() => usePostEditor(), { wrapper });

    expect(result.current.title).toBe('');
    expect(result.current.slug).toBe('');
    expect(result.current.excerpt).toBe('');
    expect(result.current.markdownContent).toBe('');
    expect(result.current.status).toBe('draft');
    expect(result.current.loading).toBe(false);
    expect(result.current.isEditing).toBe(false);
  });

  it('should update form fields', () => {
    const mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PostEditorProvider>{children}</PostEditorProvider>
    );

    const { result } = renderHook(() => usePostEditor(), { wrapper });

    act(() => {
      result.current.setTitle('New Blog Post');
      result.current.setSlug('new-blog-post');
      result.current.setMarkdownContent('# Hello World');
      result.current.setCategory('Programming');
      result.current.setStatus('published');
    });

    expect(result.current.title).toBe('New Blog Post');
    expect(result.current.slug).toBe('new-blog-post');
    expect(result.current.markdownContent).toBe('# Hello World');
    expect(result.current.category).toBe('Programming');
    expect(result.current.status).toBe('published');
  });

  it('should toggle preview mode', () => {
    const mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PostEditorProvider>{children}</PostEditorProvider>
    );

    const { result } = renderHook(() => usePostEditor(), { wrapper });

    expect(result.current.showPreview).toBe(false);

    act(() => {
      result.current.setShowPreview(true);
    });

    expect(result.current.showPreview).toBe(true);
  });

  it('should validate required fields', async () => {
    const mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    vi.mocked(postsService.createPost).mockResolvedValue({
      success: true,
      data: { id: 1 },
    } as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PostEditorProvider>{children}</PostEditorProvider>
    );

    const { result } = renderHook(() => usePostEditor(), { wrapper });

    // Try to save without required fields
    await act(async () => {
      await result.current.handleSaveDraft();
    });

    expect(result.current.error).toContain('Title is required');
  });

  it('should save draft successfully', async () => {
    const mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    vi.mocked(postsService.createPost).mockResolvedValue({
      success: true,
      data: { id: 1 },
    } as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PostEditorProvider>{children}</PostEditorProvider>
    );

    const { result } = renderHook(() => usePostEditor(), { wrapper });

    act(() => {
      result.current.setTitle('Test Post');
      result.current.setMarkdownContent('# Test Content');
    });

    await act(async () => {
      await result.current.handleSaveDraft();
    });

    expect(postsService.createPost).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Post',
        markdown_content: '# Test Content',
        status: 'draft',
      }),
    );

    expect(mockNavigate).toHaveBeenCalledWith('/admin/posts');
  });

  it('should publish post', async () => {
    const mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    vi.mocked(postsService.createPost).mockResolvedValue({
      success: true,
      data: { id: 1 },
    } as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PostEditorProvider>{children}</PostEditorProvider>
    );

    const { result } = renderHook(() => usePostEditor(), { wrapper });

    act(() => {
      result.current.setTitle('Test Post');
      result.current.setMarkdownContent('# Test Content');
    });

    await act(async () => {
      await result.current.handlePublish();
    });

    expect(postsService.createPost).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'published',
      }),
    );
  });

  it('should update post when editing', async () => {
    const mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(useParams).mockReturnValue({ id: '123' } as any);

    const mockPost = {
      id: 123,
      title: 'Existing Post',
      slug: 'existing-post',
      markdown_content: 'Old content',
      status: 'draft',
    } as any;

    vi.mocked(postsService.getPost).mockResolvedValue({
      success: true,
      data: mockPost,
    } as any);

    vi.mocked(postsService.updatePost).mockResolvedValue({
      success: true,
      data: mockPost,
    } as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PostEditorProvider>{children}</PostEditorProvider>
    );

    const { result } = renderHook(() => usePostEditor(), { wrapper });

    await waitFor(() => {
      expect(result.current.isEditing).toBe(true);
    });

    await waitFor(() => {
      expect(result.current.title).toBe('Existing Post');
    });

    act(() => {
      result.current.setTitle('Updated Title');
    });

    await act(async () => {
      await result.current.handleSaveDraft();
    });

    expect(postsService.updatePost).toHaveBeenCalledWith(
      123,
      expect.objectContaining({
        title: 'Updated Title',
      }),
    );
  });

  it('should handle save error', async () => {
    const mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    vi.mocked(postsService.createPost).mockResolvedValue({
      success: false,
      error: 'Slug already exists',
    } as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PostEditorProvider>{children}</PostEditorProvider>
    );

    const { result } = renderHook(() => usePostEditor(), { wrapper });

    act(() => {
      result.current.setTitle('Test Post');
      result.current.setMarkdownContent('# Test Content');
    });

    await act(async () => {
      await result.current.handleSaveDraft();
    });

    expect(result.current.error).toBe('Slug already exists');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should cancel and navigate back', () => {
    const mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PostEditorProvider>{children}</PostEditorProvider>
    );

    const { result } = renderHook(() => usePostEditor(), { wrapper });

    act(() => {
      result.current.handleCancel();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/admin/posts');
  });

  it('should trim whitespace from form data', async () => {
    const mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(useParams).mockReturnValue({} as any);

    vi.mocked(postsService.createPost).mockResolvedValue({
      success: true,
      data: { id: 1 },
    } as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PostEditorProvider>{children}</PostEditorProvider>
    );

    const { result } = renderHook(() => usePostEditor(), { wrapper });

    await waitFor(() => {
      expect(result.current).toBeDefined();
    });

    act(() => {
      result.current.setTitle('  Test Post  ');
      result.current.setMarkdownContent('  # Test Content  ');
      result.current.setCategory('  Programming  ');
    });

    await act(async () => {
      await result.current.handleSaveDraft();
    });

    expect(postsService.createPost).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Post',
        markdown_content: '# Test Content',
        category: 'Programming',
      }),
    );
  });
});
