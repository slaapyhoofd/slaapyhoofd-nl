import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as commentsService from '@/services/comments';
import { Comment } from '@/types/comment';

interface CommentModerationStats {
  pending: number;
  approved: number;
  spam: number;
}

interface CommentModerationContextValue {
  comments: Comment[];
  loading: boolean;
  filter: string;
  stats: CommentModerationStats;
  setFilter: (filter: string) => void;
  loadComments: () => Promise<void>;
  handleStatusChange: (id: number, status: string) => Promise<void>;
  handleDelete: (id: number) => Promise<void>;
}

const CommentModerationContext = createContext<CommentModerationContextValue | undefined>(
  undefined,
);

// eslint-disable-next-line react-refresh/only-export-components
export function useCommentModeration() {
  const context = useContext(CommentModerationContext);
  if (!context) {
    throw new Error('useCommentModeration must be used within CommentModerationProvider');
  }
  return context;
}

interface CommentModerationProviderProps {
  children: ReactNode;
}

export function CommentModerationProvider({ children }: CommentModerationProviderProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [stats, setStats] = useState<CommentModerationStats>({
    pending: 0,
    approved: 0,
    spam: 0,
  });

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const filterStatus = filter === 'all' ? undefined : filter;
      const response = await commentsService.getAllComments(1, 50, filterStatus);
      if (response.success && response.data) {
        const allComments = response.data.comments || [];
        setComments(allComments);

        // Calculate stats from all comments
        calculateStats(allComments);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const calculateStats = (allComments: Comment[]) => {
    setStats({
      pending: allComments.filter(c => c.status === 'pending').length,
      approved: allComments.filter(c => c.status === 'approved').length,
      spam: allComments.filter(c => c.status === 'spam').length,
    });
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const response = await commentsService.updateCommentStatus(id, status);
      if (response.success) {
        await loadComments();
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      alert('Failed to update comment status');
      console.error('Status update error:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const response = await commentsService.deleteComment(id);
      if (response.success) {
        await loadComments();
      } else {
        throw new Error('Failed to delete comment');
      }
    } catch (error) {
      alert('Failed to delete comment');
      console.error('Delete error:', error);
    }
  };

  const value: CommentModerationContextValue = {
    comments,
    loading,
    filter,
    stats,
    setFilter,
    loadComments,
    handleStatusChange,
    handleDelete,
  };

  // React 19: render context directly — no .Provider needed
  return <CommentModerationContext value={value}>{children}</CommentModerationContext>;
}
