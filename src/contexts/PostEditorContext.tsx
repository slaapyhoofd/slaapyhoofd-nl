import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as postsService from '@/services/posts';
import { PostCreateInput, Post } from '@/types/post';
import { slugify } from '@/utils/slugify';
import { validateRequired } from '@/utils/validation';
import { generateExcerpt } from '@/utils/markdown';

interface PostEditorContextType {
  // State
  title: string;
  slug: string;
  excerpt: string;
  markdownContent: string;
  category: string;
  tags: string;
  featuredImage: string;
  status: 'draft' | 'published';
  showPreview: boolean;
  loading: boolean;
  saving: boolean;
  error: string;
  isEditing: boolean;

  // Actions
  setTitle: (value: string) => void;
  setSlug: (value: string) => void;
  setExcerpt: (value: string) => void;
  setMarkdownContent: (value: string) => void;
  setCategory: (value: string) => void;
  setTags: (value: string) => void;
  setFeaturedImage: (value: string) => void;
  setStatus: (value: 'draft' | 'published') => void;
  setShowPreview: (value: boolean) => void;
  handleSaveDraft: () => Promise<void>;
  handlePublish: () => Promise<void>;
  handleCancel: () => void;
}

const PostEditorContext = createContext<PostEditorContextType | undefined>(undefined);

export function PostEditorProvider({ children }: { children: ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuallySet, setSlugManuallySet] = useState(false);
  const [excerpt, setExcerpt] = useState('');
  const [markdownContent, setMarkdownContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  
  // UI state
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Auto-generate slug from title when not manually set
  useEffect(() => {
    if (!slugManuallySet && !isEditing) {
      setSlug(slugify(title));
    }
  }, [title, slugManuallySet, isEditing]);

  const handleSetSlug = (value: string) => {
    setSlugManuallySet(value !== '');
    setSlug(value);
  };

  // Load post if editing
  useEffect(() => {
    if (isEditing && id) {
      loadPost(parseInt(id));
    }
  }, [id, isEditing]);

  const loadPost = async (postId: number) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await postsService.getPost(postId);
      if (response.success && response.data) {
        const post: Post = response.data;
        setTitle(post.title);
        setSlug(post.slug);
        setExcerpt(post.excerpt || '');
        setMarkdownContent(post.markdown_content);
        setCategory(post.category || '');
        setTags(post.tags || '');
        setFeaturedImage(post.featured_image || '');
        setStatus(post.status as 'draft' | 'published');
      } else {
        setError('Failed to load post');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const titleCheck = validateRequired(title, 'Title');
    if (!titleCheck.valid) { setError(titleCheck.error); return false; }

    const contentCheck = validateRequired(markdownContent, 'Content');
    if (!contentCheck.valid) { setError(contentCheck.error); return false; }

    return true;
  };

  const buildPostData = (publishNow: boolean): PostCreateInput => {
    const postData: PostCreateInput = {
      title: title.trim(),
      markdown_content: markdownContent.trim(),
      excerpt: excerpt.trim() || generateExcerpt(markdownContent),
      category: category.trim() || undefined,
      tags: tags.trim() || undefined,
      featured_image: featuredImage.trim() || undefined,
      status: publishNow ? 'published' : status,
    };

    if (slug.trim()) {
      postData.slug = slug.trim();
    }

    return postData;
  };

  const savePost = async (publishNow = false) => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError('');

    const postData = buildPostData(publishNow);

    try {
      let response;
      if (isEditing && id) {
        response = await postsService.updatePost(parseInt(id), postData);
      } else {
        response = await postsService.createPost(postData);
      }

      if (response.success) {
        navigate('/admin/posts');
      } else {
        setError(response.error || 'Failed to save post');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = () => savePost(false);
  const handlePublish = () => savePost(true);
  const handleCancel = () => navigate('/admin/posts');

  const value: PostEditorContextType = {
    title,
    slug,
    excerpt,
    markdownContent,
    category,
    tags,
    featuredImage,
    status,
    showPreview,
    loading,
    saving,
    error,
    isEditing,
    setTitle,
    setSlug: handleSetSlug,
    setExcerpt,
    setMarkdownContent,
    setCategory,
    setTags,
    setFeaturedImage,
    setStatus,
    setShowPreview,
    handleSaveDraft,
    handlePublish,
    handleCancel,
  };

  // React 19: render context directly — no .Provider needed
  return (
    <PostEditorContext value={value}>
      {children}
    </PostEditorContext>
  );
}

export function usePostEditor() {
  const context = useContext(PostEditorContext);
  if (!context) {
    throw new Error('usePostEditor must be used within PostEditorProvider');
  }
  return context;
}
