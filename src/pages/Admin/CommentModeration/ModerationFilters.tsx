import { useCommentModeration } from '@/contexts/CommentModerationContext';

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'spam', label: 'Spam' },
  { value: 'rejected', label: 'Rejected' },
];

function ModerationFilters() {
  const { filter, setFilter } = useCommentModeration();

  return (
    <div className="moderation-filters">
      {FILTER_OPTIONS.map(option => (
        <button
          key={option.value}
          className={`filter-tab ${filter === option.value ? 'active' : ''}`}
          aria-pressed={filter === option.value}
          onClick={() => setFilter(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default ModerationFilters;
