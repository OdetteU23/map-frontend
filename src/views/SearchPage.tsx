import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import SpaceCard from '../components/SpaceCard';
import type { SpaceCardProps } from '../helpers/types/localTypes';
import { api } from '../helpers/data/fetchData';
import type { Review } from 'map-hybrid-types-server';
import { calculateAverageReviewRating, formatReviewSummary } from '../helpers/reviewStats';

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [spaces, setSpaces] = useState<SpaceCardProps[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSpaces = async () => {
      try {
        const data = await api.media.fetchSpaces();
        const mapped: SpaceCardProps[] = await Promise.all(
          data.map(async (s) => {
            let image: string | undefined;
            let reviews: Review[] = [];

            try {
              const [images, fetchedReviews] = await Promise.all([
                api.upload.fetchImagesByListing(s.id),
                api.media.fetchReviews(s.id),
              ]);
              reviews = fetchedReviews;

              if (images.length > 0) {
                image =
                  typeof images[0].image_url === 'string' &&
                  images[0].image_url.startsWith('http')
                    ? images[0].image_url
                    : api.getUploadUrl(images[0].image_url);
              }
            } catch {
              // keep the card visible even if images or reviews fail
            }

            return {
              space: {
                id: s.id,
                title: s.title,
                location: s.location,
                price_per_hour: s.price_per_hour,
                price_per_day: 'price_per_day' in s ? (s as Record<string, unknown>).price_per_day as number : undefined,
              },
              ownerName: '',
              rating: calculateAverageReviewRating(reviews),
              reviewText: formatReviewSummary(reviews),
              image,
            };
          })
        );

        setSpaces(mapped);

        // Preserve a second pass for image hydration if some requests failed earlier
        const withImages = await Promise.all(
          mapped.map(async (card) => {
            if (card.image) {
              return card;
            }

            try {
              const imgs = await api.upload.fetchImagesByListing(card.space.id);
              return {
                ...card,
                image:
                  imgs.length > 0
                    ? typeof imgs[0].image_url === 'string' && imgs[0].image_url.startsWith('http')
                      ? imgs[0].image_url
                      : api.getUploadUrl(imgs[0].image_url)
                    : undefined,
              };
            } catch {
              return card;
            }
          })
        );

        setSpaces(withImages);
      } catch (err) {
        console.error('Failed to load spaces:', err);
      }
    };

    loadSpaces();
  }, []);

  const filtered = spaces.filter((s) => {
    const q = query.toLowerCase();
    return (
      s.space.title.toLowerCase().includes(q) ||
      s.space.location.toLowerCase().includes(q) ||
      s.ownerName.toLowerCase().includes(q)
    );
  });

  const handleCardClick = (spaceId: number) => {
    navigate(`/space/${spaceId}`);
  };

  return (
    <div className="search-page">
      <div className="search-bar">
        <FiSearch size={20} />
        <input
          className="search-bar__input"
          type="text"
          placeholder="Hae tiloja nimellä, sijainnilla..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="product-list">
        {filtered.map((props) => (
          <SpaceCard key={props.space.id} {...props} onClick={handleCardClick} />
        ))}
        {filtered.length === 0 && (
          <p className="search-page__empty">Ei tuloksia haulle "{query}"</p>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
