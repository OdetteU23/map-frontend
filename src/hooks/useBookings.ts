import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Bookings } from 'map-hybrid-types-server';

const useBookings = () => {
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

  return { bookings, handleBookingClick };
};

export default useBookings;
