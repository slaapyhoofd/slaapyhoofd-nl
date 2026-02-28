import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import * as postsService from '@/services/posts';
import * as commentsService from '@/services/comments';
import './Dashboard.css';

function Dashboard() {
  const { user, logout } = useAuth();
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

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="container">
      <div className="dashboard">
        <header className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <div className="dashboard-actions">
            <span className="user-info">Welcome, {user?.username}</span>
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          {loading ? (
            <div role="status" className="loading-container">
              <div className="loading" aria-hidden="true"></div>
              <p>Loading stats...</p>
            </div>
          ) : error ? (
            <p role="alert" className="error-message">{error}</p>
          ) : (
            <>
              <div className="dashboard-grid">
                <div className="stat-card">
                  <h3>Total Posts</h3>
                  <p className="stat-number">{stats.totalPosts}</p>
                </div>
                <div className="stat-card">
                  <h3>Published</h3>
                  <p className="stat-number">{stats.publishedPosts}</p>
                </div>
                <div className="stat-card">
                  <h3>Drafts</h3>
                  <p className="stat-number">{stats.draftPosts}</p>
                </div>
                <div className="stat-card">
                  <h3>Pending Comments</h3>
                  <p className="stat-number">{stats.pendingComments}</p>
                </div>
              </div>

              <div className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="action-buttons">
                  <button className="btn btn-primary" onClick={() => navigate('/admin/posts/new')}>
                    Create New Post
                  </button>
                  <button className="btn btn-secondary" onClick={() => navigate('/admin/posts')}>
                    Manage Posts
                  </button>
                  <button className="btn btn-secondary" onClick={() => navigate('/admin/comments')}>
                    Moderate Comments
                  </button>
                </div>
              </div>

              <div className="recent-activity">
                <h2>Recent Activity</h2>
                <p className="text-center" style={{ color: 'var(--color-text-light)', padding: 'var(--spacing-xl)' }}>
                  No recent activity
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
