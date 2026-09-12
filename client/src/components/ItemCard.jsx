import { Link } from 'react-router-dom';
import { TagIcon, LocationIcon, CalendarIcon, UserIcon, EmptyBoxIcon } from './Icons';

const ItemCard = ({ item }) => {
  const formattedDate = item.date
    ? new Date(item.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'Unknown Date';

  const ownerName = item.userId?.name || 'Anonymous';

  return (
    <div className={`item-card type-${item.type}`}>
      {/* Media Container */}
      <div className="card-image-wrapper">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="card-image"
            loading="lazy"
          />
        ) : (
          <div className="card-image-placeholder">
            <span className="placeholder-icon">
              <EmptyBoxIcon size={26} />
            </span>
            <span className="placeholder-text">No image uploaded</span>
          </div>
        )}
      </div>

      <div className="item-card-body">
        {/* Type & Status Badges */}
        <div className="item-card-header">
          <span className={`badge badge-${item.type}`}>
            {item.type}
          </span>
          <span className={`badge badge-status-${item.status}`}>
            {item.status}
          </span>
        </div>

        {/* Title */}
        <h3 className="item-card-title" title={item.title}>
          {item.title}
        </h3>

        {/* Aligned Compact Metadata */}
        <div className="item-card-meta">
          <div className="meta-row" title={`Category: ${item.category}`}>
            <TagIcon className="icon" size={13} />
            <span>{item.category}</span>
          </div>
          <div className="meta-row" title={`Location: ${item.location || 'Not specified'}`}>
            <LocationIcon className="icon" size={13} />
            <span>{item.location || 'Not specified'}</span>
          </div>
          <div className="meta-row" title={`Reported on: ${formattedDate}`}>
            <CalendarIcon className="icon" size={13} />
            <span>{formattedDate}</span>
          </div>
          <div className="meta-row" title={`Reported by: ${ownerName}`}>
            <UserIcon className="icon" size={13} />
            <span>{ownerName}</span>
          </div>
        </div>
      </div>

      {/* Card Action */}
      <div className="item-card-footer">
        <Link to={`/items/${item._id}`} className="btn btn-secondary btn-sm">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ItemCard;
