//Payment views
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentsComponents from '../components/PaymentsComp';
import PaymentCheckout from '../components/PaymentCheckout';
import usePayments from '../hooks/usePayments';
import { useAuth } from '../context/AuthContext';
import { isUser } from '../helpers/types/localTypes';

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY'
);

interface PaymentLocationState {
  bookingId?: number;
  amount?: number;
}

const PaymentPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as PaymentLocationState | null;
  const { payments, isLoading, error, refreshPayments } = usePayments();
  const { user } = useAuth();
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(state?.bookingId ?? null);
  const [paymentAmount, setPaymentAmount] = useState<number>(state?.amount ?? 0);

  if (isLoading) {
    return <div className="payment-page"><p>Loading...</p></div>;
  }

  const handlePaymentSuccess = () => {
    setSelectedBookingId(null);
    setPaymentAmount(0);
    refreshPayments();
  };

  return (
    <div className="payment-page">
      <h1>Maksut</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Payment history */}
      <PaymentsComponents payments={payments} />

      {/* Pay form */}
      {user && isUser(user) && (
        <div style={{ marginTop: '24px' }}>
          <h2>Uusi maksu</h2>
          <div style={{ marginBottom: '16px' }}>
            <label>
              Varauksen ID:{' '}
              <input
                type="number"
                value={selectedBookingId ?? ''}
                onChange={(e) => setSelectedBookingId(Number(e.target.value) || null)}
                placeholder="Booking ID"
                style={{ padding: '4px 8px', marginRight: '8px' }}
              />
            </label>
            <label>
              Summa (€):{' '}
              <input
                type="number"
                step="0.01"
                value={paymentAmount || ''}
                onChange={(e) => setPaymentAmount(Number(e.target.value) || 0)}
                placeholder="0.00"
                style={{ padding: '4px 8px' }}
              />
            </label>
          </div>

          {selectedBookingId && paymentAmount > 0 && (
            <Elements stripe={stripePromise}>
              <PaymentCheckout
                amount={paymentAmount}
                bookingId={selectedBookingId}
                userId={user.id}
                onPaymentSuccess={handlePaymentSuccess}
              />
            </Elements>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
