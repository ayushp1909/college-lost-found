import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';

const EditItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    type: 'lost',
    location: '',
    date: '',
    status: 'active',
    imageUrl: ''
  });

  const [itemOwnerId, setItemOwnerId] = useState(null);
  const [newImageFile, setNewImageFile] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [error, setError] = useState('');

  const categories = [
    'Electronics',
    'ID Card / Documents',
    'Keys',
    'Wallet / Purse',
    'Books / Stationery',
    'Clothing / Accessories',
    'Bottle / Lunchbox',
    'Other'
  ];

  const statuses = ['active', 'matched', 'claimed', 'closed'];

  const fromAdmin = location.state?.from === 'admin';
  const isOwner = user && itemOwnerId === user._id;
  const isAdmin = user && user.role === 'admin';
  const isEditingAsAdmin = isAdmin && !isOwner;

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const data = await apiFetch(`/items/${id}`);
        const item = data.item;

        // Verify ownership or admin role
        const ownerId = typeof item.userId === 'object' ? item.userId?._id : item.userId;
        setItemOwnerId(ownerId);
        const hasAccess = user && (ownerId === user._id || user.role === 'admin');
        if (!hasAccess) {
          setError('Forbidden: You are not authorized to edit this item.');
          setLoading(false);
          return;
        }

        setFormData({
          title: item.title || '',
          description: item.description || '',
          category: item.category || '',
          type: item.type || 'lost',
          location: item.location || '',
          date: item.date ? item.date.split('T')[0] : '',
          status: item.status || 'active',
          imageUrl: item.imageUrl || ''
        });
      } catch (err) {
        setError(err.message || 'Failed to load item.');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleTypeSelect = (selectedType) => {
    setFormData({ ...formData, type: selectedType });
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (JPEG, PNG, WEBP, GIF).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB.');
        return;
      }
      setNewImageFile(file);
      setNewImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleRemoveExistingImage = () => {
    setFormData({ ...formData, imageUrl: '' });
  };

  const handleCancelNewImage = () => {
    setNewImageFile(null);
    setNewImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.description.trim() || !formData.category || !formData.location.trim() || !formData.date) {
      setError('Please fill in all required fields.');
      return;
    }

    setSaving(true);
    let finalImageUrl = formData.imageUrl;

    try {
      // If a new image was selected, upload it to Cloudinary first
      if (newImageFile) {
        setSaveStatus('Uploading new image to Cloudinary...');
        const imageFormData = new FormData();
        imageFormData.append('image', newImageFile);

        const uploadData = await apiFetch('/items/upload-image', {
          method: 'POST',
          body: imageFormData
        });

        finalImageUrl = uploadData.imageUrl;
      }

      setSaveStatus('Saving changes...');

      await apiFetch(`/items/${id}`, {
        method: 'PUT',
        body: {
          ...formData,
          imageUrl: finalImageUrl
        }
      });

      // Redirect back to admin dashboard if editing from admin, else item details
      if (fromAdmin) {
        navigate('/admin');
      } else {
        navigate(`/items/${id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to update item.');
    } finally {
      setSaving(false);
      setSaveStatus('');
    }
  };

  if (loading) return <div className="loading-state">Loading item data...</div>;

  return (
    <div className="form-card">
      <div className="form-header">
        <h2>Edit Item</h2>
        <p className="form-subtitle">Update item information, status, or image</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="form">
        {/* Segmented Type Toggle */}
        <div className="form-group">
          <label>Item Classification</label>
          <div className="type-segmented-control" role="group" aria-label="Select Lost or Found">
            <button
              type="button"
              className={`type-segmented-btn ${formData.type === 'lost' ? 'active type-lost' : ''}`}
              onClick={() => handleTypeSelect('lost')}
              disabled={saving || isEditingAsAdmin}
            >
              <span>🔍</span>
              <span>Lost Item</span>
            </button>
            <button
              type="button"
              className={`type-segmented-btn ${formData.type === 'found' ? 'active type-found' : ''}`}
              onClick={() => handleTypeSelect('found')}
              disabled={saving || isEditingAsAdmin}
            >
              <span>📦</span>
              <span>Found Item</span>
            </button>
          </div>
          {isEditingAsAdmin && (
            <span className="form-help-text">
              Item classification (Lost/Found) cannot be altered by admins to preserve semantic matching.
            </span>
          )}
        </div>

        {/* Title */}
        <div className="form-group">
          <label htmlFor="title">Item Title *</label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            disabled={saving}
            required
          />
        </div>

        {/* Status */}
        <div className="form-group">
          <label htmlFor="status">Item Status *</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            disabled={saving}
            required
          >
            {statuses.map((st) => (
              <option key={st} value={st}>
                {st.charAt(0).toUpperCase() + st.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            disabled={saving}
            required
          >
            <option value="">-- Select Category --</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div className="form-group">
          <label htmlFor="location">Campus Location *</label>
          <input
            id="location"
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            disabled={saving}
            required
          />
        </div>

        {/* Date */}
        <div className="form-group">
          <label htmlFor="date">Date *</label>
          <input
            id="date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            disabled={saving}
            required
          />
        </div>

        {/* Image Management */}
        <div className="form-group">
          <label>Item Image</label>

          {/* Show existing image if present and no new replacement chosen */}
          {formData.imageUrl && !newImagePreview && (
            <div className="image-preview-container">
              <span className="meta-label">Current Image:</span>
              <img src={formData.imageUrl} alt="Current item" className="image-preview" />
              <button
                type="button"
                onClick={handleRemoveExistingImage}
                className="btn btn-secondary btn-sm btn-remove-image"
                disabled={saving}
              >
                ✕ Remove Current Image
              </button>
            </div>
          )}

          {/* Show new replacement image preview */}
          {newImagePreview && (
            <div className="image-preview-container">
              <span className="meta-label">New Replacement Image:</span>
              <img src={newImagePreview} alt="New preview" className="image-preview" />
              <button
                type="button"
                onClick={handleCancelNewImage}
                className="btn btn-secondary btn-sm btn-remove-image"
                disabled={saving}
              >
                ✕ Cancel Replacement
              </button>
            </div>
          )}

          {!newImagePreview && (
            <div className="dropzone-container" style={{ marginTop: '8px' }}>
              <input
                id="newImage"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageChange}
                disabled={saving}
                className="dropzone-file-input"
                aria-label="Upload replacement image"
              />
              <div className="dropzone-icon" aria-hidden="true">📷</div>
              <div className="dropzone-title">
                {formData.imageUrl ? 'Click or tap to replace with a new image' : 'Click or tap to upload a photo'}
              </div>
              <div className="dropzone-subtitle">JPEG, PNG, WEBP, or GIF (max 5MB)</div>
            </div>
          )}
        </div>

        {/* Detailed Description */}
        <div className="form-group">
          <label htmlFor="description">Detailed Description *</label>
          <textarea
            id="description"
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            disabled={saving}
            required
          ></textarea>
        </div>

        {/* Action Buttons */}
        <div className="form-actions-inline">
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>
            {saving ? (saveStatus || 'Saving...') : 'Save Changes'}
          </button>
          <Link to={fromAdmin ? '/admin' : `/items/${id}`} className="btn btn-secondary" style={{ flex: 1 }}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default EditItem;
