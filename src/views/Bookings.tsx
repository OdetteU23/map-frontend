import { useState, type FC } from 'react';
import BookingsComponents from '../components/Bookings';
import PaymentsComponents from '../components/PaymentsComp';
import useBookings from '../hooks/useBookings';
import usePayments from '../hooks/usePayments';
import { useAuth } from '../context/AuthContext';
import { isUser } from '../helpers/types/localTypes';

type BookingsTab = 'bookings' | 'payments';

const BookingsPage: FC = () => {
  const [activeTab, setActiveTab] = useState<BookingsTab>('bookings');
  const { user } = useAuth();
  const isProvider = isUser(user) && (user.role === 'provider' || user.role === 'admin');

  const {
    bookings,
    isLoading: bookingsLoading,
    error: bookingsError,
    approveBooking,
    rejectBooking,
    cancelBooking,
  } = useBookings(activeTab === 'bookings');
  const {
    payments,
    isLoading: paymentsLoading,
    error: paymentsError,
  } = usePayments(activeTab === 'payments');

  const bookingsTabLabel = isProvider ? 'Booking' : 'Bookings';
  const paymentsTabLabel = 'Payment history';

  return (
    <div className="bookings-page">
      <div className="bookings-page__tabs auth-tabs">
        <button
          type="button"
          className={`auth-tabs__btn ${activeTab === 'bookings' ? 'auth-tabs__btn--active' : 'auth-tabs__btn--inactive'}`}
          onClick={() => setActiveTab('bookings')}
        >
          {bookingsTabLabel}
        </button>
        <button
          type="button"
          className={`auth-tabs__btn ${activeTab === 'payments' ? 'auth-tabs__btn--active' : 'auth-tabs__btn--inactive'}`}
          onClick={() => setActiveTab('payments')}
        >
          {paymentsTabLabel}
        </button>
      </div>

      <div className="bookings-page__panel">
        {activeTab === 'bookings' && (
          <>
            {bookingsLoading ? (
              <p className="bookings-page__state">Loading bookings...</p>
            ) : (
              <>
                {bookingsError && <p className="bookings-page__error">{bookingsError}</p>}
                <BookingsComponents
                  bookings={bookings}
                  onApproveBooking={approveBooking}
                  onRejectBooking={rejectBooking}
                  onCancelBooking={cancelBooking}
                />
              </>
            )}
          </>
        )}

        {activeTab === 'payments' && (
          <>
            {paymentsLoading ? (
              <p className="bookings-page__state">Loading payments history...</p>
            ) : (
              <>
                {paymentsError && <p className="bookings-page__error">{paymentsError}</p>}
                <PaymentsComponents payments={payments} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BookingsPage;
