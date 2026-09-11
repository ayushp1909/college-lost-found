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

      setUploadStatus('Saving item details...');

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
      <h2>Report Lost or Found Item</h2>
      <p className="form-subtitle">Fill in the details accurately to assist identification</p>

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
                disabled={loading}
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
                disabled={loading}
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
            placeholder="e.g. Blue Dell Laptop Charger"
            value={formData.title}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
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

        <div className="form-group">
          <label htmlFor="location">Campus Location</label>
          <input
            id="location"
            type="text"
            name="location"
            placeholder="e.g. Central Library, 2nd Floor Reading Room"
            value={formData.location}
            onChange={handleChange}
            disabled={loading}
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
            disabled={loading}
            required
          />
        </div>

        {/* Optional Image Upload */}
        <div className="form-group">
          <label htmlFor="image">Item Image (Optional)</label>
          <input
            id="image"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageChange}
            disabled={loading}
          />
          <small className="form-help-text">Max size: 5MB. Formats: JPEG, PNG, WEBP, GIF.</small>

          {imagePreview && (
            <div className="image-preview-container">
              <img src={imagePreview} alt="Preview" className="image-preview" />
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

        <div className="form-group">
          <label htmlFor="description">Detailed Description</label>
          <textarea
            id="description"
            name="description"
            rows="4"
            placeholder="Provide identifiable details, colors, marks, or condition..."
            value={formData.description}
            onChange={handleChange}
            disabled={loading}
            required
          ></textarea>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? (uploadStatus || 'Submitting...') : 'Post Item'}
        </button>
      </form>
    </div>
  );
};

export default PostItem;
