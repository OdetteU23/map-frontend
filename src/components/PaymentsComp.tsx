//Presentational component for payments
import React from 'react';
import { useAuth } from '../context/AuthContext';
import type { Payment } from 'map-hybrid-types-server';

interface PaymentsComponentsProps {
  payments: Payment[];
  onPaymentClick: (paymentId: number) => void;
}

const PaymentsComponents: React.FC<PaymentsComponentsProps> = ({ payments, onPaymentClick }) => {
  const { user } = useAuth();

  return (
    <>
      <h1>Payments</h1>
      <ul>
        {payments.map((payment) => (
          <li key={payment.id} onClick={() => onPaymentClick(payment.id)}>
            {payment.user_id === user?.id ? 'Your payment' :
            `Payment by user ${payment.user_id}`} -{payment.payment_provider}
             -{payment.payment_method}- {payment.amount} - {payment.payment_status} -{payment.transaction_id}
             {new Date(payment.created_at).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </>
  );
};

export default PaymentsComponents;