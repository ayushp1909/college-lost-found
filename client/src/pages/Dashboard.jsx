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
      {/* Welcome Header */}
      <div className="dashboard-welcome">
        <div>
          <h2>Welcome back, {user?.name}!</h2>
          <p className="dashboard-role">
            Account Role: <span className="badge badge-secondary">{user?.role || 'student'}</span>
          </p>
        </div>

        <div className="dashboard-actions">
          <Link to="/post-item" className="btn btn-primary">
            + Report New Item
          </Link>
        </div>
      </div>

      {/* Item Summary Statistics (2-column compact on mobile, 6-col on desktop) */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-number">{myItems.length}</span>
          <span className="stat-label">Total Reports</span>
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
          <span className="stat-label">AI Matches</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{resolvedCount}</span>
          <span className="stat-label">Resolved</span>
        </div>
      </div>

      {loading && <div className="loading-state">Loading your campus dashboard...</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && (
        <>
          {/* Section 1: Potential AI Matches */}
          <section className="dashboard-section">
            <div className="section-header">
              <h3>Potential Matches ({matches.length})</h3>
              <p className="section-subtitle">
                AI semantic suggestions calculated from item descriptions across campus. Review details to verify ownership.
              </p>
            </div>

            {matches.length === 0 ? (
              <div className="empty-state">
                <span className="empty-state-icon" aria-hidden="true">✨</span>
                <p>No potential AI matches found for your active reports right now.</p>
                <span className="text-muted">When opposite items with similar descriptions are reported, they will appear here.</span>
              </div>
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
                          <span>📦 No image uploaded</span>
                        </div>
                      )}
                    </div>

                    <div className="match-card-content">
                      <div className="match-card-badges">
                        <span className="badge badge-match">Potential Match</span>
                        <span className="match-score">{m.similarityPercentage}% Match</span>
                      </div>

                      <h4 className="match-card-title">{m.matchedItem?.title}</h4>

                      <div className="match-source-info">
                        For your report: <strong>"{m.sourceItem?.title}"</strong>
                      </div>

                      <div className="match-card-details">
                        <div className="match-detail-line">
                          <span>Type:</span>{' '}
                          <span className={`type-tag type-${m.matchedItem?.type}`}>
                            {m.matchedItem?.type?.toUpperCase()}
                          </span>
                        </div>
                        <div className="match-detail-line">
                          <span>Category:</span> <strong>{m.matchedItem?.category}</strong>
                        </div>
                        <div className="match-detail-line">
                          <span>Location:</span> 📍 <strong>{m.matchedItem?.location}</strong>
                        </div>
                      </div>

                      <div className="match-card-footer">
                        <Link to={`/items/${m.matchedItem?._id}`} className="btn btn-primary btn-sm">
                          View Details &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 2: My Lost Items */}
          <section className="dashboard-section">
            <div className="section-header">
              <h3>My Lost Items ({myLostItems.length})</h3>
              <p className="section-subtitle">Items you have reported missing on campus</p>
            </div>
            {myLostItems.length === 0 ? (
              <div className="empty-state">
                <span className="empty-state-icon" aria-hidden="true">🔍</span>
                <p>You have not reported any lost items.</p>
                <Link to="/post-item" className="btn btn-secondary btn-sm">
                  + Report a Lost Item
                </Link>
              </div>
            ) : (
              <div className="items-grid">
                {myLostItems.map((item) => (
                  <ItemCard key={item._id} item={item} />
                ))}
              </div>
            )}
          </section>

          {/* Section 3: My Found Items */}
          <section className="dashboard-section">
            <div className="section-header">
              <h3>My Found Items ({myFoundItems.length})</h3>
              <p className="section-subtitle">Items you have discovered and posted to help others</p>
            </div>
            {myFoundItems.length === 0 ? (
              <div className="empty-state">
                <span className="empty-state-icon" aria-hidden="true">📦</span>
                <p>You have not reported any found items.</p>
                <Link to="/post-item" className="btn btn-secondary btn-sm">
                  + Post a Found Item
                </Link>
              </div>
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
