import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUpload } from 'react-icons/fi';
import SpaceCard from '../components/SpaceCard';
import type { SpaceCardProps } from '../helpers/types/localTypes';
import { useAuth } from '../context/AuthContext';

type Tab = 'all' | 'mine';

const ProviderHome: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [allSpaces, setAllSpaces] = useState<SpaceCardProps[]>([]);
  const [mySpaces, setMySpaces] = useState<SpaceCardProps[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Backend integration: fetch all spaces from your API
    // Example: fetch('/api/spaces').then(res => res.json()).then(setAllSpaces)
  }, []);

  useEffect(() => {
    // Backend integration: fetch provider's own spaces from your API
    // Example: fetch(`/api/spaces?owner=${user?.id}`).then(res => res.json()).then(setMySpaces)
  }, [user]);

  const spaces = activeTab === 'all' ? allSpaces : mySpaces;

  const handleCardClick = (spaceId: number) => {
    navigate(`/space/${spaceId}`);
  };

  return (
    <div className="provider-home">
      <p className="provider-welcome">Tervetuloa, {user?.Firstname || user?.username}!</p>

      {/* Tab switcher */}
      <div className="provider-tabs">
        <button
          className={`auth-tabs__btn ${activeTab === 'all' ? 'auth-tabs__btn--active' : 'auth-tabs__btn--inactive'}`}
          onClick={() => setActiveTab('all')}
        >
          Tuotteet
        </button>
        <button
          className={`auth-tabs__btn ${activeTab === 'mine' ? 'auth-tabs__btn--active' : 'auth-tabs__btn--inactive'}`}
          onClick={() => setActiveTab('mine')}
        >
          Omat tuotteet ({mySpaces.length})
        </button>
      </div>

      {/* Product listing */}
      <div className="product-list">
        {spaces.map((props) => (
          <SpaceCard key={props.space.id} {...props} onClick={handleCardClick} />
        ))}
        {spaces.length === 0 && (
          <p className="search-page__empty">Ei omia tuotteita vielä. Lisää ensimmäinen!</p>
        )}
      </div>

      {/* Upload FAB */}
      <button className="provider-fab" aria-label="Lisää tuote" onClick={() => {
        // Backend integration: navigate to space creation form or open modal
        navigate('/provider/create');
      }}>
        <FiUpload size={24} />
      </button>
    </div>
  );
};

export default ProviderHome;
