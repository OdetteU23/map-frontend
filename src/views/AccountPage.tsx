import { useState, type FC } from 'react';
import { FiArrowLeft, FiClock, FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import AccountInfo from '../components/AccountInfo.tsx';
import BookingsComponents from '../components/Bookings';
import PaymentsComponents from '../components/PaymentsComp';
import { useAuth } from '../context/AuthContext';
import { api } from '../helpers/data/fetchData';
import useBookings from '../hooks/useBookings';
import usePayments from '../hooks/usePayments';
import { getUserDisplayName, isUser } from '../helpers/types/localTypes';

type AccountTab = 'profile' | 'history';

const AccountPage: FC = () => {
  const navigate = useNavigate();
  const { user, editUser } = useAuth();
  const isConsumer = isUser(user) && user.role === 'consumer';
  const [activeTab, setActiveTab] = useState<AccountTab>('profile');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);

  const handleUpgradeToProvider = async () => {
    if (!user || !isUser(user) || user.role !== 'consumer') {
      return;
    }

    setIsUpgrading(true);
    setUpgradeError(null);

    try {
      const updatedUser = await api.user.editingProfile(user.username, { role: 'provider' });
      editUser(updatedUser);
      navigate('/provider');
    } catch (err) {
      console.error('Failed to upgrade account:', err);
      setUpgradeError(err instanceof Error ? err.message : 'Failed to upgrade account.');
    } finally {
      setIsUpgrading(false);
    }
  };

  const historyEnabled = isConsumer && activeTab === 'history';
  const {
    bookings,
    isLoading: bookingsLoading,
    error: bookingsError,
  } = useBookings(historyEnabled);
  const {
    payments,
    isLoading: paymentsLoading,
    error: paymentsError,
  } = usePayments(historyEnabled);

  if (!user) {
    return (
      <div className="settings-page account-page">
        <div className="account-page__header">
          <button type="button" className="space-detail__back" onClick={() => navigate('/settings')}>
            <FiArrowLeft size={20} /> Takaisin
          </button>
          <div>
            <h2 className="settings-page__title">Account</h2>
            <p className="settings-page__user">Kirjaudu sisään nähdäksesi tilitietosi.</p>
          </div>
        </div>

        <div className="account-page__empty form-section">
          <p>Sign in to view and edit your account details.</p>
          <button type="button" className="btn btn--dark" onClick={() => navigate('/auth')}>
            Sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page account-page">
      <div className="account-page__header">
        <button type="button" className="space-detail__back" onClick={() => navigate('/settings')}>
          <FiArrowLeft size={20} /> Takaisin
        </button>
        <div>
          <h2 className="settings-page__title">Account</h2>
          <p className="settings-page__user">
            Kirjautunut: <strong>{getUserDisplayName(user)}</strong> ({isUser(user) ? user.role : 'provider'})
          </p>
        </div>
      </div>

      {isConsumer && (
        <div className="auth-tabs account-page__tabs">
          <button
            type="button"
            className={`auth-tabs__btn ${activeTab === 'profile' ? 'auth-tabs__btn--active' : 'auth-tabs__btn--inactive'}`}
            onClick={() => setActiveTab('profile')}
          >
            <FiUser size={16} /> Profiili
          </button>
          <button
            type="button"
            className={`auth-tabs__btn ${activeTab === 'history' ? 'auth-tabs__btn--active' : 'auth-tabs__btn--inactive'}`}
            onClick={() => setActiveTab('history')}
          >
            <FiClock size={16} /> Tilaushistoria
          </button>
        </div>
      )}

      <div className="account-page__content">
        {(!isConsumer || activeTab === 'profile') && (
          <>
            <AccountInfo />

            {isConsumer && (
              <section className="account-section account-page__upgrade">
                <h3 className="account-section__title">Upgrade to provider</h3>
                <p className="account-section__empty">
                  Switch your account role to provider to publish spaces, manage listings, and use provider tools.
                </p>

                {upgradeError && (
                  <p className="account-info__message account-info__message--error">{upgradeError}</p>
                )}

                <div className="account-info__actions">
                  <button
                    type="button"
                    className="btn btn--dark"
                    onClick={handleUpgradeToProvider}
                    disabled={isUpgrading}
                  >
                    {isUpgrading ? 'Upgrading...' : 'Upgrade account'}
                  </button>
                </div>
              </section>
            )}
          </>
        )}

        {isConsumer && activeTab === 'history' && (
          <div className="account-page__history">
            <section className="account-section">
              <h3 className="account-section__title">Bookings</h3>
              {bookingsLoading ? (
                <p className="account-section__empty">Loading bookings...</p>
              ) : bookingsError ? (
                <p className="account-info__message account-info__message--error">{bookingsError}</p>
              ) : (
                <BookingsComponents bookings={bookings} />
              )}
            </section>

            <section className="account-section">
              <h3 className="account-section__title">Maksuhistoria</h3>
              {paymentsLoading ? (
                <p className="account-section__empty">Loading payments history...</p>
              ) : paymentsError ? (
                <p className="account-info__message account-info__message--error">{paymentsError}</p>
              ) : (
                <PaymentsComponents payments={payments} />
              )}
            </section>
          </div>
        )}

        {!isConsumer && (
          <div className="account-page__provider-note form-section">
            <p>
              Provider accounts can edit profile details here. Order history and payment management are shown for consumer accounts.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPage;
