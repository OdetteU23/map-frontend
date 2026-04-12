import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../helpers/data/fetchData';
import type { Bookings } from 'map-hybrid-types-server';

const useBookings = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [bookings, setBookings] = useState<Bookings[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn || !user) return;

    let cancelled = false;

    api.media.fetchBookings()
      .then((data) => {
        if (!cancelled) {
          setBookings(data);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch bookings:', err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load bookings');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [isLoggedIn, user]);

  const handleBookingClick = (bookingId: number) => {
    navigate(`/booking/${bookingId}`);
  };

  return { bookings, isLoading, error, handleBookingClick };
};

export default useBookings;
