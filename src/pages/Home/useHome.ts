import { useState, useEffect, useTransition } from 'react';
import { getPublishedPosts } from '@/services/posts';
import { Post } from '@/types/post';
import { useCategories } from '@/contexts/CategoriesContext';

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
  const {
    selectedCategory, setSelectedCategory: ctxSetSelected, setCategories,
    selectedYear, setYears,
    selectedMonth, setAvailableMonths,
  } = useCategories();
  // startTransition marks category filtering as non-urgent, keeping UI responsive
  const [isPending, startTransition] = useTransition();

  const setSelectedCategory = (category: string) => {
    startTransition(() => ctxSetSelected(category));
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

  // Unique categories
  const categories = ['all', ...new Set(posts.filter(p => p.category).map(p => p.category as string))];

  // Sync categories to context
  useEffect(() => {
    setCategories(categories);
  }, [posts]);

  // Sync available years to context
  useEffect(() => {
    const years = [...new Set(
      posts.map(p => new Date(p.published_at || p.created_at).getFullYear())
    )].sort((a, b) => b - a);
    setYears(years);
  }, [posts]);

  // Sync available months for selected year to context
  useEffect(() => {
    if (selectedYear === null) {
      setAvailableMonths([]);
      return;
    }
    const months = [...new Set(
      posts
        .filter(p => new Date(p.published_at || p.created_at).getFullYear() === selectedYear)
        .map(p => new Date(p.published_at || p.created_at).getMonth())
    )].sort((a, b) => a - b);
    setAvailableMonths(months);
  }, [selectedYear, posts]);

  // Filter posts by category + year + month
  let filteredPosts = selectedCategory === 'all'
    ? posts
    : posts.filter(p => p.category === selectedCategory);

  if (selectedYear !== null) {
    filteredPosts = filteredPosts.filter(p =>
      new Date(p.published_at || p.created_at).getFullYear() === selectedYear
    );
  }

  if (selectedYear !== null && selectedMonth !== null) {
    filteredPosts = filteredPosts.filter(p =>
      new Date(p.published_at || p.created_at).getMonth() === selectedMonth
    );
  }

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
