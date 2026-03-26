import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import SpaceCard from '../components/SpaceCard';
import type { SpaceCardProps } from '../helpers/types/localTypes';

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [spaces, setSpaces] = useState<SpaceCardProps[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Backend integration: fetch spaces from your API
    // Example: fetch('/api/spaces').then(res => res.json()).then(setSpaces)
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
