import React, { useEffect, useState } from 'react';
import { Notification, notificationService } from '../services/notification-service';

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((notification) => {
      setNotifications((prev) => [...prev, notification]);
    });

    return unsubscribe;
  }, []);

  const dismiss = (id: string) => {
    notificationService.dismiss(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="notification-center">
      {notifications.map((notification) => (
        <div key={notification.id} className={`notification notification-${notification.type}`}>
          <div className="notification-content">
            <h4>{notification.title}</h4>
            <p>{notification.message}</p>
            {notification.actionUrl && (
              <a href={notification.actionUrl} className="notification-action">
                {notification.actionLabel || 'View'}
              </a>
            )}
          </div>
          {notification.dismissible && (
            <button
              className="notification-close"
              onClick={() => dismiss(notification.id)}
            >
              ×
            </button>
          )}
        </div>
      ))}

      <style>{`
        .notification-center {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 10000;
          max-width: 400px;
        }
        .notification {
          padding: 16px;
          margin-bottom: 12px;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .notification-success {
          background: #ecfdf5;
          color: #065f46;
          border: 1px solid #6ee7b7;
        }
        .notification-error {
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fca5a5;
        }
        .notification-warning {
          background: #fffbeb;
          color: #92400e;
          border: 1px solid #fcd34d;
        }
        .notification-info {
          background: #eff6ff;
          color: #1e40af;
          border: 1px solid #93c5fd;
        }
        .notification h4 {
          margin: 0 0 4px 0;
          font-size: 14px;
        }
        .notification p {
          margin: 0;
          font-size: 13px;
        }
        .notification-close {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          opacity: 0.6;
          transition: opacity 0.2s;
        }
        .notification-close:hover {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};
