export interface Customer {
  id: string;
  name: string;
  business: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  status: string;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: number | null;
  price: number;
  active: boolean;
  created_at: string;
}

export type BookingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

export interface Booking {
  id: string;
  customer_id: string;
  service_id: string;
  date: string;
  notes: string | null;
  status: BookingStatus | string;
  created_at: string;
  service?: Service;
}

export type MessageStatus = 'Sent' | 'Read' | 'Archived';

export interface Message {
  id: string;
  customer_id: string;
  subject: string;
  body: string;
  status: MessageStatus | string;
  sent_at: string;
}

export type RequestStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

export interface CustomerRequest {
  id: string;
  customer_id: string;
  request_type: string;
  description: string;
  status: RequestStatus | string;
  created_at: string;
}

export type EmailStatus = 'Sent' | 'Delivered' | 'Failed';

export interface CustomerEmail {
  id: string;
  customer_id: string;
  subject: string;
  body: string;
  status: EmailStatus | string;
  sent_at: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string | null;
  discount: number;
  active: boolean;
  created_at: string;
}
