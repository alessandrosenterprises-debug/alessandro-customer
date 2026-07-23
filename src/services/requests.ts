import { supabase } from '../supabaseClient';
import type { CustomerRequest } from '../types';

export async function getCustomerRequests(customerId: string) {
  return supabase
    .from('requests')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .returns<CustomerRequest[]>();
}

export async function createRequest(input: {
  customer_id: string;
  request_type: string;
  description: string;
}) {
  return supabase
    .from('requests')
    .insert({ ...input, status: 'Open' })
    .select()
    .single<CustomerRequest>();
}
