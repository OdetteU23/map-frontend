import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiHome, FiSearch, FiMessageSquare, FiSettings, FiLogOut, FiUpload, FiBell } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { isUser } from '../helpers/types/localTypes';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn, logout } = useAuth();
  const isProvider = isUser(user) && (user.role === 'provider' || user.role === 'admin');

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
        <h1
          className="header__title"
          onClick={() => navigate(isLoggedIn ? (isProvider ? '/provider' : '/home') : '/')}
        >
          USX Marketplace
        </h1>

        {/* Desktop nav — hidden on mobile */}
        <nav className="header__nav">
          <button
            className={`header__nav-item ${location.pathname === '/' || location.pathname === '/home' || location.pathname === '/provider' ? 'header__nav-item--active' : ''}`}
            onClick={() => navigate(isLoggedIn ? (isProvider ? '/provider' : '/home') : '/')}
          >
            <FiHome size={22} /> Home
          </button>
          <button
            className={`header__nav-item ${location.pathname === '/search' ? 'header__nav-item--active' : ''}`}
            onClick={() => navigate('/search')}
          >
            <FiSearch size={22} /> Search
          </button>
          {isLoggedIn && (
            <>
              {isProvider && (
                <button
                  className={`header__nav-item ${location.pathname === '/upload' || location.pathname === '/provider/create' ? 'header__nav-item--active' : ''}`}
                  onClick={() => navigate('/upload')}
                >
                  <FiUpload size={22} /> Upload
                </button>
              )}
              <button
                className={`header__nav-item ${location.pathname === '/messages' ? 'header__nav-item--active' : ''}`}
                onClick={() => navigate('/messages')}
              >
                <FiMessageSquare size={22} /> Messages
              </button>
              <button
                className={`header__nav-item ${location.pathname === '/notifications' ? 'header__nav-item--active' : ''}`}
                onClick={() => navigate('/notifications')}
              >
                <FiBell size={22} /> Notifications
              </button>
            </>
          )}
        </nav>

        <div className="header__actions">
          {isLoggedIn ? (
            <>
              <button className="btn btn--light" onClick={() => navigate('/settings')}>
                <FiSettings size={18} />
              </button>
              <button className="btn btn--dark" onClick={handleLogout}>
                <FiLogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <button className="btn btn--light" onClick={() => navigate('/auth?view=login')}>
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
                className={`bottom-nav__item ${location.pathname === '/upload' || location.pathname === '/provider/create' ? 'bottom-nav__item--active' : ''}`}
                onClick={() => navigate('/upload')}
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
              className={`bottom-nav__item ${location.pathname === '/notifications' ? 'bottom-nav__item--active' : ''}`}
              onClick={() => navigate('/notifications')}
              aria-label="Notifications"
            >
              <FiBell size={24} />
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
