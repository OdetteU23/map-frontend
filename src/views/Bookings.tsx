import BookingsComponents from '../components/Bookings';
import PaymentsComponents from '../components/PaymentsComp';
import useBookings from '../hooks/useBookings';
import usePayments from '../hooks/usePayments';

const BookingsPage: React.FC = () => {
  const { bookings, isLoading: bookingsLoading, error: bookingsError, handleBookingClick } = useBookings();
  const { payments, isLoading: paymentsLoading, error: paymentsError, handlePaymentClick } = usePayments();

  if (bookingsLoading || paymentsLoading) {
    return <div className="bookings-page"><p>Loading...</p></div>;
  }

  return (
    <div className="bookings-page">
      {bookingsError && <p className="error">{bookingsError}</p>}
      <BookingsComponents bookings={bookings} onBookingClick={handleBookingClick} />
      {paymentsError && <p className="error">{paymentsError}</p>}
      <PaymentsComponents payments={payments} onPaymentClick={handlePaymentClick} />
    </div>
  );
};

export default BookingsPage;

