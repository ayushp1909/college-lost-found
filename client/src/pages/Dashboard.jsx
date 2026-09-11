import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import ItemCard from '../components/ItemCard';

const Dashboard = () => {
  const { user } = useAuth();

  const [myItems, setMyItems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch user items and potential matches concurrently
        const [itemsData, matchesData] = await Promise.all([
          apiFetch('/items'),
          apiFetch('/matches').catch((err) => {
            console.warn('Could not load matches:', err.message);
            return { matches: [] };
          })
        ]);

        const allItems = itemsData.items || [];

        // Filter items where userId matches the current user's _id
        const userItems = allItems.filter((item) => {
          const ownerId = typeof item.userId === 'object' ? item.userId?._id : item.userId;
          return ownerId === user?._id;
        });

        setMyItems(userItems);
        setMatches(matchesData.matches || []);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchDashboardData();
    }
  }, [user]);

  const myLostItems = myItems.filter((item) => item.type === 'lost');
  const myFoundItems = myItems.filter((item) => item.type === 'found');
  const activeCount = myItems.filter((item) => item.status === 'active').length;
  const resolvedCount = myItems.filter((item) => item.status === 'claimed' || item.status === 'closed').length;

  return (
    <div className="page-container">
      <div className="dashboard-welcome">
        <h2>Welcome back, {user?.name}!</h2>
        <p className="dashboard-role">Role: <span className="badge badge-secondary">{user?.role || 'student'}</span></p>
      </div>

      {/* Item summary statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-number">{myItems.length}</span>
          <span className="stat-label">Total Items Reported</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{myLostItems.length}</span>
          <span className="stat-label">Lost Reports</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{myFoundItems.length}</span>
          <span className="stat-label">Found Reports</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{activeCount}</span>
          <span className="stat-label">Active / Pending</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{matches.length}</span>
          <span className="stat-label">Potential Matches</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{resolvedCount}</span>
          <span className="stat-label">Claimed / Closed</span>
        </div>
      </div>

      <div className="dashboard-actions">
        <Link to="/post-item" className="btn btn-primary">
          + Report New Item
        </Link>
      </div>

      {loading && <div className="loading-state">Loading your dashboard...</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && (
        <>
          {/* Potential Matches Section */}
          <section className="dashboard-section">
            <div className="section-header">
              <h3>Potential Matches ({matches.length})</h3>
              <p className="section-subtitle">
                AI semantic suggestions matching your active reports with opposite items across campus
              </p>
            </div>

            {matches.length === 0 ? (
              <p className="text-muted">No potential matches found for your active reports currently.</p>
            ) : (
              <div className="matches-grid">
                {matches.map((m) => (
                  <div key={m._id} className="match-card">
                    <div className="match-card-image-wrapper">
                      {m.matchedItem?.imageUrl ? (
                        <img
                          src={m.matchedItem.imageUrl}
                          alt={m.matchedItem.title}
                          className="match-image"
                          loading="lazy"
                        />
                      ) : (
                        <div className="match-image-placeholder">
                          <span>📦 No Image</span>
                        </div>
                      )}
                    </div>

                    <div className="match-card-content">
                      <div className="match-card-badges">
                        <span className="badge badge-match">Potential Match</span>
                        <span className="match-score">Similarity: {m.similarityPercentage}%</span>
                      </div>

                      <h4 className="match-card-title">{m.matchedItem?.title}</h4>

                      <p className="match-source-info">
                        For your report: <strong>"{m.sourceItem?.title}"</strong>
                      </p>

                      <div className="match-card-details">
                        <p className="match-detail-line">
                          <span>Type:</span> <strong className={`type-tag type-${m.matchedItem?.type}`}>{m.matchedItem?.type?.toUpperCase()}</strong>
                        </p>
                        <p className="match-detail-line">
                          <span>Category:</span> <strong>{m.matchedItem?.category}</strong>
                        </p>
                        <p className="match-detail-line">
                          <span>Location:</span> 📍 <strong>{m.matchedItem?.location}</strong>
                        </p>
                      </div>

                      <div className="match-card-footer">
                        <Link to={`/items/${m.matchedItem?._id}`} className="btn btn-primary btn-sm">
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* My Lost Items Section */}
          <section className="dashboard-section">
            <div className="section-header">
              <h3>My Lost Items ({myLostItems.length})</h3>
            </div>
            {myLostItems.length === 0 ? (
              <p className="text-muted">You have not reported any lost items.</p>
            ) : (
              <div className="items-grid">
                {myLostItems.map((item) => (
                  <ItemCard key={item._id} item={item} />
                ))}
              </div>
            )}
          </section>

          {/* My Found Items Section */}
          <section className="dashboard-section">
            <div className="section-header">
              <h3>My Found Items ({myFoundItems.length})</h3>
            </div>
            {myFoundItems.length === 0 ? (
              <p className="text-muted">You have not reported any found items.</p>
            ) : (
              <div className="items-grid">
                {myFoundItems.map((item) => (
                  <ItemCard key={item._id} item={item} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default Dashboard;
