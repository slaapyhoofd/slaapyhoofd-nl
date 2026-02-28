import { Comment } from '@/services/comments';
import { useCommentModeration } from '@/contexts/CommentModerationContext';
import { formatDate } from '@/utils/dateFormat';

interface CommentCardProps {
  comment: Comment;
}

function CommentCard({ comment }: CommentCardProps) {
  const { handleStatusChange, handleDelete } = useCommentModeration();

  return (
    <div className={`comment-card status-${comment.status}`}>
      <div className="comment-header">
        <div className="comment-author">
          <span className="comment-author-name">{comment.author_name}</span>
          {comment.author_email && <span className="comment-email">{comment.author_email}</span>}
        </div>
        <span className={`status-badge status-${comment.status}`}>{comment.status}</span>
      </div>

      <div className="comment-meta">
        <span>
          On: <strong>{comment.post_title}</strong>
        </span>
        <span>{formatDate(comment.created_at, 'relative')}</span>
        {comment.ip_address && <span className="comment-ip">IP: {comment.ip_address}</span>}
      </div>

      <div className="comment-content">{comment.content}</div>

      <div className="comment-actions">
        {comment.status !== 'approved' && (
          <button
            onClick={() => handleStatusChange(comment.id, 'approved')}
            className="btn btn-sm btn-success"
            aria-label={`Approve comment by ${comment.author_name}`}
          >
            Approve
          </button>
        )}
        {comment.status !== 'spam' && (
          <button
            onClick={() => handleStatusChange(comment.id, 'spam')}
            className="btn btn-sm btn-warning"
            aria-label={`Mark comment by ${comment.author_name} as spam`}
          >
            Mark as Spam
          </button>
        )}
        {comment.status !== 'rejected' && (
          <button
            onClick={() => handleStatusChange(comment.id, 'rejected')}
            className="btn btn-sm btn-secondary"
            aria-label={`Reject comment by ${comment.author_name}`}
          >
            Reject
          </button>
        )}
        <button
          onClick={() => handleDelete(comment.id)}
          className="btn btn-sm btn-danger"
          aria-label={`Delete comment by ${comment.author_name}`}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default CommentCard;
