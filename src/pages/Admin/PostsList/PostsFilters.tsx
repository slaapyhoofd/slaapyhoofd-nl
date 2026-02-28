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
          className={`filter-tab${filter === option.value ? ' filter-tab--active' : ''}`}
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
