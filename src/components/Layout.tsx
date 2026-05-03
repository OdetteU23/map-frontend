import { useEffect, useState, type ReactNode } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  FiBell,
  FiCalendar,
  FiHome,
  FiLogOut,
  FiMenu,
  FiMessageSquare,
  FiSearch,
  FiSettings,
  FiUpload,
  FiUser,
  FiX,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { isUser } from '../helpers/types/localTypes';

type SidebarItem = {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  isActive: boolean;
};

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isProvider = isUser(user) && (user.role === 'provider' || user.role === 'admin');

  const closeSidebar = () => setIsSidebarOpen(false);

  const goTo = (path: string) => {
    navigate(path);
    closeSidebar();
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeSidebar();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const handleLogout = () => {
    logout();
    closeSidebar();
    navigate('/');
  };

  const handleHome = () => {
    goTo(isLoggedIn ? (isProvider ? '/provider' : '/home') : '/');
  };

  const sidebarItems: SidebarItem[] = [
    {
      label: 'Home',
      icon: <FiHome size={18} />,
      onClick: handleHome,
      isActive: location.pathname === '/' || location.pathname === '/home' || location.pathname === '/provider',
    },
    {
      label: 'Search',
      icon: <FiSearch size={18} />,
      onClick: () => goTo('/search'),
      isActive: location.pathname === '/search',
    },
    {
      label: 'Messages',
      icon: <FiMessageSquare size={18} />,
      onClick: () => goTo('/messages'),
      isActive: location.pathname === '/messages',
    },
    {
      label: 'Notifications',
      icon: <FiBell size={18} />,
      onClick: () => goTo('/notifications'),
      isActive: location.pathname === '/notifications',
    },
    {
      label: 'Bookings',
      icon: <FiCalendar size={18} />,
      onClick: () => goTo('/bookings'),
      isActive: location.pathname === '/bookings',
    },
    {
      label: 'Payment history',
      icon: <FiCalendar size={18} />,
      onClick: () => goTo('/payment'),
      isActive: location.pathname === '/payment',
    },
    {
      label: 'Account',
      icon: <FiUser size={18} />,
      onClick: () => goTo('/account'),
      isActive: location.pathname === '/account',
    },
    {
      label: 'Settings',
      icon: <FiSettings size={18} />,
      onClick: () => goTo('/settings'),
      isActive: location.pathname === '/settings',
    },
  ];

  if (isProvider) {
    sidebarItems.push(
      {
        label: 'Provider home',
        icon: <FiHome size={18} />,
        onClick: () => goTo('/provider'),
        isActive: location.pathname === '/provider',
      },
      {
        label: 'Create space',
        icon: <FiUpload size={18} />,
        onClick: () => goTo('/provider/create'),
        isActive: location.pathname === '/provider/create',
      },
      {
        label: 'Upload media',
        icon: <FiUpload size={18} />,
        onClick: () => goTo('/upload'),
        isActive: location.pathname === '/upload' || location.pathname.startsWith('/upload/'),
      },
    );
  }

  if (!isLoggedIn) {
    sidebarItems.push(
      {
        label: 'Sign in',
        icon: <FiUser size={18} />,
        onClick: () => goTo('/auth?view=login'),
        isActive: location.pathname === '/auth',
      },
      {
        label: 'Register',
        icon: <FiUser size={18} />,
        onClick: () => goTo('/auth'),
        isActive: location.pathname === '/auth',
      },
    );
  }

  return (
    <div className="app">
      <header className="header">
        <button
          className="header__menu-btn"
          aria-label="Open menu"
          aria-expanded={isSidebarOpen}
          aria-controls="app-sidebar"
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          type="button"
        >
          <FiMenu />
        </button>

        <h1
          className="header__title"
          onClick={handleHome}
        >
          USX Marketplace
        </h1>

        <nav className="header__nav" aria-label="Primary navigation">
          <button
            type="button"
            className={`header__nav-item ${location.pathname === '/' || location.pathname === '/home' || location.pathname === '/provider' ? 'header__nav-item--active' : ''}`}
            onClick={handleHome}
          >
            <FiHome size={22} /> Home
          </button>
          <button
            type="button"
            className={`header__nav-item ${location.pathname === '/search' ? 'header__nav-item--active' : ''}`}
            onClick={() => goTo('/search')}
          >
            <FiSearch size={22} /> Search
          </button>
          {isLoggedIn && (
            <>
              {isProvider && (
                <button
                  type="button"
                  className={`header__nav-item ${location.pathname === '/upload' || location.pathname === '/provider/create' ? 'header__nav-item--active' : ''}`}
                  onClick={() => goTo('/upload')}
                >
                  <FiUpload size={22} /> Upload
                </button>
              )}
              <button
                type="button"
                className={`header__nav-item ${location.pathname === '/messages' ? 'header__nav-item--active' : ''}`}
                onClick={() => goTo('/messages')}
              >
                <FiMessageSquare size={22} /> Messages
              </button>
              <button
                type="button"
                className={`header__nav-item ${location.pathname === '/notifications' ? 'header__nav-item--active' : ''}`}
                onClick={() => goTo('/notifications')}
              >
                <FiBell size={22} /> Notifications
              </button>
            </>
          )}
        </nav>

        <div className="header__actions">
          {isLoggedIn ? (
            <>
              <button className="btn btn--light" onClick={() => goTo('/settings')} type="button">
                <FiSettings size={18} />
              </button>
              <button className="btn btn--dark" onClick={handleLogout} type="button">
                <FiLogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <button className="btn btn--light" onClick={() => goTo('/auth?view=login')} type="button">
                Sign in
              </button>
              <button className="btn btn--dark" onClick={() => goTo('/auth')} type="button">
                Register
              </button>
            </>
          )}
        </div>
      </header>

      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}>
          <aside
            className="sidebar"
            id="app-sidebar"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sidebar__header">
              <div>
                <p className="sidebar__eyebrow">Menu</p>
                <h2 className="sidebar__title">All views</h2>
              </div>

              <button
                type="button"
                className="sidebar__close"
                aria-label="Close menu"
                onClick={closeSidebar}
              >
                <FiX size={22} />
              </button>
            </div>

            <nav className="sidebar__nav" aria-label="Sidebar navigation">
              {sidebarItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className={`sidebar__item ${item.isActive ? 'sidebar__item--active' : ''}`}
                  onClick={item.onClick}
                >
                  <span className="sidebar__icon">{item.icon}</span>
                  <span className="sidebar__label">{item.label}</span>
                </button>
              ))}

              {isLoggedIn && (
                <button
                  type="button"
                  className="sidebar__item sidebar__item--danger"
                  onClick={handleLogout}
                >
                  <span className="sidebar__icon">
                    <FiLogOut size={18} />
                  </span>
                  <span className="sidebar__label">Log out</span>
                </button>
              )}
            </nav>
          </aside>
        </div>
      )}

      <main className="page-content">
        <Outlet />
      </main>

      <nav className="bottom-nav">
        <button
          className={`bottom-nav__item ${location.pathname === '/' || location.pathname === '/home' || location.pathname === '/provider' ? 'bottom-nav__item--active' : ''}`}
          onClick={handleHome}
          aria-label="Home"
          type="button"
        >
          <FiHome size={24} />
        </button>
        <button
          className={`bottom-nav__item ${location.pathname === '/search' ? 'bottom-nav__item--active' : ''}`}
          onClick={() => goTo('/search')}
          aria-label="Search"
          type="button"
        >
          <FiSearch size={24} />
        </button>
        {isLoggedIn && (
          <>
            {isProvider && (
              <button
                className={`bottom-nav__item ${location.pathname === '/upload' || location.pathname === '/provider/create' ? 'bottom-nav__item--active' : ''}`}
                onClick={() => goTo('/upload')}
                aria-label="Upload"
                type="button"
              >
                <FiUpload size={24} />
              </button>
            )}
            <button
              className={`bottom-nav__item ${location.pathname === '/messages' ? 'bottom-nav__item--active' : ''}`}
              onClick={() => goTo('/messages')}
              aria-label="Messages"
              type="button"
            >
              <FiMessageSquare size={24} />
            </button>
            <button
              className={`bottom-nav__item ${location.pathname === '/notifications' ? 'bottom-nav__item--active' : ''}`}
              onClick={() => goTo('/notifications')}
              aria-label="Notifications"
              type="button"
            >
              <FiBell size={24} />
            </button>
            <button
              className={`bottom-nav__item ${location.pathname === '/settings' ? 'bottom-nav__item--active' : ''}`}
              onClick={() => goTo('/settings')}
              aria-label="Settings"
              type="button"
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
