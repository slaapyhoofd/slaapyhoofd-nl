import { lazy, Suspense, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CategoriesProvider } from './contexts/CategoriesContext';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import AdminLayout from './components/AdminLayout/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Home from './pages/Home';
import BlogPost from './pages/BlogPost';
import NotFound from './pages/NotFound';
import Login from './pages/Admin/Login';

// Lazy-load the entire admin bundle — keeps the public bundle lean
const Dashboard = lazy(() => import('./pages/Admin/Dashboard'));
const PostsList = lazy(() => import('./pages/Admin/PostsList'));
const PostEditor = lazy(() => import('./pages/Admin/PostEditor'));
const CommentModeration = lazy(() => import('./pages/Admin/CommentModeration'));

const AdminFallback = () => (
  <div style={{ padding: '2rem' }}>
    <div role="status" className="loading-container">
      <div className="loading" aria-hidden="true"></div>
      <p>Loading admin...</p>
    </div>
  </div>
);

/** Announces SPA route changes to screen readers (WCAG 4.1.3) */
function RouteAnnouncer() {
  const location = useLocation();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (ref.current) {
        ref.current.textContent = `Navigated to ${document.title}`;
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  );
}

/** Public layout: Header + main content + Footer */
function PublicLayout() {
  return (
    <CategoriesProvider>
      <div className="app">
        <Header />
        <main id="main-content" className="main-content">
          <Outlet />
        </main>
        <Footer />
      </div>
    </CategoriesProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <RouteAnnouncer />
        <Routes>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/post/:slug" element={<BlogPost />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Admin login — standalone (no sidebar, no public header) */}
          <Route path="/admin/login" element={<Login />} />

          {/* Admin routes — sidebar layout */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<AdminFallback />}>
                  <Dashboard />
                </Suspense>
              }
            />
            <Route
              path="posts"
              element={
                <Suspense fallback={<AdminFallback />}>
                  <PostsList />
                </Suspense>
              }
            />
            <Route
              path="posts/new"
              element={
                <Suspense fallback={<AdminFallback />}>
                  <PostEditor />
                </Suspense>
              }
            />
            <Route
              path="posts/edit/:id"
              element={
                <Suspense fallback={<AdminFallback />}>
                  <PostEditor />
                </Suspense>
              }
            />
            <Route
              path="comments"
              element={
                <Suspense fallback={<AdminFallback />}>
                  <CommentModeration />
                </Suspense>
              }
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
