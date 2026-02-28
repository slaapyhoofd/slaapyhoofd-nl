import { useParams, Link } from 'react-router-dom';
import { useOptimistic } from 'react';
import { useBlogPost } from './useBlogPost';
import { useMarkdown } from '@/hooks/useMarkdown';
import { formatDate } from '@/utils/dateFormat';
import CommentSection from '@/components/CommentSection';
import CommentForm from '@/components/CommentForm';
import './BlogPost.css';

interface PendingComment {
  tempId: number;
  author_name: string;
  content: string;
  created_at: string;
}

function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { post, loading, error } = useBlogPost(slug);
  const { html: postHtml } = useMarkdown(post?.markdown_content || post?.content || '');

  // React 19: useOptimistic shows submitted comment immediately while it awaits moderation
  const [pendingComments, addPendingComment] = useOptimistic(
    [] as PendingComment[],
    (state, comment: PendingComment) => [...state, comment]
  );

  if (loading) {
    return (
      <div role="status" className="blog-post-loading">
        <div className="loading" aria-hidden="true"></div>
        <p>Loading post...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="blog-post-error">
        <h1>Post Not Found</h1>
        <p>{error || 'The post you are looking for does not exist.'}</p>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </div>
    );
  }

  const date = post.published_at || post.created_at;
  const day = new Date(date).getDate();
  const month = new Date(date).toLocaleString('en', { month: 'short' });

  return (
    <div className="blog-post-page">
      {/* React 19: metadata tags are hoisted to <head> automatically */}
      <title>{post.title} - Slaapyhoofd</title>
      <meta name="description" content={post.excerpt || post.title} />
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={post.excerpt || ''} />
      {post.featured_image && <meta property="og:image" content={post.featured_image} />}
      <link rel="canonical" href={`https://slaapyhoofd.nl/post/${post.slug}`} />

      {/* Pine hero block */}
      <header className="blog-post-hero">
        <div className="blog-post-hero-date-watermark" aria-hidden="true">
          <div className="blog-post-hero-date-day">{day}</div>
          <div className="blog-post-hero-date-month">{month}</div>
        </div>
        {post.category && (
          <span className="blog-post-category">{post.category}</span>
        )}
        <h1 className="blog-post-title">{post.title}</h1>
        <div className="blog-post-meta">
          <span className="post-author">{post.author}</span>
          <span className="post-date">{formatDate(date)}</span>
          {post.views > 0 && (
            <span className="post-views">{post.views} views</span>
          )}
        </div>
      </header>

      <article className="blog-post">
        {post.featured_image && (
          <div className="blog-post-image">
            <img src={post.featured_image} alt={post.title} />
          </div>
        )}

        <div
          className="blog-post-content"
          dangerouslySetInnerHTML={{ __html: postHtml }}
        />

        {post.tags && (
          <div className="blog-post-tags">
            <strong>Tags:</strong>
            {post.tags.split(',').map((tag: string, index: number) => (
              <span key={index} className="tag">{tag.trim()}</span>
            ))}
          </div>
        )}

        <div className="blog-post-footer">
          <Link to="/" className="btn btn-secondary">← Back to Home</Link>
        </div>

        <CommentSection postId={post.id} />

        {/* Optimistic pending comments — visible during form submission transition */}
        {pendingComments.length > 0 && (
          <div className="pending-comments">
            {pendingComments.map((c) => (
              <div key={c.tempId} className="comment-item comment-item--pending">
                <div className="comment-header">
                  <strong className="comment-author">{c.author_name}</strong>
                  <span className="comment-pending-badge">Pending approval</span>
                </div>
                <div className="comment-content">{c.content}</div>
              </div>
            ))}
          </div>
        )}

        <CommentForm postId={post.id} onOptimisticAdd={addPendingComment} />
      </article>
    </div>
  );
}

export default BlogPost;
