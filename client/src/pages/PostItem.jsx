import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { KIET_LOCATION_GROUPS, OTHER_LOCATION_OPTION, UNKNOWN_LOCATION_OPTION } from '../constants/locations';
import { SearchIcon, BoxIcon, UploadCloudIcon } from '../components/Icons';

const getTodayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const PostItem = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    type: 'lost',
    title: '',
    description: '',
    category: '',
    location: '',
    date: getTodayString() // Defaults to today in local calendar time
  });

  const [selectedLocationOption, setSelectedLocationOption] = useState('');
  const [customLocation, setCustomLocation] = useState('');

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

  const handleLocationSelect = (e) => {
    const selected = e.target.value;
    setSelectedLocationOption(selected);
    setError('');
    if (selected === OTHER_LOCATION_OPTION) {
      setFormData((prev) => ({ ...prev, location: customLocation.trim() }));
    } else {
      setFormData((prev) => ({ ...prev, location: selected }));
    }
  };

  const handleCustomLocationChange = (e) => {
    const val = e.target.value;
    setCustomLocation(val);
    setFormData((prev) => ({ ...prev, location: val }));
    setError('');
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    let resolvedLocation = '';
    if (selectedLocationOption === OTHER_LOCATION_OPTION) {
      if (!customLocation.trim()) {
        setError('Please specify the campus location or choose another option.');
        return;
      }
      resolvedLocation = customLocation.trim();
    } else if (selectedLocationOption === UNKNOWN_LOCATION_OPTION) {
      resolvedLocation = UNKNOWN_LOCATION_OPTION;
    } else if (selectedLocationOption) {
      resolvedLocation = selectedLocationOption.trim();
    }

    if (!formData.title.trim() || !formData.description.trim() || !formData.category || !formData.date) {
      setError('Please fill in all required fields: title, description, category, and date.');
      return;
    }

    // P1-1: Future date prevention
    if (formData.date > getTodayString()) {
      setError('Date cannot be in the future.');
      return;
    }

    // P1-3: Text length limits
    if (formData.title.trim().length > 100) {
      setError('Title cannot exceed 100 characters.');
      return;
    }

    if (formData.description.trim().length > 1000) {
      setError('Description cannot exceed 1000 characters.');
      return;
    }

    if (resolvedLocation.length > 100) {
      setError('Location cannot exceed 100 characters.');
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
          location: resolvedLocation,
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
        {/* Section 1: Item Classification */}
        <div className="form-section-header">
          <div className="form-section-title">01 · Item Classification</div>
          <div className="form-section-desc">Specify whether you are reporting a lost possession or a found object</div>
        </div>

        <div className="form-group">
          <div className="type-segmented-control" role="group" aria-label="Select Lost or Found">
            <button
              type="button"
              className={`type-segmented-btn ${formData.type === 'lost' ? 'active type-lost' : ''}`}
              onClick={() => handleTypeSelect('lost')}
              disabled={loading}
            >
              <SearchIcon size={16} />
              <span>I Lost Something</span>
            </button>
            <button
              type="button"
              className={`type-segmented-btn ${formData.type === 'found' ? 'active type-found' : ''}`}
              onClick={() => handleTypeSelect('found')}
              disabled={loading}
            >
              <BoxIcon size={16} />
              <span>I Found Something</span>
            </button>
          </div>
        </div>

        {/* Section 2: Item Details */}
        <div className="form-section-header">
          <div className="form-section-title">02 · Item Details</div>
          <div className="form-section-desc">Provide primary identifying information and description</div>
        </div>

        {/* Title */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <label htmlFor="title">Item Title *</label>
            <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>
              {formData.title.length}/100
            </span>
          </div>
          <input
            id="title"
            type="text"
            name="title"
            placeholder="e.g. Black Leather Bifold Wallet"
            value={formData.title}
            onChange={handleChange}
            disabled={loading}
            maxLength={100}
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

        {/* Detailed Description */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <label htmlFor="description">Detailed Description *</label>
            <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>
              {formData.description.length}/1000
            </span>
          </div>
          <textarea
            id="description"
            name="description"
            rows="4"
            placeholder="Provide identifiable markings, brand, colors, condition, or contents inside..."
            value={formData.description}
            onChange={handleChange}
            disabled={loading}
            maxLength={1000}
            required
          ></textarea>
        </div>

        {/* Section 3: Where & When */}
        <div className="form-section-header">
          <div className="form-section-title">03 · Location & Date</div>
          <div className="form-section-desc">Indicate campus location and the calendar date the item was lost or found</div>
        </div>

        {/* Location Selector (Optional per business rules) */}
        <div className="form-group">
          <label htmlFor="location-select">
            {formData.type === 'lost' ? 'Last Known Location (Optional)' : 'Location Found (Optional)'}
          </label>
          <select
            id="location-select"
            name="selectedLocationOption"
            value={selectedLocationOption}
            onChange={handleLocationSelect}
            disabled={loading}
          >
            <option value="">-- Select Campus Location (Optional) --</option>
            <option value={UNKNOWN_LOCATION_OPTION}>{UNKNOWN_LOCATION_OPTION}</option>
            {KIET_LOCATION_GROUPS.map((group) => (
              <optgroup key={group.group} label={group.group}>
                {group.locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </optgroup>
            ))}
            <option value={OTHER_LOCATION_OPTION}>{OTHER_LOCATION_OPTION}</option>
          </select>
        </div>

        {/* Custom Location Text Input (if Other Campus Location is selected) */}
        {selectedLocationOption === OTHER_LOCATION_OPTION && (
          <div className="form-group" style={{ marginTop: '-4px' }}>
            <label htmlFor="custom-location">Specify Campus Location *</label>
            <input
              id="custom-location"
              type="text"
              name="customLocation"
              placeholder="e.g. Near Workshop Shed, Gate 2"
              value={customLocation}
              onChange={handleCustomLocationChange}
              disabled={loading}
              maxLength={100}
              required
              autoFocus
            />
            <span className="form-help-text">
              Enter a specific campus location not listed in the categories above (max 100 characters).
            </span>
          </div>
        )}

        {/* Date */}
        <div className="form-group">
          <label htmlFor="date">Date *</label>
          <input
            id="date"
            type="date"
            name="date"
            max={getTodayString()}
            value={formData.date}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        {/* Section 4: Photo */}
        <div className="form-section-header">
          <div className="form-section-title">04 · Item Image (Optional)</div>
          <div className="form-section-desc">Upload a clear photo to assist campus identification</div>
        </div>

        {/* Image Upload Area */}
        <div className="form-group">
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
              <div className="dropzone-icon" aria-hidden="true">
                <UploadCloudIcon size={28} />
              </div>
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
                Remove Image
              </button>
            </div>
          )}
        </div>

        {/* Submit Action */}
        <div style={{ marginTop: '12px' }}>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? (uploadStatus || 'Submitting...') : (formData.type === 'lost' ? 'Submit Lost Report' : 'Post Found Item')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostItem;
