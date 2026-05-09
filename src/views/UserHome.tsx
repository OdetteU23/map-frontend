import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SpaceCard from '../components/SpaceCard';
import type { SpaceCardProps } from '../helpers/types/localTypes';
import { useAuth } from '../context/AuthContext';
import { getUserDisplayName } from '../helpers/types/localTypes';
import { api } from '../helpers/data/fetchData';
import type { Review } from 'map-hybrid-types-server';
import { calculateAverageReviewRating, formatReviewSummary } from '../helpers/reviewStats';

const UserHome: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [spaces, setSpaces] = useState<SpaceCardProps[]>([]);

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
              space: { id: s.id, title: s.title, location: s.location, price_per_hour: s.price_per_hour },
              ownerName: '',
              rating: calculateAverageReviewRating(reviews),
              reviewText: formatReviewSummary(reviews),
              image,
            };
          })
        );
        setSpaces(mapped);
      } catch (err) {
        console.error('Failed to load spaces:', err);
      }
    };

    loadSpaces();
  }, []);

  const handleCardClick = (spaceId: number) => {
    navigate(`/space/${spaceId}`);
  };

  return (
    <div>
      <p className="home-welcome">Tervetuloa, {getUserDisplayName(user)}!</p>
      <div className="product-list">
        {spaces.map((props) => (
          <SpaceCard key={props.space.id} {...props} onClick={handleCardClick} />
        ))}
      </div>
    </div>
  );
};

export default UserHome;
