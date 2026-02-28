import { Link } from 'react-router-dom';
import { Post } from '@/types/post';
import { formatDate } from '@/utils/dateFormat';

interface PostsTableProps {
  posts: Post[];
  onDelete: (id: number) => void;
}

const STATUS_DOT_COLORS: Record<string, string> = {
  published: '#2e7d32',
  draft: 'var(--color-parchment)',
  archived: 'var(--color-mid)',
};

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
            <th></th>
          </tr>
        </thead>
        <tbody>
          {posts.map(post => (
            <tr key={post.id}>
              <td className="post-title-cell">
                <div className="post-title-main">{post.title}</div>
                {post.excerpt && <div className="post-excerpt">{post.excerpt}</div>}
              </td>
              <td className="post-category-cell">{post.category || '—'}</td>
              <td>
                <div className="post-status">
                  <span
                    className="post-status-dot"
                    style={{
                      background: STATUS_DOT_COLORS[post.status] ?? 'var(--color-parchment)',
                    }}
                    aria-hidden="true"
                  />
                  <span>{post.status}</span>
                </div>
              </td>
              <td className="post-date-cell">{formatDate(post.created_at)}</td>
              <td className="post-views-cell">{post.views}</td>
              <td className="post-actions">
                <Link
                  to={`/admin/posts/edit/${post.id}`}
                  className="post-action-link post-action-link--edit"
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
                  className="post-action-link post-action-link--delete"
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
