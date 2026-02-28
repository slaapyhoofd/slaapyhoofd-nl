import { useHome } from './useHome';
import PostCard from '@/components/PostCard';
import PostFilters from '@/components/PostFilters';
import './Home.css';

function Home() {
  const {
    loading,
    error,
    filteredPosts,
    isPending,
    loadPosts,
  } = useHome();

  if (loading) {
    return (
      <div role="status" className="home-loading">
        <div className="loading" aria-hidden="true"></div>
        <p>Loading posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-error">
        <p>{error}</p>
        <button onClick={loadPosts} className="btn btn-primary">Try Again</button>
      </div>
    );
  }

  const [featuredPost, ...otherPosts] = filteredPosts;

  return (
    <div className="home">
      {/* Hero: pine bg, tagline left + PostFilters right */}
      <section className="hero">
        <div className="hero-tagline">
          <div className="hero-eyebrow">A Dutch developer's notebook</div>
          <h1 className="hero-title">Exploring ideas,<br />one post at a time.</h1>
        </div>

        <div className="hero-filters">
          <PostFilters mode="tabs" />
        </div>
      </section>

      {/* Posts grid */}
      <section className="posts-section" aria-labelledby="posts-section-heading" aria-busy={isPending}>
        <h2 id="posts-section-heading" className="sr-only">Posts</h2>
        {isPending && <div className="posts-filtering" aria-live="polite" role="status">Filtering...</div>}

        {filteredPosts.length === 0 ? (
          <div className="no-posts">
            <p>No posts match the selected filters.</p>
          </div>
        ) : (
          <div className="posts-grid">
            {/* Left: featured post */}
            <div className="posts-grid-featured">
              {featuredPost && <PostCard post={featuredPost} variant="featured" />}
            </div>

            {/* Right: secondary posts stacked */}
            <div className="posts-grid-secondary">
              {otherPosts.slice(0, 3).map((post) => (
                <PostCard key={post.id} post={post} variant="secondary" />
              ))}
            </div>
          </div>
        )}

        {/* Additional posts below the grid */}
        {filteredPosts.length > 4 && (
          <div className="posts-list">
            {filteredPosts.slice(4).map((post) => (
              <PostCard key={post.id} post={post} variant="secondary" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
