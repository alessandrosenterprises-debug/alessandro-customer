// Notification Service - Handles push notifications and alerts

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  actionUrl?: string;
  actionLabel?: string;
  dismissible?: boolean;
}

export type NotificationListener = (notification: Notification) => void;

export class NotificationService {
  private listeners = new Set<NotificationListener>();
  private notifications = new Map<string, Notification>();
  private eventSource?: EventSource;
  private apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  subscribe(callback: NotificationListener): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify(notification: Notification): void {
    this.notifications.set(notification.id, notification);
    this.listeners.forEach((listener) => listener(notification));
  }

  show(
    type: Notification['type'],
    title: string,
    message: string,
    options?: {
      actionUrl?: string;
      actionLabel?: string;
      dismissible?: boolean;
      duration?: number;
    }
  ): string {
    const id = Math.random().toString(36).slice(2);
    const notification: Notification = {
      id,
      type,
      title,
      message,
      timestamp: new Date(),
      actionUrl: options?.actionUrl,
      actionLabel: options?.actionLabel,
      dismissible: options?.dismissible !== false,
    };

    this.notify(notification);

    // Auto-dismiss after duration
    if (options?.duration) {
      setTimeout(() => this.dismiss(id), options.duration);
    }

    return id;
  }

  success(title: string, message: string, options?: any): string {
    return this.show('success', title, message, options);
  }

  error(title: string, message: string, options?: any): string {
    return this.show('error', title, message, options);
  }

  warning(title: string, message: string, options?: any): string {
    return this.show('warning', title, message, options);
  }

  info(title: string, message: string, options?: any): string {
    return this.show('info', title, message, options);
  }

  dismiss(id: string): void {
    this.notifications.delete(id);
  }

  getAll(): Notification[] {
    return Array.from(this.notifications.values());
  }

  // Connect to server-sent events for real-time notifications
  connectToServer(token: string): void {
    if (this.eventSource) {
      this.eventSource.close();
    }

    this.eventSource = new EventSource(
      `${this.apiUrl}/api/notifications/subscribe?token=${encodeURIComponent(token)}`
    );

    this.eventSource.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        this.notify({
          ...notification,
          timestamp: new Date(notification.timestamp),
        });
      } catch (error) {
        console.error('Failed to parse notification:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      this.eventSource?.close();
    };
  }

  disconnect(): void {
    this.eventSource?.close();
  }
}

export const notificationService = new NotificationService();
