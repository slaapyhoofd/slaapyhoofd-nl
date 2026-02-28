interface PostsFiltersProps {
  filter: string;
  onFilterChange: (filter: string) => void;
}

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Drafts' },
];

function PostsFilters({ filter, onFilterChange }: PostsFiltersProps) {
  return (
    <div className="posts-filters">
      {FILTER_OPTIONS.map((option) => (
        <button
          key={option.value}
          className={`filter-btn ${filter === option.value ? 'active' : ''}`}
          aria-pressed={filter === option.value}
          onClick={() => onFilterChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default PostsFilters;
