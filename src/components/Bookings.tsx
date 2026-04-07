//Presentational component for user bookings
import React from 'react';
import { useAuth } from '../context/AuthContext';
import type { Bookings } from 'map-hybrid-types-server';

interface BookingsComponentsProps {
  bookings: Bookings[];
  onBookingClick: (bookingId: number) => void;
}

const BookingsComponents: React.FC<BookingsComponentsProps> = ({ bookings, onBookingClick }) => {
  const { user } = useAuth();

  return (
    <>
      <h1>Bookings</h1>
      <ul>
        {bookings.map((booking) => (
          <li key={booking.id} onClick={() => onBookingClick(booking.id)}>
            {booking.user_id === user?.id ? 'Your booking' :
             `Booking by user ${booking.user_id}`} - {booking.status}
          </li>
        ))}
      </ul>
    </>
  );
};

export default BookingsComponents;