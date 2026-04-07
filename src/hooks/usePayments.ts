import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Payment } from 'map-hybrid-types-server';

const usePayments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch('/api/payments');
        const data = await response.json();
        setPayments(data);
      } catch (error) {
        console.error('Failed to fetch payments:', error);
      }
    };

    fetchPayments();
  }, []);

  const handlePaymentClick = (paymentId: number) => {
    navigate(`/payment/${paymentId}`);
  };

  return { payments, handlePaymentClick };
};

export default usePayments;
