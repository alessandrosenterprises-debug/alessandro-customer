import { supabase } from '../supabaseClient';
import type { Booking } from '../types';

export async function getCustomerBookings(customerId: string) {
  return supabase
    .from('bookings')
    .select('*, service:services(*)')
    .eq('customer_id', customerId)
    .order('date', { ascending: true })
    .returns<Booking[]>();
}

export async function createBooking(input: {
  customer_id: string;
  service_id: string;
  date: string;
  notes?: string;
}) {
  return supabase
    .from('bookings')
    .insert({ ...input, status: 'Pending' })
    .select()
    .single<Booking>();
}
