import BookingsComponents from '../components/Bookings';
import PaymentsComponents from '../components/PaymentsComp';
import useBookings from '../hooks/useBookings';
import usePayments from '../hooks/usePayments';

const BookingsPage: React.FC = () => {
  const { bookings, handleBookingClick } = useBookings();
  const { payments, handlePaymentClick } = usePayments();

  return (
    <div className="bookings-page">
      <BookingsComponents bookings={bookings} onBookingClick={handleBookingClick} />
      <PaymentsComponents payments={payments} onPaymentClick={handlePaymentClick} />
    </div>
  );
};

export default BookingsPage;

