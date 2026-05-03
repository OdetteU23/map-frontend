import { FiCalendar, FiUser, FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isUser, getUserDisplayName } from '../helpers/types/localTypes';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isProvider = isUser(user) && (user.role === 'provider' || user.role === 'admin');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="settings-page">
      <h2 className="settings-page__title">Settings</h2>
      <p className="settings-page__user">Kirjautunut: <strong>{getUserDisplayName(user)}</strong> ({isUser(user) ? user.role : 'provider'})</p>

      <div className="settings-actions">
        {isProvider ? (
          <>
            <button className="btn btn--dark settings-btn" onClick={() => navigate('/bookings')}>
              <FiCalendar size={18} />
              Varauspyyntöjen hallintapaneeli
            </button>
            <button className="btn btn--light settings-btn" onClick={() => navigate('/provider', { state: { tab: 'mine' } })}>
              📊 Tuotteiden hallintapaneeli
            </button>
          </>
        ) : (
          <>
            <button className="btn btn--dark settings-btn" onClick={() => navigate('/bookings')}>
              <FiCalendar size={18} />
              Varauspyyntöjä
            </button>
            {/*
            <button className="btn btn--light settings-btn" onClick={() => navigate('/home')}>
              Omat tulevat tapahtumien suunnittelu
            </button>
            */}
          </>
        )}

        <button className="btn btn--light settings-btn" onClick={() => navigate('/account')}>
          <FiUser size={18} />
          Account
        </button>
      </div>

      <div className="settings-logout">
        <button className="btn btn--dark settings-btn" onClick={handleLogout}>
          <FiLogOut size={18} />
          Kirjaudu ulos
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
