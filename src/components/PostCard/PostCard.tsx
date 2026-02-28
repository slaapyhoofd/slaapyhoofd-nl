import { Link } from 'react-router-dom';
import { Post } from '@/types/post';
import { formatDate } from '@/utils/dateFormat';
import './PostCard.css';

interface PostCardProps {
  post: Post;
}

function PostCard({ post }: PostCardProps) {
  return (
    <article className="post-card">
      {post.featured_image && (
        <div className="post-card-image">
          <img src={post.featured_image} alt={post.title} loading="lazy" />
        </div>
      )}
      
      <div className="post-card-content">
        {post.category && (
          <span className="post-card-category">{post.category}</span>
        )}
        
        <h2 className="post-card-title">
          <Link to={`/post/${post.slug}`}>{post.title}</Link>
        </h2>
        
        {post.excerpt && (
          <p className="post-card-excerpt">{post.excerpt}</p>
        )}
        
        <div className="post-card-meta">
          <span className="post-card-author">{post.author}</span>
          <span className="post-card-date">{formatDate(post.published_at || post.created_at)}</span>
          {post.views > 0 && (
            <span className="post-card-views">{post.views} views</span>
          )}
        </div>
        
        <Link
          to={`/post/${post.slug}`}
          className="post-card-link"
          aria-label={`Read more about ${post.title}`}
        >
          Read more →
        </Link>
      </div>
    </article>
  );
}

export default PostCard;
