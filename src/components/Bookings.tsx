//Components for user bookings and booking details + provider booking management
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { Bookings } from 'map-hybrid-types-server';

const BookingsComponents: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Bookings[]>([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch('/api/bookings');
        const data = await response.json();
        setBookings(data);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      }
    };

    fetchBookings();
  }, []);

  const handleBookingClick = (bookingId: number) => {
    navigate(`/booking/${bookingId}`);
  };

    return (
        <>
            <h1>Bookings</h1>
            <ul>
                {bookings.map((booking) => (
                    <li key={booking.id} onClick={() => handleBookingClick(booking.id)}>
                        {booking.user_id === user?.id ? 'Your booking' :
                         `Booking by user ${booking.user_id}`} - {booking.status}
                    </li>
                ))}
            </ul>
        </>
    );
};

export default BookingsComponents;