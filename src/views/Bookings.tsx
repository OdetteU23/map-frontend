import BookingsComponents from '../components/Bookings';
import PaymentsComponents from '../components/PaymentsComp';

const BookingsPage: React.FC = () => {
  return (
    <div className="bookings-page">
      <BookingsComponents />
      <PaymentsComponents       id={0} booking_id={0} user_id={any} amount={0} currency={''} 
      payment_method={'credit_card'} payment_status={'pending'} payment_provider={''} transaction_id={''} 
      created_at={new Date()} />

    </div>
  );
};

export default BookingsPage;

