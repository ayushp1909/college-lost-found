import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';

const PostItem = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    type: 'lost',
    title: '',
    description: '',
    category: '',
    location: '',
    date: new Date().toISOString().split('T')[0] // Defaults to today
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

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
        setError('Please select an image file (JPEG, PNG, WEBP, GIF).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.description.trim() || !formData.category || !formData.location.trim() || !formData.date) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    let finalImageUrl = '';

    try {
      // If user selected an image, upload to Cloudinary via backend endpoint
      if (imageFile) {
        setUploadStatus('Uploading image to Cloudinary...');
        const imageFormData = new FormData();
        imageFormData.append('image', imageFile);

        const uploadData = await apiFetch('/items/upload-image', {
          method: 'POST',
          body: imageFormData
        });

        finalImageUrl = uploadData.imageUrl;
      }

      setUploadStatus('Saving report details...');

      // Post item with optional imageUrl
      await apiFetch('/items', {
        method: 'POST',
        body: {
          ...formData,
          imageUrl: finalImageUrl
        }
      });

      // Redirect to corresponding items page
      if (formData.type === 'lost') {
        navigate('/lost-items');
      } else {
        navigate('/found-items');
      }
    } catch (err) {
      setError(err.message || 'Failed to post item.');
    } finally {
      setLoading(false);
      setUploadStatus('');
    }
  };

  return (
    <div className="form-card">
      <div className="form-header">
        <h2>Report Lost or Found Item</h2>
        <p className="form-subtitle">Fill in accurate details to help campus recovery</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="form">
        {/* Modern Segmented Lost / Found Toggle */}
        <div className="form-group">
          <label>Item Classification</label>
          <div className="type-segmented-control" role="group" aria-label="Select Lost or Found">
            <button
              type="button"
              className={`type-segmented-btn ${formData.type === 'lost' ? 'active type-lost' : ''}`}
              onClick={() => handleTypeSelect('lost')}
              disabled={loading}
            >
              <span>🔍</span>
              <span>I Lost Something</span>
            </button>
            <button
              type="button"
              className={`type-segmented-btn ${formData.type === 'found' ? 'active type-found' : ''}`}
              onClick={() => handleTypeSelect('found')}
              disabled={loading}
            >
              <span>📦</span>
              <span>I Found Something</span>
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="form-group">
          <label htmlFor="title">Item Title *</label>
          <input
            id="title"
            type="text"
            name="title"
            placeholder="e.g. Black Leather Bifold Wallet"
            value={formData.title}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        {/* Category */}
        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            disabled={loading}
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
            placeholder="e.g. Central Library Floor 2, Study Room"
            value={formData.location}
            onChange={handleChange}
            disabled={loading}
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
            disabled={loading}
            required
          />
        </div>

        {/* Image Upload Area with Modern Dropzone Style */}
        <div className="form-group">
          <label>Item Image (Optional)</label>

          {!imagePreview ? (
            <div className="dropzone-container">
              <input
                id="image"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageChange}
                disabled={loading}
                className="dropzone-file-input"
                aria-label="Upload item image"
              />
              <div className="dropzone-icon" aria-hidden="true">📷</div>
              <div className="dropzone-title">Click or tap to upload a photo</div>
              <div className="dropzone-subtitle">JPEG, PNG, WEBP, or GIF (max 5MB)</div>
            </div>
          ) : (
            <div className="image-preview-container">
              <img src={imagePreview} alt="Selected item preview" className="image-preview" />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="btn btn-secondary btn-sm btn-remove-image"
                disabled={loading}
              >
                ✕ Remove Image
              </button>
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
            placeholder="Provide identifiable markings, brand, colors, condition, or items inside..."
            value={formData.description}
            onChange={handleChange}
            disabled={loading}
            required
          ></textarea>
        </div>

        {/* Submit Action */}
        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? (uploadStatus || 'Submitting...') : (formData.type === 'lost' ? 'Submit Lost Report' : 'Post Found Item')}
        </button>
      </form>
    </div>
  );
};

export default PostItem;
