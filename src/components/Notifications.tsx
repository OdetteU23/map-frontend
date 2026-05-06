// Pure presentational component — all logic lives in useNotifications hook
import React from 'react';
import type { Notification as AppNotification } from 'map-hybrid-types-server';

type NotificationsCompProps = {
  notifications: AppNotification[];
  isLoading: boolean;
  error: string | null;
  notificationLabel: (type: string) => string;
  onNotificationClick: (notification: AppNotification) => void;
};

const NotificationsComp: React.FC<NotificationsCompProps> = ({
  notifications,
  isLoading,
  error,
  notificationLabel,
  onNotificationClick,
}) => {
  if (isLoading) {
    return (
      <div className="notifications-page">
        <h1 className="notifications-page__title">Notifications</h1>
        <p className="auth-loading">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notifications-page">
        <h1 className="notifications-page__title">Notifications</h1>
        <p className="messages-list__error">{error}</p>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <h1 className="notifications-page__title">Notifications</h1>
      {notifications.length === 0 ? (
        <p className="messages-list__empty">No notifications found.</p>
      ) : (
        <ul className="messages-list">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className="message-item"
              onClick={() => onNotificationClick(notification)}
            >
              <div className="message-item__content">
                <div className="message-item__header">
                  <span className="message-item__name">
                    {notificationLabel(notification.type)}
                  </span>
                  <span className="message-item__time">
                    {new Date(notification.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="message-item__preview">{notification.content}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationsComp;
