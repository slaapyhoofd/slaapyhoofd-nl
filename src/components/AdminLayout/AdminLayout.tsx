import { useCallback } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import './AdminLayout.css';

function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/admin/login');
  }, [logout, navigate]);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <Link to="/" className="admin-brand-name">
            slaapyhoofd<span className="admin-brand-tld">.nl</span>
          </Link>
          <span className="admin-brand-label">Admin</span>
        </div>

        <nav className="admin-sidebar-nav" aria-label="Admin navigation">
          <Link
            to="/admin"
            className={`admin-nav-item${location.pathname === '/admin' ? ' admin-nav-item--active' : ''}`}
          >
            Dashboard
          </Link>
          <Link
            to="/admin/posts"
            className={`admin-nav-item${isActive('/admin/posts') ? ' admin-nav-item--active' : ''}`}
          >
            Posts
          </Link>
          <Link
            to="/admin/comments"
            className={`admin-nav-item${isActive('/admin/comments') ? ' admin-nav-item--active' : ''}`}
          >
            Comments
          </Link>
        </nav>

        <div className="admin-sidebar-footer">
          <span className="admin-sidebar-user">{user?.username}</span>
          <button
            className="admin-logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
