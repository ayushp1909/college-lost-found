import { Link } from 'react-router-dom';

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
      {/* Aspect-Ratio Maintained Image or Clean Neutral Placeholder */}
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
            <span className="placeholder-icon" aria-hidden="true">📦</span>
            <span className="placeholder-text">No image uploaded</span>
          </div>
        )}
      </div>

      <div className="item-card-body">
        {/* Badges: Type & Status */}
        <div className="item-card-header">
          <span className={`badge badge-${item.type}`}>
            {item.type.toUpperCase()}
          </span>
          <span className={`badge badge-status-${item.status}`}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </span>
        </div>

        {/* Title */}
        <h3 className="item-card-title" title={item.title}>
          {item.title}
        </h3>

        {/* Metadata */}
        <div className="item-card-meta">
          <div className="meta-row" title={`Category: ${item.category}`}>
            <span>🏷️</span>
            <span>{item.category}</span>
          </div>
          <div className="meta-row" title={`Location: ${item.location}`}>
            <span>📍</span>
            <span>{item.location}</span>
          </div>
          <div className="meta-row" title={`Reported on: ${formattedDate}`}>
            <span>🗓️</span>
            <span>{formattedDate}</span>
          </div>
          <div className="meta-row" title={`Reported by: ${ownerName}`}>
            <span>👤</span>
            <span>{ownerName}</span>
          </div>
        </div>
      </div>

      {/* Touch-Friendly Card Footer */}
      <div className="item-card-footer">
        <Link to={`/items/${item._id}`} className="btn btn-secondary btn-sm">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ItemCard;
