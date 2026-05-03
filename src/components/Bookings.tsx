import React from 'react';
import { FiCheck, FiClock, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { isUser } from '../helpers/types/localTypes';
import type { Bookings } from 'map-hybrid-types-server';

interface BookingsComponentsProps {
  bookings: Bookings[];
  onApproveBooking?: (booking: Bookings) => void | Promise<void>;
  onRejectBooking?: (booking: Bookings) => void | Promise<void>;
  onCancelBooking?: (booking: Bookings) => void | Promise<void>;
}

const formatDateTime = (value?: string | Date): string => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('fi-FI');
};

const formatStatus = (status?: string): string => {
  if (!status) {
    return 'Unknown';
  }

  switch (status.toLowerCase()) {
    case 'pending':
      return 'Pending';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'canceled':
    case 'cancelled':
      return 'Canceled';
    default:
      return status;
  }
};

const isPendingStatus = (status?: string): boolean => status?.toLowerCase() === 'pending';

const BookingsComponents: React.FC<BookingsComponentsProps> = ({
  bookings,
  onApproveBooking,
  onRejectBooking,
  onCancelBooking,
}) => {
  const { user } = useAuth();
  const isProvider = isUser(user) && (user.role === 'provider' || user.role === 'admin');

  return (
    <section className="bookings-list">
      <h2 className="bookings-list__title">Bookings</h2>

      {bookings.length === 0 ? (
        <p className="bookings-list__empty">No bookings found.</p>
      ) : (
        <ul className="bookings-list__items">
          {bookings.map((booking) => {
            const canManageBooking = isProvider && isPendingStatus(booking.status);
            const canCancelBooking = !isProvider && user?.id === booking.user_id && isPendingStatus(booking.status);

            return (
              <li key={booking.id} className="bookings-list__item">
                <div className="bookings-list__item-main">
                  <div className="bookings-list__item-heading">
                    <strong className="bookings-list__item-label">
                      {user?.id === booking.user_id
                        ? 'Your booking'
                        : isProvider
                          ? `Customer booking #${booking.id}`
                          : `Booking #${booking.id}`}
                    </strong>
                    <span
                      className={`bookings-list__item-status bookings-list__item-status--${String(
                        booking.status,
                      ).toLowerCase()}`}
                    >
                      {formatStatus(booking.status)}
                    </span>
                  </div>

                  <div className="bookings-list__item-meta">
                    <div>Booking ID: {booking.id}</div>
                    <div>Space ID: {booking.space_id ?? '—'}</div>
                    {isProvider && <div>Consumer ID: {booking.user_id ?? '—'}</div>}
                    {'created_at' in booking && (
                      <div>Requested: {formatDateTime((booking as { created_at?: string | Date }).created_at)}</div>
                    )}
                    {'start_time' in booking && (
                      <div>Start: {formatDateTime((booking as { start_time?: string | Date }).start_time)}</div>
                    )}
                    {'end_time' in booking && (
                      <div>End: {formatDateTime((booking as { end_time?: string | Date }).end_time)}</div>
                    )}
                  </div>
                </div>

                {(canManageBooking || canCancelBooking) && (
                  <div className="bookings-list__actions">
                    {canManageBooking && (
                      <>
                        <button
                          type="button"
                          className="bookings-list__action-btn bookings-list__action-btn--approve"
                          onClick={() => void onApproveBooking?.(booking)}
                        >
                          <FiCheck size={16} />
                          Approve
                        </button>
                        <button
                          type="button"
                          className="bookings-list__action-btn bookings-list__action-btn--reject"
                          onClick={() => void onRejectBooking?.(booking)}
                        >
                          <FiX size={16} />
                          Reject
                        </button>
                        <button
                          type="button"
                          className="bookings-list__action-btn bookings-list__action-btn--cancel"
                          onClick={() => void onCancelBooking?.(booking)}
                        >
                          <FiClock size={16} />
                          Cancel
                        </button>
                      </>
                    )}

                    {canCancelBooking && (
                      <button
                        type="button"
                        className="bookings-list__action-btn bookings-list__action-btn--cancel"
                        onClick={() => void onCancelBooking?.(booking)}
                      >
                        <FiClock size={16} />
                        Cancel booking
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default BookingsComponents;
