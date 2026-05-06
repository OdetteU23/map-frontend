import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { isUser } from '../helpers/types/localTypes';
import { api } from '../helpers/data/fetchData';
import type { Notification as AppNotification } from 'map-hybrid-types-server';

export type NotificationType = AppNotification['type'];

const notificationLabel = (type: string): string => {
  switch (type) {
    case 'booking':
      return 'Booking related';
    case 'payment':
      return 'Payment related';
    case 'review':
      return 'Review related';
    case 'message':
      return 'Message related';
    case 'cancelation':
      return 'Cancelation related';
    case 'other':
      return 'Other notification';
    default:
      return 'Unknown notification';
  }
};

const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const isLoading = status === 'idle' || status === 'loading';

  useEffect(() => {
    if (!user || !isUser(user) || !user.username) return;

    let cancelled = false;

    api.media
      .fetchNotifications(user.username)
      .then((data) => {
        if (!cancelled) {
          setNotifications(data);
          setStatus('done');
        }
      })
      .catch((err) => {
        console.error('Failed to fetch notifications:', err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load notifications');
          setStatus('error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleNotificationClick = (notification: AppNotification) => {
    console.log('Notification clicked:', notification);
  };

  return { notifications, isLoading, error, notificationLabel, handleNotificationClick };
};

export default useNotifications;
