import { useState, useEffect, useCallback } from 'react';
import * as postsService from '@/services/posts';
import { Post } from '@/types/post';

interface UsePostsListReturn {
  posts: Post[];
  loading: boolean;
  filter: string;
  setFilter: (filter: string) => void;
  loadPosts: () => Promise<void>;
  handleDelete: (id: number) => Promise<void>;
}

export function usePostsList(): UsePostsListReturn {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const filterStatus = filter === 'all' ? undefined : filter;
      const response = await postsService.getPosts(1, 50, filterStatus);
      if (response.success && response.data) {
        setPosts(response.data.posts || []);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const response = await postsService.deletePost(id);
      if (response.success) {
        await loadPosts();
      } else {
        throw new Error('Failed to delete post');
      }
    } catch (error) {
      alert('Failed to delete post');
      console.error('Delete error:', error);
    }
  };

  return {
    posts,
    loading,
    filter,
    setFilter,
    loadPosts,
    handleDelete,
  };
}
