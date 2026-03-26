import { FiStar } from 'react-icons/fi';
import type { SpaceCardProps } from '../helpers/types/localTypes';

function StarRating({ count }: { count: number }) {
  return (
    <div className="product-card__rating-box">
      {[1, 2, 3, 4].map((i) => (
        <FiStar
          key={i}
          size={16}
          fill={i <= count ? '#000' : 'none'}
          stroke="#000"
        />
      ))}
    </div>
  );
}

const SpaceCard: React.FC<SpaceCardProps> = ({ space, listing, ownerName, rating, reviewText, image, onClick }) => {
  const availability = listing?.availability === 'available' ? 'Saatavilla nyt' : listing?.availability ?? '';

  return (
    <article className="product-card" onClick={() => onClick?.(space.id)} style={{ cursor: onClick ? 'pointer' : undefined }}>
      {image && (
        <img
          className="product-card__image"
          src={image}
          alt={space.title}
        />
      )}
      <div className="product-card__details">
        <div className="product-card__row">
          <span className="product-card__name">{space.title}</span>
          <span className="product-card__price">Hinta:{space.price_per_hour}€</span>
        </div>
        <div className="product-card__row">
          <p className="product-card__info"><span>Saatavilla:</span></p>
          <p className="product-card__info"><span>{availability}</span></p>
        </div>
        <div className="product-card__row">
          <p className="product-card__info"><span>Tuotteen omistaja:{ownerName}</span></p>
          <p className="product-card__info"><span>Osoite:{space.location}</span></p>
        </div>
        <div className="product-card__rating">
          <StarRating count={Number(rating)} />
          {reviewText && (
            <span className="product-card__rating-text">{reviewText}</span>
          )}
        </div>
      </div>
    </article>
  );
};

export default SpaceCard;
