import { CommentModerationProvider, useCommentModeration } from '@/contexts/CommentModerationContext';
import ModerationStats from './ModerationStats';
import ModerationFilters from './ModerationFilters';
import CommentCard from './CommentCard';
import './CommentModeration.css';

function CommentModerationContent() {
  const { comments, loading } = useCommentModeration();

  if (loading) {
    return (
      <div className="loading-container">
        <div role="status" className="loading-container">
          <div className="loading" aria-hidden="true"></div>
          <p>Loading comments...</p>
        </div>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="no-comments">
        <p>No comments found.</p>
      </div>
    );
  }

  return (
    <div className="comments-list">
      {comments.map((comment) => (
        <CommentCard key={comment.id} comment={comment} />
      ))}
    </div>
  );
}

function CommentModeration() {
  return (
    <CommentModerationProvider>
      <div className="container">
        <div className="comment-moderation">
          <header className="moderation-header">
            <h1>Comment Moderation</h1>
            <ModerationStats />
          </header>

          <ModerationFilters />
          <CommentModerationContent />
        </div>
      </div>
    </CommentModerationProvider>
  );
}

export default CommentModeration;
