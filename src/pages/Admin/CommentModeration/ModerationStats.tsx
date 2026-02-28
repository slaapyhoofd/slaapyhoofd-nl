import { useCommentModeration } from '@/contexts/CommentModerationContext';

function ModerationStats() {
  const { stats } = useCommentModeration();

  return (
    <div className="stats-summary">
      <span className="stat-badge pending">{stats.pending} Pending</span>
      <span className="stat-badge approved">{stats.approved} Approved</span>
      <span className="stat-badge spam">{stats.spam} Spam</span>
    </div>
  );
}

export default ModerationStats;
