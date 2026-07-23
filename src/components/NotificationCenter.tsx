import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useRealtimeTable } from '../hooks/useRealtimeTable';
import type { Booking, CustomerRequest, Promotion } from '../types';

/**
 * Invisible component: subscribes to Realtime changes relevant to the
 * logged-in customer and surfaces them as toast notifications.
 * Mount once near the root of the authenticated app.
 *
 * Covers exactly the events required by the integration checklist:
 * booking created, message received, request submitted, promotion activated.
 * (Email is intentionally not included here — see Emails.tsx, which gives
 * its own direct confirmation since it isn't part of this notification set.)
 */
export function NotificationCenter() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const filter = user ? `customer_id=eq.${user.id}` : undefined;

  useRealtimeTable<Booking>(
    'bookings',
    (payload) => {
      if (payload.eventType === 'INSERT') {
        showToast('success', 'Booking created', 'Your booking request was received.');
      }
      if (payload.eventType === 'UPDATE' && payload.new) {
        showToast(
          'info',
          'Booking updated',
          `Your booking status is now "${payload.new.status}".`
        );
      }
    },
    filter
  );

  useRealtimeTable(
    'messages',
    (payload) => {
      if (payload.eventType === 'INSERT') {
        showToast('success', 'Message received', 'Your message was sent successfully.');
      }
    },
    filter
  );

  useRealtimeTable<CustomerRequest>(
    'requests',
    (payload) => {
      if (payload.eventType === 'INSERT') {
        showToast('success', 'Request submitted', 'Your request has been logged.');
      }
      if (payload.eventType === 'UPDATE' && payload.new) {
        showToast(
          'info',
          'Request updated',
          `Your request status is now "${payload.new.status}".`
        );
      }
    },
    filter
  );

  useRealtimeTable<Promotion>('promotions', (payload) => {
    if (
      (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') &&
      payload.new?.active
    ) {
      showToast(
        'info',
        'Promotion activated',
        payload.new.title ?? 'Check out our latest offer!'
      );
    }
  });

  return null;
}
