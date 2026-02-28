import { useState, useEffect, useTransition } from 'react';
import { getPublishedPosts } from '@/services/posts';
import { Post } from '@/types/post';

interface UseHomeReturn {
  posts: Post[];
  loading: boolean;
  error: string;
  selectedCategory: string;
  categories: string[];
  filteredPosts: Post[];
  isPending: boolean;
  setSelectedCategory: (category: string) => void;
  loadPosts: () => Promise<void>;
}

export function useHome(): UseHomeReturn {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedCategory, setSelectedCategoryRaw] = useState<string>('all');
  // startTransition marks category filtering as non-urgent, keeping UI responsive
  const [isPending, startTransition] = useTransition();

  const setSelectedCategory = (category: string) => {
    startTransition(() => setSelectedCategoryRaw(category));
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getPublishedPosts(1, 50);
      if (response.success && response.data) {
        setPosts(response.data.posts || []);
      } else {
        setError('Failed to load posts');
      }
    } catch (err) {
      console.error('Error loading posts:', err);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories
  const categories = ['all', ...new Set(posts.filter(p => p.category).map(p => p.category as string))];

  // Filter posts by category
  const filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter(p => p.category === selectedCategory);

  return {
    posts,
    loading,
    error,
    selectedCategory,
    categories,
    filteredPosts,
    isPending,
    setSelectedCategory,
    loadPosts,
  };
}
