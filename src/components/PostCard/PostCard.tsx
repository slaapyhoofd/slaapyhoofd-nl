import { Link } from 'react-router-dom';
import { Post } from '@/types/post';
import { formatDate } from '@/utils/dateFormat';
import { markdownToPlainText } from '@/utils/markdown';
import './PostCard.css';

interface PostCardProps {
  post: Post;
  variant?: 'featured' | 'secondary';
}

function PostCard({ post, variant = 'secondary' }: PostCardProps) {
  const date = post.published_at || post.created_at;
  const day = new Date(date).getDate();
  const month = new Date(date).toLocaleString('en', { month: 'short' });

  if (variant === 'featured') {
    // Build a plain-text content preview, ending at a sentence boundary
    const source = post.markdown_content || '';
    const plainText = source ? markdownToPlainText(source) : '';
    let bodyPreview = '';
    if (plainText.length > 20) {
      const maxChars = 420;
      if (plainText.length <= maxChars) {
        bodyPreview = plainText;
      } else {
        const chunk = plainText.slice(0, maxChars);
        const lastSentence = Math.max(
          chunk.lastIndexOf('. '),
          chunk.lastIndexOf('! '),
          chunk.lastIndexOf('? ')
        );
        bodyPreview = lastSentence > 60
          ? chunk.slice(0, lastSentence + 1)
          : chunk.replace(/\s+\S*$/, '') + '…';
      }
    }

    return (
      <article className="post-card post-card--featured">
        <Link to={`/post/${post.slug}`} className="post-card-image-block" aria-label={`Read more about ${post.title}`}>
          {post.featured_image && (
            <img src={post.featured_image} alt="" aria-hidden="true" loading="eager" />
          )}
          {post.category && (
            <span className="post-card-category">{post.category}</span>
          )}
          <div className="post-card-date-watermark" aria-hidden="true">
            <div className="post-card-date-day">{day}</div>
            <div className="post-card-date-month">{month}</div>
          </div>
          <h2 className="post-card-title">{post.title}</h2>
        </Link>

        <div className="post-card-body">
          {post.excerpt && (
            <p className="post-card-excerpt">{post.excerpt}</p>
          )}
          {bodyPreview && (
            <p className="post-card-body-preview">{bodyPreview}</p>
          )}
          <div className="post-card-footer">
            <span className="post-card-meta">{post.author} · {formatDate(date)}</span>
            <Link to={`/post/${post.slug}`} className="post-card-read" aria-label={`Read more about ${post.title}`}>
              Read →
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="post-card post-card--secondary">
      {post.featured_image && (
        <div className="post-card-image">
          <img src={post.featured_image} alt={post.title} loading="lazy" />
        </div>
      )}
      {post.category && (
        <span className="post-card-category">{post.category}</span>
      )}
      <h2 className="post-card-title">
        <Link to={`/post/${post.slug}`}>{post.title}</Link>
      </h2>
      {post.excerpt && (
        <p className="post-card-excerpt">{post.excerpt}</p>
      )}
      <div className="post-card-footer">
        <span className="post-card-meta">
          <span className="post-card-author">{post.author}</span>
          <span className="post-card-separator" aria-hidden="true"> · </span>
          <span className="post-card-date">{formatDate(date)}</span>
          {post.views > 0 && (
            <>
              <span className="post-card-separator" aria-hidden="true"> · </span>
              <span className="post-card-views">{post.views} views</span>
            </>
          )}
        </span>
        <Link to={`/post/${post.slug}`} className="post-card-read" aria-label={`Read more about ${post.title}`}>
          Read more →
        </Link>
      </div>
    </article>
  );
}

export default PostCard;
