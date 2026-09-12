import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import ItemCard from '../components/ItemCard';
import FilterBar from '../components/FilterBar';
import { SearchIcon } from '../components/Icons';
import { KIET_LOCATION_GROUPS, KIET_LOCATIONS_FLAT, UNKNOWN_LOCATION_OPTION } from '../constants/locations';

const LostItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    const fetchLostItems = async () => {
      try {
        setLoading(true);
        const data = await apiFetch('/items');
        // Filter only items with type === "lost"
        const lost = (data.items || []).filter((item) => item.type === 'lost');
        setItems(lost);
      } catch (err) {
        setError(err.message || 'Failed to load lost items.');
      } finally {
        setLoading(false);
      }
    };

    fetchLostItems();
  }, []);

  // Derive unique categories and locations from the current items list
  const categoryOptions = Array.from(
    new Set(items.map((item) => item.category).filter(Boolean))
  ).sort();

  // Grouped location options with standard KIET locations + any custom/legacy active locations
  const activeCustomLocations = Array.from(
    new Set(
      items
        .map((item) => item.location?.trim())
        .filter(
          (loc) => loc && !KIET_LOCATIONS_FLAT.includes(loc) && loc !== UNKNOWN_LOCATION_OPTION
        )
    )
  ).sort();

  const locationOptions = [
    UNKNOWN_LOCATION_OPTION,
    ...KIET_LOCATION_GROUPS,
    ...(activeCustomLocations.length > 0
      ? [{ group: 'Custom / Other Active Locations', locations: activeCustomLocations }]
      : [])
  ];

  // Reset all search and filter fields
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedLocation('');
    setSelectedStatus('');
  };

  // Combined client-side filtering (Search + Category + Location + Status)
  const filteredItems = items.filter((item) => {
    // 1. Search Query: case-insensitive match against title, description, or category
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const titleMatch = item.title?.toLowerCase().includes(q);
      const descMatch = item.description?.toLowerCase().includes(q);
      const catMatch = item.category?.toLowerCase().includes(q);
      if (!titleMatch && !descMatch && !catMatch) {
        return false;
      }
    }

    // 2. Category Filter
    if (selectedCategory && item.category !== selectedCategory) {
      return false;
    }

    // 3. Location Filter
    if (selectedLocation) {
      if (selectedLocation === UNKNOWN_LOCATION_OPTION) {
        const isUnknown = item.location === UNKNOWN_LOCATION_OPTION || !item.location?.trim();
        if (!isUnknown) return false;
      } else if (item.location !== selectedLocation) {
        return false;
      }
    }

    // 4. Status Filter
    if (selectedStatus && item.status !== selectedStatus) {
      return false;
    }

    return true;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Lost Items</h2>
          <p className="page-subtitle">Browse items reported missing on campus</p>
        </div>
        <Link to="/post-item" className="btn btn-primary">
          + Report Lost Item
        </Link>
      </div>

      {loading && <div className="loading-state">Loading lost items...</div>}

      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && items.length === 0 && (
        <div className="empty-state">
          <span className="empty-state-icon" aria-hidden="true">
            <SearchIcon size={32} />
          </span>
          <p>No lost items reported currently.</p>
          <Link to="/post-item" className="btn btn-secondary">
            Report a Lost Item
          </Link>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <>
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            categoryOptions={categoryOptions}
            selectedLocation={selectedLocation}
            onLocationChange={setSelectedLocation}
            locationOptions={locationOptions}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            onClearFilters={handleClearFilters}
            totalCount={items.length}
            filteredCount={filteredItems.length}
          />

          {filteredItems.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon" aria-hidden="true">
                <SearchIcon size={32} />
              </span>
              <p>No items found matching your search.</p>
            </div>
          ) : (
            <div className="items-grid">
              {filteredItems.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LostItems;
