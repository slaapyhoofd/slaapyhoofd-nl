import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import * as postsService from '@/services/posts';
import * as commentsService from '@/services/comments';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    pendingComments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setError(null);
      const [allRes, publishedRes, draftRes, commentsRes] = await Promise.allSettled([
        postsService.getPosts(1, 1),
        postsService.getPosts(1, 1, 'published'),
        postsService.getPosts(1, 1, 'draft'),
        commentsService.getAllComments(1, 1, 'pending'),
      ]);
      setStats({
        totalPosts:       allRes.status === 'fulfilled'      ? (allRes.value.data?.pagination?.total      ?? 0) : 0,
        publishedPosts:   publishedRes.status === 'fulfilled' ? (publishedRes.value.data?.pagination?.total ?? 0) : 0,
        draftPosts:       draftRes.status === 'fulfilled'     ? (draftRes.value.data?.pagination?.total     ?? 0) : 0,
        pendingComments:  commentsRes.status === 'fulfilled'  ? (commentsRes.value.data?.pagination?.total  ?? 0) : 0,
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
      setError('Could not load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      {loading ? (
        <div className="dashboard-stats-belt">
          <div role="status" style={{ padding: '2rem', color: 'rgba(243,237,226,.5)' }}>
            <div className="loading" aria-hidden="true" style={{ borderTopColor: 'var(--color-sage)' }}></div>
          </div>
        </div>
      ) : error ? (
        <div className="dashboard-stats-belt">
          <p role="alert" style={{ color: 'var(--color-coral)', padding: '2rem' }}>{error}</p>
        </div>
      ) : (
        <div className="dashboard-stats-belt">
          <div className="stat-cell">
            <div className="stat-number">{stats.totalPosts}</div>
            <div className="stat-label">Total Posts</div>
          </div>
          <div className="stat-cell">
            <div className="stat-number stat-number--sage">{stats.publishedPosts}</div>
            <div className="stat-label">Published</div>
          </div>
          <div className="stat-cell">
            <div className="stat-number stat-number--dim">{stats.draftPosts}</div>
            <div className="stat-label">Drafts</div>
          </div>
          <div className="stat-cell stat-cell--last">
            <div className="stat-number stat-number--dim">{stats.pendingComments}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
      )}

      <div className="dashboard-body">
        <div className="quick-actions-label">Quick Actions</div>
        <div className="quick-actions-grid">
          <button
            className="action-card action-card--primary"
            onClick={() => navigate('/admin/posts/new')}
          >
            <span className="action-card-eyebrow">New</span>
            <span className="action-card-title">Create Post</span>
          </button>
          <button
            className="action-card"
            onClick={() => navigate('/admin/posts')}
          >
            <span className="action-card-eyebrow">Manage</span>
            <span className="action-card-title">All Posts</span>
          </button>
          <button
            className="action-card"
            onClick={() => navigate('/admin/comments')}
          >
            <span className="action-card-eyebrow">Review</span>
            <span className="action-card-title">Comments</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
