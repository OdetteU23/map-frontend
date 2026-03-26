import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SpaceCard from '../components/SpaceCard';
import type { SpaceCardProps } from '../helpers/types/localTypes';
import { useAuth } from '../context/AuthContext';

const UserHome: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [spaces, setSpaces] = useState<SpaceCardProps[]>([]);

  useEffect(() => {
    // Backend integration: fetch recommended/recent spaces from your API
    // Example: fetch('/api/spaces').then(res => res.json()).then(setSpaces)
  }, []);

  const handleCardClick = (spaceId: number) => {
    navigate(`/space/${spaceId}`);
  };

  return (
    <div>
      <p className="home-welcome">Tervetuloa, {user?.Firstname || user?.username}!</p>
      <div className="product-list">
        {spaces.map((props) => (
          <SpaceCard key={props.space.id} {...props} onClick={handleCardClick} />
        ))}
      </div>
    </div>
  );
};

export default UserHome;
