import { useState, useEffect } from 'react';
import { getPostBySlug } from '@/services/posts';
import { Post } from '@/types/post';

interface UseBlogPostReturn {
  post: Post | null;
  loading: boolean;
  error: string;
}

export function useBlogPost(slug: string | undefined): UseBlogPostReturn {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (slug) {
      loadPost(slug);
    }
  }, [slug]);

  const loadPost = async (postSlug: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await getPostBySlug(postSlug);
      if (response.success && response.data) {
        setPost(response.data);
      } else {
        setError('Post not found');
      }
    } catch (err) {
      console.error('Error loading post:', err);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  return {
    post,
    loading,
    error,
  };
}
