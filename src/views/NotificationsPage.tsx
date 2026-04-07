//NotificationsPage.tsx
import NotificationsComp from '../components/Notifications';
import useNotifications from '../hooks/useNotifications';

const NotificationsPage: React.FC = () => {
  const { notifications, isLoading, error, notificationLabel, handleNotificationClick } =
    useNotifications();

  return (
    <NotificationsComp
      notifications={notifications}
      isLoading={isLoading}
      error={error}
      notificationLabel={notificationLabel}
      onNotificationClick={handleNotificationClick}
    />
  );
};

export default NotificationsPage;
