import { supabase } from '../supabaseClient';
import type { CustomerEmail } from '../types';

export async function getCustomerEmails(customerId: string) {
  return supabase
    .from('emails')
    .select('*')
    .eq('customer_id', customerId)
    .order('sent_at', { ascending: false })
    .returns<CustomerEmail[]>();
}

export async function createEmail(input: {
  customer_id: string;
  subject: string;
  body: string;
}) {
  return supabase
    .from('emails')
    .insert({ ...input, status: 'Sent' })
    .select()
    .single<CustomerEmail>();
}
