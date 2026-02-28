import { Link } from 'react-router-dom';
import { Post } from '@/types/post';
import { formatDate } from '@/utils/dateFormat';

interface PostsTableProps {
  posts: Post[];
  onDelete: (id: number) => void;
}

function PostsTable({ posts, onDelete }: PostsTableProps) {
  return (
    <div className="posts-table">
      <table>
        <caption className="sr-only">
          Blog posts — {posts.length} result{posts.length !== 1 ? 's' : ''}
        </caption>
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Status</th>
            <th>Date</th>
            <th>Views</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id}>
              <td className="post-title">
                <strong>{post.title}</strong>
                {post.excerpt && (
                  <div className="post-excerpt">{post.excerpt}</div>
                )}
              </td>
              <td>{post.category || '-'}</td>
              <td>
                <span className={`status-badge status-${post.status}`}>
                  {post.status}
                </span>
              </td>
              <td>{formatDate(post.created_at)}</td>
              <td>{post.views}</td>
              <td className="post-actions">
                <Link
                  to={`/admin/posts/edit/${post.id}`}
                  className="btn btn-secondary btn-sm"
                  aria-label={`Edit post: ${post.title}`}
                >
                  Edit
                </Link>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete "${post.title}"? This cannot be undone.`)) {
                      onDelete(post.id);
                    }
                  }}
                  className="btn btn-secondary btn-sm btn-danger"
                  aria-label={`Delete post: ${post.title}`}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PostsTable;
