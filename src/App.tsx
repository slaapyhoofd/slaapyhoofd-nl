import { lazy, Suspense, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
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
  <div className="container">
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Header />
          <RouteAnnouncer />
          <main id="main-content" className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/post/:slug" element={<BlogPost />} />
              <Route path="/admin/login" element={<Login />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<AdminFallback />}>
                      <Dashboard />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/posts"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<AdminFallback />}>
                      <PostsList />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/posts/new"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<AdminFallback />}>
                      <PostEditor />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/posts/edit/:id"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<AdminFallback />}>
                      <PostEditor />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/comments"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<AdminFallback />}>
                      <CommentModeration />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
