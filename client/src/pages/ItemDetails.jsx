import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import { BoxIcon, EditIcon, TrashIcon, LocationIcon, CalendarIcon, UserIcon, TagIcon } from '../components/Icons';

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const data = await apiFetch(`/items/${id}`);
        setItem(data.item);
      } catch (err) {
        setError(err.message || 'Failed to load item details.');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this item? This action cannot be undone.'
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await apiFetch(`/items/${id}`, {
        method: 'DELETE'
      });
      navigate('/dashboard');
    } catch (err) {
      alert(err.message || 'Failed to delete item.');
      setDeleting(false);
    }
  };

  if (loading) return <div className="loading-state">Loading item details...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!item) return <div className="empty-state">Item not found.</div>;

  // Determine if current authenticated user is the owner
  const isOwner = user && (
    (typeof item.userId === 'object' && item.userId?._id === user._id) ||
    item.userId === user._id
  );

  const formattedDate = item.date
    ? new Date(item.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Unknown Date';

  const ownerName = typeof item.userId === 'object' ? item.userId?.name : 'Anonymous';

  return (
    <div className="details-container">
      <div className="details-card">
        {/* Item Image Display or Neutral Placeholder */}
        <div className="details-image-section">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.title} className="details-image" />
          ) : (
            <div className="details-image-placeholder">
              <span className="placeholder-icon" aria-hidden="true">
                <BoxIcon size={36} />
              </span>
              <span className="placeholder-text">No photographic record uploaded for this item</span>
            </div>
          )}
        </div>

        {/* Badges & Owner Action Header */}
        <div className="details-header">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className={`badge badge-${item.type}`}>
              {item.type.toUpperCase()}
            </span>
            <span className={`badge badge-status-${item.status}`}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </span>
          </div>

          {/* Actions: Edit available to owner or admin, Delete to owner */}
          {(isOwner || (user && user.role === 'admin')) && (
            <div className="details-actions">
              <Link to={`/edit-item/${item._id}`} className="btn btn-secondary btn-sm">
                <EditIcon size={13} />
                <span>Edit Report</span>
              </Link>
              {isOwner && (
                <button
                  onClick={handleDelete}
                  className="btn btn-danger btn-sm"
                  disabled={deleting}
                  type="button"
                >
                  <TrashIcon size={13} />
                  <span>{deleting ? 'Deleting...' : 'Delete'}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Institutional Record Header */}
        <div style={{ marginBottom: '8px' }}>
          <span style={{
            fontSize: 'var(--font-size-xs)',
            fontWeight: 700,
            color: 'var(--primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Item Record · Ref #{item._id.slice(-6).toUpperCase()}
          </span>
          <h1 className="details-title" style={{ marginTop: '4px' }}>{item.title}</h1>
        </div>

        {/* Structured Metadata Grid */}
        <div className="details-meta-grid">
          <div className="meta-item">
            <span className="meta-label">Category</span>
            <span className="meta-value" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <TagIcon size={13} />
              {item.category}
            </span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Campus Location</span>
            <span className="meta-value" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <LocationIcon size={13} />
              {item.location || 'Not specified'}
            </span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Date Reported</span>
            <span className="meta-value" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <CalendarIcon size={13} />
              {formattedDate}
            </span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Reported By</span>
            <span className="meta-value" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <UserIcon size={13} />
              {ownerName}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="details-description">
          <h3>Description</h3>
          <p>{item.description}</p>
        </div>

        {/* Back Navigation */}
        <div className="details-footer">
          <Link
            to={item.type === 'lost' ? '/lost-items' : '/found-items'}
            className="btn btn-secondary"
          >
            &larr; Back to {item.type === 'lost' ? 'Lost Items' : 'Found Items'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;
