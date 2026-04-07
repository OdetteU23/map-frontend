import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SpaceCard from '../components/SpaceCard';
import type { SpaceCardProps } from '../helpers/types/localTypes';
import { getUserDisplayName, isUser } from '../helpers/types/localTypes';
import { useAuth } from '../context/AuthContext';
import { api } from '../helpers/data/fetchData';

type Tab = 'all' | 'mine';

const ProviderHome: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [allSpaces, setAllSpaces] = useState<SpaceCardProps[]>([]);
  const [mySpaces, setMySpaces] = useState<SpaceCardProps[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const mapSpaces = async (data: { id: number; owner_id?: number | string; title: string; location: string; price_per_hour: number }[], ownerName = ''): Promise<SpaceCardProps[]> => {
    return Promise.all(
      data.map(async (s) => {
        let image: string | undefined;
        try {
          const images = await api.upload.fetchImagesByListing(s.id);
          if (images.length > 0) {
            image = api.getUploadUrl(images[0].image_url);
          }
        } catch { /* no images yet */ }
        return {
          space: { id: s.id, title: s.title, location: s.location, price_per_hour: s.price_per_hour, owner_id: typeof s.owner_id === 'number' ? s.owner_id : undefined },
          ownerName,
          rating: 0,
          image,
        };
      })
    );
  };

  useEffect(() => {
    const loadSpaces = async () => {
      try {
        const data = await api.media.fetchSpaces();
        const mapped = await mapSpaces(data);
        setAllSpaces(mapped);
      } catch (err) {
        console.error('Failed to fetch spaces:', err);
      }
    };
    loadSpaces();
  }, []);

  useEffect(() => {
    if (!user || !isUser(user)) return;
    const loadMySpaces = async () => {
      try {
        const data = await api.media.fetchSpacesByOwner(user.id);
        const mapped = await mapSpaces(data, user.username);
        setMySpaces(mapped);
      } catch (err) {
        console.error('Failed to fetch my spaces:', err);
      }
    };
    loadMySpaces();
  }, [user]);

  const spaces = activeTab === 'all' ? allSpaces : mySpaces;

  const handleCardClick = (spaceId: number) => {
    navigate(`/space/${spaceId}`);
  };

  const handleEdit = (spaceId: number) => {
    navigate(`/provider/edit/${spaceId}`);
  };

  const handleDelete = async (spaceId: number) => {
    if (!confirm('Haluatko varmasti poistaa tämän tilan?')) return;
    try {
      await api.upload.deleteSpace(spaceId);
      setAllSpaces((prev) => prev.filter((s) => s.space.id !== spaceId));
      setMySpaces((prev) => prev.filter((s) => s.space.id !== spaceId));
    } catch (err) {
      console.error('Failed to delete space:', err);
      alert('Tilan poistaminen epäonnistui.');
    }
  };

  const canModify = (ownerId?: number): boolean => {
    if (!user || !isUser(user)) return false;
    if (user.role === 'admin') return true;
    return ownerId === user.id;
  };

  return (
    <div className="provider-home">
      <p className="provider-welcome">Tervetuloa, {getUserDisplayName(user)}!</p>

      {/* Tab switcher */}
      <div className="provider-tabs">
        <button
          className={`auth-tabs__btn ${activeTab === 'all' ? 'auth-tabs__btn--active' : 'auth-tabs__btn--inactive'}`}
          onClick={() => setActiveTab('all')}
        >
          Kaikki tilat
        </button>
        <button
          className={`auth-tabs__btn ${activeTab === 'mine' ? 'auth-tabs__btn--active' : 'auth-tabs__btn--inactive'}`}
          onClick={() => setActiveTab('mine')}
        >
          Omat tilat ({mySpaces.length})
        </button>
      </div>

      {/* Space listing */}
      <div className="product-list">
        {spaces.map((props) => (
          <SpaceCard
            key={props.space.id}
            {...props}
            onClick={handleCardClick}
            canEdit={canModify(props.space.owner_id)}
            canDelete={canModify(props.space.owner_id)}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
        {spaces.length === 0 && (
          <p className="search-page__empty">
            {activeTab === 'mine'
              ? 'Ei omia tiloja vielä. Lisää ensimmäinen!'
              : 'Ei tiloja saatavilla.'}
          </p>
        )}
      </div>

    </div>
  );
};

export default ProviderHome;
