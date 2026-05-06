import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { isUser } from '../helpers/types/localTypes';
import { api } from '../helpers/data/fetchData';
import type { Bookings, Space } from 'map-hybrid-types-server';

type BookingStatusAction = 'approved' | 'rejected' | 'canceled';
type BookingRecord = Bookings & {
  created_at?: string | Date;
  space_id?: number | string;
  user_id?: number | string;
};

const BOOKING_NOTIFICATION_TYPE = 'booking' as const;

const bookingStatusLabel: Record<BookingStatusAction, string> = {
  approved: 'hyväksytty',
  rejected: 'hylätty',
  canceled: 'peruttu',
};

const toNumericId = (value: unknown): number | null => {
  const numeric = typeof value === 'number' ? value : Number(value);
  return Number.isNaN(numeric) ? null : numeric;
};

const getBookingTimestamp = (booking: BookingRecord): number => {
  const createdAt = booking.created_at;
  if (createdAt) {
    const parsed = new Date(createdAt).getTime();
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  const fallback = Number(booking.id);
  return Number.isNaN(fallback) ? 0 : fallback;
};

const sortBookingsNewestFirst = (items: Bookings[]): Bookings[] =>
  [...items].sort((a, b) => getBookingTimestamp(b as BookingRecord) - getBookingTimestamp(a as BookingRecord));

const useBookings = (enabled = true) => {
  const { user, isLoggedIn } = useAuth();
  const [bookings, setBookings] = useState<Bookings[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const notifyBookingStatusChange = useCallback(
    async (booking: Bookings, status: BookingStatusAction) => {
      if (!user || !isUser(user)) {
        return;
      }

      const isProvider = user.role === 'provider' || user.role === 'admin';
      const recipientId = isProvider
        ? toNumericId((booking as BookingRecord).user_id)
        : await (async () => {
            const spaceId = toNumericId((booking as BookingRecord).space_id);
            if (spaceId == null) {
              return undefined;
            }

            try {
              const space = await api.media.fetchSpaceById(spaceId);
              return toNumericId((space as Space & { owner_id?: number | string; ownerId?: number | string }).owner_id)
                ?? toNumericId((space as Space & { owner_id?: number | string; ownerId?: number | string }).ownerId);
            } catch (fetchError) {
              console.error('Failed to resolve booking owner for notification:', fetchError);
              return undefined;
            }
          })();

      if (recipientId == null) {
        return;
      }

      const content = isProvider
        ? `Varauspyyntö #${booking.id} on ${bookingStatusLabel[status]}.`
        : `Varauspyyntö #${booking.id} on peruttu.`;

      try {
        await api.media.sendMessage({
          sender_id: user.id,
          receiver_id: recipientId,
          content,
        });
      } catch (messageError) {
        console.error('Failed to send booking status message:', messageError);
      }

      try {
        await api.media.createNotification({
          user_id: recipientId,
          type: BOOKING_NOTIFICATION_TYPE,
          content,
        });
      } catch (notificationError) {
        console.error('Failed to create booking notification:', notificationError);
      }
    },
    [user],
  );

  const fetchBookings = useCallback(async () => {
    if (!enabled || !isLoggedIn || !user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const data = await api.media.fetchBookings();

      if (isUser(user) && user.role === 'consumer') {
        const consumerId = toNumericId(user.id);
        setBookings(
          sortBookingsNewestFirst(
            consumerId == null
              ? []
              : data.filter((booking) => toNumericId((booking as BookingRecord).user_id) === consumerId),
          ),
        );
      } else if (isUser(user) && (user.role === 'provider' || user.role === 'admin')) {
        if (user.role === 'admin') {
          setBookings(sortBookingsNewestFirst(data));
        } else {
          try {
            const spaces = await api.media.fetchSpaces();
            const providerId = toNumericId(user.id);
            const providerSpaceIds = new Set(
              spaces
                .filter((space) => toNumericId((space as Space & { owner_id?: number | string }).owner_id) === providerId)
                .map((space) => toNumericId(space.id))
                .filter((spaceId): spaceId is number => spaceId != null),
            );
            const providerBookings = data.filter(
              (booking) => {
                const bookingSpaceId = toNumericId((booking as BookingRecord).space_id);
                return bookingSpaceId != null && providerSpaceIds.has(bookingSpaceId);
              },
            );
            setBookings(sortBookingsNewestFirst(providerBookings.length > 0 ? providerBookings : data));
          } catch (spaceError) {
            console.error('Failed to fetch provider spaces for bookings:', spaceError);
            setBookings(sortBookingsNewestFirst(data));
          }
        }
      } else {
        setBookings(sortBookingsNewestFirst(data));
      }

      setError(null);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  }, [enabled, isLoggedIn, user]);

  useEffect(() => {
    void fetchBookings();
  }, [fetchBookings]);

  const changeBookingStatus = useCallback(
    async (booking: Bookings, status: BookingStatusAction): Promise<void> => {
      setError(null);

      try {
        await api.media.updateBookingStatus(booking.id, status);
        await notifyBookingStatusChange(booking, status);
        await fetchBookings();
      } catch (err) {
        console.error('Failed to update booking status:', err);
        setError(err instanceof Error ? err.message : 'Failed to update booking status');
        throw err;
      }
    },
    [fetchBookings, notifyBookingStatusChange],
  );

  const approveBooking = useCallback(
    async (booking: Bookings) => changeBookingStatus(booking, 'approved'),
    [changeBookingStatus],
  );

  const rejectBooking = useCallback(
    async (booking: Bookings) => changeBookingStatus(booking, 'rejected'),
    [changeBookingStatus],
  );

  const cancelBooking = useCallback(
    async (booking: Bookings) => changeBookingStatus(booking, 'canceled'),
    [changeBookingStatus],
  );

  return {
    bookings,
    isLoading,
    error,
    refreshBookings: fetchBookings,
    approveBooking,
    rejectBooking,
    cancelBooking,
  };
};

export default useBookings;
