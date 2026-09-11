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
      {/* Item Image or Neutral Placeholder */}
      <div className="card-image-wrapper">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} className="card-image" loading="lazy" />
        ) : (
          <div className="card-image-placeholder">
            <span className="placeholder-icon">📦</span>
            <span className="placeholder-text">No Image</span>
          </div>
        )}
      </div>

      <div className="item-card-header">
        <span className={`badge badge-type badge-${item.type}`}>
          {item.type.toUpperCase()}
        </span>
        <span className={`badge badge-status badge-status-${item.status}`}>
          {item.status}
        </span>
      </div>

      <h3 className="item-card-title">{item.title}</h3>
      <p className="item-card-category">Category: <strong>{item.category}</strong></p>
      <p className="item-card-location">📍 {item.location}</p>
      <p className="item-card-date">🗓 {formattedDate}</p>
      <p className="item-card-owner">Reported by: <strong>{ownerName}</strong></p>

      <div className="item-card-footer">
        <Link to={`/items/${item._id}`} className="btn btn-secondary btn-sm">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ItemCard;
