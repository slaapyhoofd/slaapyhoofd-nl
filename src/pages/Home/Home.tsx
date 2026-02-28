import { useHome } from './useHome';
import PostCard from '@/components/PostCard';
import './Home.css';

function Home() {
  const {
    loading,
    error,
    selectedCategory,
    categories,
    filteredPosts,
    isPending,
    setSelectedCategory,
    loadPosts,
  } = useHome();

  if (loading) {
    return (
      <div className="container">
        <div role="status" className="home-loading">
          <div className="loading" aria-hidden="true"></div>
          <p>Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="home-error">
          <p>{error}</p>
          <button onClick={loadPosts} className="btn btn-primary">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="home">
        <section className="hero">
          <h1>Welcome to Slaapyhoofd</h1>
          <p className="hero-description">
            Exploring programming, LEGO, traveling, DIY, Home Assistant, home lab, and green energy
          </p>
        </section>

        {filteredPosts.length > 0 && categories.length > 1 && (
          <section className="categories-filter" aria-label="Filter by category">
            {categories.map((category) => (
              <button
                key={category}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                aria-pressed={selectedCategory === category}
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'all' ? 'All' : category}
              </button>
            ))}
          </section>
        )}

        <section className="posts-section" aria-labelledby="posts-section-heading" aria-busy={isPending}>
          <h2 id="posts-section-heading" className="sr-only">Posts</h2>
          {isPending && <div className="posts-filtering" aria-live="polite">Filtering...</div>}
          {filteredPosts.length === 0 ? (
            <div className="no-posts">
              <p>
                {selectedCategory === 'all' 
                  ? 'No posts yet. Check back soon!' 
                  : `No posts in "${selectedCategory}" category.`}
              </p>
            </div>
          ) : (
            <div className="posts-grid">
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Home;
