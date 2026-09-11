import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

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
      <div className="page-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p className="page-subtitle">Campus Lost &amp; Found System Overview &amp; Moderation</p>
        </div>
      </div>

      {actionMessage && <div className="alert alert-success">{actionMessage}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {loading && <div className="loading-state">Loading administrative data...</div>}

      {!loading && stats && (
        <>
          {/* Statistics Grid */}
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
              All Items ({items.length})
            </button>
            <button
              type="button"
              className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('users')}
            >
              Registered Users ({users.length})
            </button>
          </div>

          {/* All Items Moderation Table */}
          {activeTab === 'items' && (
            <section className="dashboard-section">
              <div className="section-header">
                <h3>Campus Items ({items.length})</h3>
                <p className="section-subtitle">Manage or moderate all lost and found reports</p>
              </div>

              {items.length === 0 ? (
                <div className="empty-state">No items reported in the system.</div>
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
                        <th>Owner</th>
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
                            <span className={`badge badge-type badge-${item.type}`}>
                              {item.type.toUpperCase()}
                            </span>
                          </td>
                          <td>{item.category}</td>
                          <td>📍 {item.location}</td>
                          <td>
                            <span className={`badge badge-status badge-status-${item.status}`}>
                              {item.status}
                            </span>
                          </td>
                          <td>{item.userId?.name || 'Anonymous'}</td>
                          <td>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item._id, item.title)}
                              className="btn btn-danger btn-sm"
                              title="Delete Item"
                            >
                              🗑 Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* Registered Users Table */}
          {activeTab === 'users' && (
            <section className="dashboard-section">
              <div className="section-header">
                <h3>Registered Users ({users.length})</h3>
                <p className="section-subtitle">Safe user directory (passwords never exposed)</p>
              </div>

              {users.length === 0 ? (
                <div className="empty-state">No registered users found.</div>
              ) : (
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Registered Date</th>
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
