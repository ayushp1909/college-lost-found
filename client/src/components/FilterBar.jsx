const FilterBar = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categoryOptions = [],
  selectedLocation,
  onLocationChange,
  locationOptions = [],
  selectedStatus,
  onStatusChange,
  onClearFilters,
  totalCount = 0,
  filteredCount = 0
}) => {
  const hasActiveFilters =
    Boolean(searchQuery) ||
    Boolean(selectedCategory) ||
    Boolean(selectedLocation) ||
    Boolean(selectedStatus);

  return (
    <div className="filter-bar">
      {/* Search Input Row */}
      <div className="filter-search-row">
        <div className="search-input-group">
          <span className="search-icon" aria-hidden="true">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by title, description, or category..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search items"
          />
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className="btn btn-secondary btn-clear-filters"
            onClick={onClearFilters}
            title="Reset all search queries and active filters"
          >
            <span>✕</span>
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      {/* Responsive Filter Selects Row */}
      <div className="filter-controls-row">
        {/* Category Filter */}
        <div className="filter-control">
          <label htmlFor="filter-category" className="filter-label">Category</label>
          <select
            id="filter-category"
            className="filter-select"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <option value="">All Categories</option>
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Location Filter */}
        <div className="filter-control">
          <label htmlFor="filter-location" className="filter-label">Location</label>
          <select
            id="filter-location"
            className="filter-select"
            value={selectedLocation}
            onChange={(e) => onLocationChange(e.target.value)}
          >
            <option value="">All Locations</option>
            {locationOptions.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="filter-control">
          <label htmlFor="filter-status" className="filter-label">Status</label>
          <select
            id="filter-status"
            className="filter-select"
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="matched">Matched</option>
            <option value="claimed">Claimed</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Results Counter */}
        <div className="filter-results-info">
          Showing <strong>{filteredCount}</strong> of <strong>{totalCount}</strong> items
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
