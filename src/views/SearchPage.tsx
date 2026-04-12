import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import SpaceCard from '../components/SpaceCard';
import type { SpaceCardProps } from '../helpers/types/localTypes';
import { api } from '../helpers/data/fetchData';

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [spaces, setSpaces] = useState<SpaceCardProps[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSpaces = async () => {
      try {
        const data = await api.media.fetchSpaces();
        const mapped: SpaceCardProps[] = data.map((s) => ({
          space: { id: s.id, title: s.title, location: s.location, price_per_hour: s.price_per_hour, price_per_day: 'price_per_day' in s ? (s as Record<string, unknown>).price_per_day as number : undefined },
          ownerName: '',
          rating: 0,
        }));
        setSpaces(mapped);

        // Fetching the first image for each space
        const withImages = await Promise.all(
          mapped.map(async (card) => {
            try {
              const imgs = await api.upload.fetchImagesByListing(card.space.id);
              return { ...card, image: imgs.length > 0 ? api.getUploadUrl(imgs[0].image_url) : undefined };
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
