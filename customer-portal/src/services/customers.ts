import { supabase } from '../supabaseClient';
import type { Customer } from '../types';

export async function getCustomer(id: string) {
  return supabase.from('customers').select('*').eq('id', id).maybeSingle<Customer>();
}

/**
 * Fetches the customer row, retrying briefly if it isn't there yet.
 *
 * The `customers` row is created by a database trigger when the Auth user
 * is created (see supabase/migrations/0001_init.sql). That trigger runs
 * asynchronously relative to the client, so a profile fetch immediately
 * after signup/login can race it. This does NOT insert into `customers`
 * itself — it only waits for the trigger's row to become visible.
 */
export async function getCustomerWithRetry(
  id: string,
  attempts = 5,
  delayMs = 600
) {
  let lastError: unknown = null;

  for (let i = 0; i < attempts; i++) {
    const { data, error } = await getCustomer(id);

    if (data) {
      return { data, error: null };
    }

    lastError = error;

    if (i < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return { data: null, error: lastError };
}

export async function updateCustomer(id: string, updates: Partial<Customer>) {
  return supabase.from('customers').update(updates).eq('id', id).select().single<Customer>();
}
