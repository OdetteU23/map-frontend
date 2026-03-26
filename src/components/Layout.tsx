import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiHome, FiSearch, FiMessageSquare, FiSettings, FiLogOut, FiUpload } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn, logout } = useAuth();
  const isProvider = user?.role === 'provider' || user?.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <button className="header__menu-btn" aria-label="Menu">
          <FiMenu />
        </button>
        <h1 className="header__title">USX Marketplace</h1>
        <div className="header__actions">
          {isLoggedIn ? (
            <>
              <span className="header__user">Hei, {user?.Firstname || user?.username}</span>
              <button className="btn btn--light" onClick={() => navigate('/settings')}>
                <FiSettings size={14} />
              </button>
              <button className="btn btn--dark" onClick={handleLogout}>
                <FiLogOut size={14} />
              </button>
            </>
          ) : (
            <>
              <button className="btn btn--light" onClick={() => navigate('/auth')}>
                Sign in
              </button>
              <button className="btn btn--dark" onClick={() => navigate('/auth')}>
                Register
              </button>
            </>
          )}
        </div>
      </header>

      {/* Page content */}
      <main className="page-content">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="bottom-nav">
        <button
          className={`bottom-nav__item ${location.pathname === '/' || location.pathname === '/home' || location.pathname === '/provider' ? 'bottom-nav__item--active' : ''}`}
          onClick={() => navigate(isLoggedIn ? (isProvider ? '/provider' : '/home') : '/')}
          aria-label="Home"
        >
          <FiHome size={24} />
        </button>
        <button
          className={`bottom-nav__item ${location.pathname === '/search' ? 'bottom-nav__item--active' : ''}`}
          onClick={() => navigate('/search')}
          aria-label="Search"
        >
          <FiSearch size={24} />
        </button>
        {isLoggedIn && (
          <>
            {isProvider && (
              <button
                className={`bottom-nav__item ${location.pathname === '/provider/upload' ? 'bottom-nav__item--active' : ''}`}
                onClick={() => navigate('/provider')}
                aria-label="Upload"
              >
                <FiUpload size={24} />
              </button>
            )}
            <button
              className={`bottom-nav__item ${location.pathname === '/messages' ? 'bottom-nav__item--active' : ''}`}
              onClick={() => navigate('/messages')}
              aria-label="Messages"
            >
              <FiMessageSquare size={24} />
            </button>
            <button
              className={`bottom-nav__item ${location.pathname === '/settings' ? 'bottom-nav__item--active' : ''}`}
              onClick={() => navigate('/settings')}
              aria-label="Settings"
            >
              <FiSettings size={24} />
            </button>
          </>
        )}
      </nav>
    </div>
  );
};

export default Layout;
