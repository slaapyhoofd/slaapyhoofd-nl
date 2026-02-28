import { useState } from 'react';
import { useCategories } from '@/contexts/CategoriesContext';
import './PostFilters.css';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface PostFiltersProps {
  /** tabs = desktop hero (tab switcher), inline = mobile nav (both sections stacked) */
  mode: 'tabs' | 'inline';
  /** Called after any filter selection — use for closing mobile nav / navigating */
  onFilterSelect?: () => void;
  tabIndex?: number;
}

function PostFilters({ mode, onFilterSelect, tabIndex }: PostFiltersProps) {
  const [activeTab, setActiveTab] = useState<'topics' | 'date'>('topics');
  const {
    categories, selectedCategory, setSelectedCategory,
    years, selectedYear, setSelectedYear,
    availableMonths, selectedMonth, setSelectedMonth,
  } = useCategories();

  const handleCategory = (cat: string) => {
    setSelectedCategory(cat);
    onFilterSelect?.();
  };

  const handleYear = (year: number) => {
    setSelectedYear(selectedYear === year ? null : year);
    setSelectedMonth(null);
    onFilterSelect?.();
  };

  const handleMonth = (month: number) => {
    setSelectedMonth(selectedMonth === month ? null : month);
    onFilterSelect?.();
  };

  const topicsSection = (
    <div className="post-filters-section">
      {mode === 'inline' && <span className="post-filters-label">Topics</span>}
      <div className="post-filters-pills">
        {categories.map(cat => (
          <button
            key={cat}
            className={`post-filter-pill${selectedCategory === cat ? ' post-filter-pill--active' : ''}`}
            aria-pressed={selectedCategory === cat}
            onClick={() => handleCategory(cat)}
            tabIndex={tabIndex}
          >
            {cat === 'all' ? 'All' : cat}
          </button>
        ))}
      </div>
    </div>
  );

  const dateSection = years.length > 0 ? (
    <div className="post-filters-section">
      {mode === 'inline' && <span className="post-filters-label">Date</span>}
      <div className="post-filters-pills">
        {years.map(year => (
          <button
            key={year}
            className={`post-filter-pill${selectedYear === year ? ' post-filter-pill--active' : ''}`}
            aria-pressed={selectedYear === year}
            onClick={() => handleYear(year)}
            tabIndex={tabIndex}
          >
            {year}
          </button>
        ))}
      </div>
      {selectedYear !== null && availableMonths.length > 0 && (
        <div className="post-filters-pills post-filters-pills--months">
          {availableMonths.map(month => (
            <button
              key={month}
              className={`post-filter-pill post-filter-pill--sm${selectedMonth === month ? ' post-filter-pill--active' : ''}`}
              aria-pressed={selectedMonth === month}
              onClick={() => handleMonth(month)}
              tabIndex={tabIndex}
            >
              {MONTHS[month]}
            </button>
          ))}
        </div>
      )}
    </div>
  ) : null;

  if (mode === 'inline') {
    return (
      <div className="post-filters post-filters--inline">
        {topicsSection}
        {dateSection}
      </div>
    );
  }

  // tabs mode — desktop hero
  const dateHasFilter = selectedYear !== null;
  const topicsHasFilter = selectedCategory !== 'all';

  return (
    <div className="post-filters post-filters--tabs">
      <div className="post-filters-tablist" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'topics'}
          className={`post-filters-tab${activeTab === 'topics' ? ' post-filters-tab--active' : ''}${topicsHasFilter ? ' post-filters-tab--has-filter' : ''}`}
          onClick={() => setActiveTab('topics')}
          tabIndex={tabIndex}
        >
          Topics
        </button>
        {years.length > 0 && (
          <button
            role="tab"
            aria-selected={activeTab === 'date'}
            className={`post-filters-tab${activeTab === 'date' ? ' post-filters-tab--active' : ''}${dateHasFilter ? ' post-filters-tab--has-filter' : ''}`}
            onClick={() => setActiveTab('date')}
            tabIndex={tabIndex}
          >
            Date
          </button>
        )}
      </div>
      <div role="tabpanel" className="post-filters-panel">
        {activeTab === 'topics' ? topicsSection : dateSection}
      </div>
    </div>
  );
}

export default PostFilters;
