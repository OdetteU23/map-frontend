// Presentational component for payments
import React from 'react';
import type { Payment } from 'map-hybrid-types-server';

interface PaymentsComponentsProps {
  payments: Payment[];
  title?: string;
  emptyMessage?: string;
}

const statusColor: Record<string, string> = {
  completed: '#5cb85c',
  pending: '#f0ad4e',
  failed: '#d9534f',
  refunded: '#5bc0de',
};

const PaymentsComponents: React.FC<PaymentsComponentsProps> = ({
  payments,
  title = 'Maksuhistoria',
  emptyMessage = 'Ei maksutapahtumia.',
}) => {
  return (
    <section className="payments-history">
      <h2 className="payments-history__title">{title}</h2>

      {payments.length === 0 ? (
        <p className="payments-history__empty">{emptyMessage}</p>
      ) : (
        <ul className="payments-history__items">
          {payments.map((payment) => (
            <li key={payment.id} className="payments-history__item">
              <div className="payments-history__item-main">
                <strong className="payments-history__amount">
                  {payment.amount} {payment.currency}
                </strong>
                <span className="payments-history__method">
                  {payment.payment_method} — {payment.payment_provider}
                </span>
              </div>

              <div className="payments-history__item-meta">
                <div className="payments-history__reference">Booking ID: {payment.booking_id}</div>
                <div className="payments-history__reference">User ID: {payment.user_id}</div>
                <span
                  className="payments-history__status"
                  style={{
                    backgroundColor: statusColor[payment.payment_status] || '#999',
                  }}
                >
                  {payment.payment_status}
                </span>
                <span className="payments-history__date">
                  {new Date(payment.created_at).toLocaleDateString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default PaymentsComponents;
