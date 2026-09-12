import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { BoxIcon, UsersIcon, LocationIcon, EditIcon, TrashIcon } from '../components/Icons';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  // Active tab to toggle between Users and Items tables
  const [activeTab, setActiveTab] = useState('items'); // 'items' | 'users'

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError('');

      const [statsRes, usersRes, itemsRes] = await Promise.all([
        apiFetch('/admin/stats'),
        apiFetch('/admin/users'),
        apiFetch('/admin/items')
      ]);

      setStats(statsRes.stats || null);
      setUsers(usersRes.users || []);
      setItems(itemsRes.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load administrative data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteItem = async (itemId, itemTitle) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the item "${itemTitle}"? This will also remove any associated potential matches.`
    );

    if (!confirmed) return;

    try {
      await apiFetch(`/admin/items/${itemId}`, { method: 'DELETE' });

      setActionMessage(`Item "${itemTitle}" deleted successfully.`);
      setTimeout(() => setActionMessage(''), 4000);

      // Refresh items list and stats
      setItems((prev) => prev.filter((i) => i._id !== itemId));
      if (stats) {
        setStats((prev) => ({
          ...prev,
          totalItems: Math.max(0, prev.totalItems - 1)
        }));
      }
    } catch (err) {
      alert(`Failed to delete item: ${err.message}`);
    }
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p className="page-subtitle">Campus Lost &amp; Found System Moderation &amp; Directory</p>
        </div>
      </div>

      {actionMessage && <div className="alert alert-success">{actionMessage}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {loading && <div className="loading-state">Loading administrative metrics...</div>}

      {!loading && stats && (
        <>
          {/* System Metrics Overview (2-col mobile, 4-col desktop) */}
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number">{stats.totalUsers}</span>
              <span className="stat-label">Total Users</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{stats.totalItems}</span>
              <span className="stat-label">Total Items</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{stats.lostItems}</span>
              <span className="stat-label">Lost Reports</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{stats.foundItems}</span>
              <span className="stat-label">Found Reports</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{stats.activeItems}</span>
              <span className="stat-label">Active Items</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{stats.matchedItems}</span>
              <span className="stat-label">Matched</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{stats.claimedItems}</span>
              <span className="stat-label">Claimed</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{stats.closedItems}</span>
              <span className="stat-label">Closed</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="admin-tabs">
            <button
              type="button"
              className={`btn ${activeTab === 'items' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('items')}
            >
              <BoxIcon size={14} />
              <span>All Items ({items.length})</span>
            </button>
            <button
              type="button"
              className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('users')}
            >
              <UsersIcon size={14} />
              <span>Registered Users ({users.length})</span>
            </button>
          </div>

          {/* Tab 1: All Items Moderation */}
          {activeTab === 'items' && (
            <section className="dashboard-section">
              <div className="section-header">
                <h3>Campus Items Moderation ({items.length})</h3>
                <p className="section-subtitle">Review, monitor, and safely moderate all campus reports</p>
              </div>

              {items.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-state-icon" aria-hidden="true">
                    <BoxIcon size={32} />
                  </span>
                  <p>No items reported in the system.</p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Type</th>
                        <th>Category</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Reporter</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item._id}>
                          <td className="table-cell-title">
                            <strong>{item.title}</strong>
                          </td>
                          <td>
                            <span className={`badge badge-${item.type}`}>
                              {item.type.toUpperCase()}
                            </span>
                          </td>
                          <td>{item.category}</td>
                          <td>
                            {item.location ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <LocationIcon size={12} />
                                {item.location}
                              </span>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                          <td>
                            <span className={`badge badge-status-${item.status}`}>
                              {item.status}
                            </span>
                          </td>
                          <td>{item.userId?.name || 'Anonymous'}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <Link
                                to={`/edit-item/${item._id}`}
                                state={{ from: 'admin' }}
                                className="btn btn-secondary btn-sm"
                                title="Edit Item"
                              >
                                <EditIcon size={12} />
                                <span>Edit</span>
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(item._id, item.title)}
                                className="btn btn-danger btn-sm"
                                title="Delete Item"
                              >
                                <TrashIcon size={12} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* Tab 2: Registered Users Directory */}
          {activeTab === 'users' && (
            <section className="dashboard-section">
              <div className="section-header">
                <h3>Registered Users Directory ({users.length})</h3>
                <p className="section-subtitle">Safe user directory (passwords and hashes are strictly protected)</p>
              </div>

              {users.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-state-icon" aria-hidden="true">
                    <UsersIcon size={32} />
                  </span>
                  <p>No registered users found.</p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>College Email</th>
                        <th>Role</th>
                        <th>Registration Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id}>
                          <td>
                            <strong>{u.name}</strong>
                          </td>
                          <td>{u.email}</td>
                          <td>
                            <span className={`badge ${u.role === 'admin' ? 'badge-match' : 'badge-secondary'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td>
                            {u.createdAt
                              ? new Date(u.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })
                              : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
