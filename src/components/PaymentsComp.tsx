//Components for payments and payment details + provider payment management
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { Payment } from 'map-hybrid-types-server';


const PaymentsComponents: React.FC<Payment> = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paymentsState, setPaymentsState] = useState<Payment[]>([]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch('/api/payments');
        const data = await response.json();
        setPaymentsState(data);
      } catch (error) {
        console.error('Failed to fetch payments:', error);
      }
    };

    fetchPayments();
  }, []);

  const handlePaymentClick = (paymentId: number) => {
    navigate(`/payment/${paymentId}`);
  };

  return (
    <>
      <h1>Payments</h1>
      <ul>
        {paymentsState.map((payment) => (
          <li key={payment.id} onClick={() => handlePaymentClick(payment.id)}>
            {payment.user_id === user?.id ? 'Your payment' :
            `Payment by user ${payment.user_id}`} -{payment.payment_provider} 
             `Payment by user ${payment.user_id}`
             -{payment.payment_method}- {payment.amount} - {payment.payment_status} -{payment.transaction_id} 
             {new Date(payment.created_at).toLocaleDateString()}
          </li>
        ))}
      </ul> 
    </>
  );
};

export default PaymentsComponents;