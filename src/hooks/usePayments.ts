import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../helpers/data/fetchData';
import { isUser } from '../helpers/types/localTypes';
import type { Payment } from 'map-hybrid-types-server';

const sortPaymentsNewestFirst = (items: Payment[]): Payment[] =>
  [...items].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

const usePayments = (enabled = true) => {
  const { user, isLoggedIn } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    if (!enabled || !isLoggedIn || !user || !isUser(user)) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const data = await api.auth.fetchPaymentsHistory(user.username);
      setPayments(sortPaymentsNewestFirst(data));
      setError(null);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load payments');
    } finally {
      setIsLoading(false);
    }
  }, [enabled, isLoggedIn, user]);

  useEffect(() => {
    void fetchPayments();
  }, [fetchPayments]);

  const handlePaymentClick = (paymentId: number) => {
    void paymentId;
  };

  return { payments, isLoading, error, handlePaymentClick, refreshPayments: fetchPayments };
};

export default usePayments;
