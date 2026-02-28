import { useState, useEffect } from 'react';
import { CommentWithReplies } from '@/types/comment';
import { getComments } from '@/services/comments';
import { formatDate } from '@/utils/dateFormat';
import './CommentSection.css';

interface CommentSectionProps {
  postId: number;
}

function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getComments(postId).then(res => {
      setComments(res.success && res.data ? res.data : []);
      setLoading(false);
    });
  }, [postId]);

  if (loading) {
    return (
      <div className="comment-section">
        <h3>Comments</h3>
        <div role="status" className="loading-container">
          <div className="loading" aria-hidden="true"></div>
          <p>Loading comments...</p>
        </div>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="comment-section">
        <h3>Comments</h3>
        <p className="no-comments">No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className="comment-section">
      <h3>Comments ({comments.length})</h3>
      
      <div className="comments-list">
        {comments.map((comment) => (
          <div key={comment.id} className="comment-item">
            <div className="comment-header">
            <span className="comment-author">{comment.author_name}</span>
              <span className="comment-date">
                {formatDate(comment.created_at, 'relative')}
              </span>
            </div>
            
            <div className="comment-content">
              {comment.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CommentSection;
