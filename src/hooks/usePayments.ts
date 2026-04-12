import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../helpers/data/fetchData';
import { isUser } from '../helpers/types/localTypes';
import type { Payment } from 'map-hybrid-types-server';

const usePayments = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn || !user || !isUser(user)) return;

    let cancelled = false;

    api.auth.fetchPaymentsHistory(user.username)
      .then((data) => {
        if (!cancelled) {
          setPayments(data);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch payments:', err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load payments');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [isLoggedIn, user]);

  const handlePaymentClick = (paymentId: number) => {
    navigate(`/payment/${paymentId}`);
  };

  return { payments, isLoading, error, handlePaymentClick };
};

export default usePayments;
