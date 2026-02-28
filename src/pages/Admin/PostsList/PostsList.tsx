import { Link } from 'react-router-dom';
import { usePostsList } from './usePostsList';
import PostsHeader from './PostsHeader';
import PostsFilters from './PostsFilters';
import PostsTable from './PostsTable';
import './PostsList.css';

function PostsList() {
  const { posts, loading, filter, setFilter, handleDelete } = usePostsList();

  return (
    <div className="posts-list">
      <PostsHeader />
      <PostsFilters filter={filter} onFilterChange={setFilter} />

      <div className="posts-list-body">
        {loading ? (
          <div role="status" className="loading-container" style={{ padding: '2rem' }}>
            <div className="loading" aria-hidden="true"></div>
            <p>Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="no-posts">
            <p>No posts found. Create your first post!</p>
            <Link to="/admin/posts/new" className="btn btn-primary">
              Create Post
            </Link>
          </div>
        ) : (
          <PostsTable posts={posts} onDelete={handleDelete} />
        )}
      </div>
    </div>
  );
}

export default PostsList;
