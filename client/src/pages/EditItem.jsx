import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';

const EditItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const data = await apiFetch(`/items/${id}`);
        const item = data.item;

        // Verify ownership
        const ownerId = typeof item.userId === 'object' ? item.userId?._id : item.userId;
        if (user && ownerId !== user._id) {
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

      // Redirect back to item details
      navigate(`/items/${id}`);
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
      <h2>Edit Item</h2>
      <p className="form-subtitle">Update item information, status, or image</p>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>Item Type</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="type"
                value="lost"
                checked={formData.type === 'lost'}
                onChange={handleChange}
                disabled={saving}
              />
              <span>Lost</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="type"
                value="found"
                checked={formData.type === 'found'}
                onChange={handleChange}
                disabled={saving}
              />
              <span>Found</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="title">Item Title</label>
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

        <div className="form-group">
          <label htmlFor="status">Item Status</label>
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
                {st.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
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

        <div className="form-group">
          <label htmlFor="location">Campus Location</label>
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

        <div className="form-group">
          <label htmlFor="date">Date</label>
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
              <p className="meta-label">Current Image:</p>
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
              <p className="meta-label">New Replacement Image:</p>
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

          <label htmlFor="newImage" className="form-sublabel">
            {formData.imageUrl ? 'Replace with new image:' : 'Add an image:'}
          </label>
          <input
            id="newImage"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageChange}
            disabled={saving}
          />
          <small className="form-help-text">Max size: 5MB. Formats: JPEG, PNG, WEBP, GIF.</small>
        </div>

        <div className="form-group">
          <label htmlFor="description">Detailed Description</label>
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

        <div className="form-actions-inline">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? (saveStatus || 'Saving...') : 'Save Changes'}
          </button>
          <Link to={`/items/${id}`} className="btn btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default EditItem;
