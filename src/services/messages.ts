import { supabase } from '../supabaseClient';
import type { Message } from '../types';

export async function getCustomerMessages(customerId: string) {
  return supabase
    .from('messages')
    .select('*')
    .eq('customer_id', customerId)
    .order('sent_at', { ascending: false })
    .returns<Message[]>();
}

export async function createMessage(input: {
  customer_id: string;
  subject: string;
  body: string;
}) {
  return supabase
    .from('messages')
    .insert({ ...input, status: 'Sent' })
    .select()
    .single<Message>();
}
